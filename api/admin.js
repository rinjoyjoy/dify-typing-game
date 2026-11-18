const { query } = require('./db');
const { summaryRows, safeEqual, HEXAD_ORDER } = require('./_summary');

/* 研究者用ページ（admin.html）から呼ぶ管理用API。合言葉は RESEARCH_EXPORT_KEY（CSVダウンロードと同じ）
   GET  /api/admin?key=…                         … 件数・進捗・群ごとの集計・参加者一覧
   GET  /api/admin?key=…&action=detail&id=…      … アンケート回答1件の詳細（回答・AIとの会話・時刻など）
   POST /api/admin { key, action:'delete', confirm:'削除する', scope, … }
        scope='since'     + since:'YYYY-MM-DD'      … その日（日本時間）以降の記録を削除
        scope='all'                                  … すべて削除
        scope='entry'     + entryId / responseId     … 1回の参加の記録だけ削除
        scope='pid_range' + from, to                 … 参加者番号の範囲（例：900〜999のテスト）を削除 */

const CONDITION = { A: 'AI対話', B: 'アンケート', C: '診断なし' };

async function counts() {
  const s = await query(`SELECT COUNT(*)::int AS n, MIN(created_at) AS first, MAX(created_at) AS last FROM typing_sessions`);
  const r = await query(`SELECT COUNT(*)::int AS n, MIN(created_at) AS first, MAX(created_at) AS last FROM survey_responses`);
  return { sessions: s.rows[0], surveys: r.rows[0] };
}

// 空欄（''・null）は除いて平均する
function avg(rows, key) {
  const v = rows.map((r) => r[key]).filter((x) => x !== '' && x !== null && x !== undefined).map(Number).filter(Number.isFinite);
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100 : null;
}
function rate(rows, key) {
  const v = rows.map((r) => r[key]).filter((x) => x === 0 || x === 1);
  return v.length ? Math.round((v.filter((x) => x === 1).length / v.length) * 1000) / 10 : null;
}

async function overview() {
  const { rows } = await summaryRows();
  const responded = rows.map((r) => ({
    kind: 'responded',
    response_id: r.response_id,
    participant_id: r.participant_id,
    entry_id: r.entry_id,
    group: r.group,
    condition: r.condition || CONDITION[r.group] || '',
    submitted_at: r.submitted_at,
    pid_duplicates: r.pid_duplicates,
    n_sessions: r.n_sessions,
    total_play_sec: r.total_play_sec,
    prestart_sec: r.prestart_sec,
    diagnosis_sec: r.diagnosis_sec,
    free_play_sec: r.free_play_sec,
    n_resumes: r.n_resumes,
    assigned_type: r.assigned_type,
    hex_top_types: r.hex_top_types,
    assigned_is_top: r.assigned_is_top,
    assigned_in_top2: r.assigned_in_top2,
    spearman: r.spearman_assigned_vs_hex,
    ai_item_mae: r.ai_item_mae,
    ONB: r.ONB_mean, FIT: r.FIT_mean, ENJ: r.ENJ_mean, RET: r.RET_mean, RED: r.RED_mean,
    chat_turns: r.chat_turns,
    S1: r.S1, S2: r.S2, S3: r.S3, S4: r.S4, EXP: r.EXP, CMP1: r.CMP1,
    n_free_continue: r.n_free_continue, n_games_started: r.n_games_started,
  }));

  // プレイ記録はあるがアンケートが届いていない参加（途中でやめた・回答中）
  const respondedKeys = new Set();
  responded.forEach((r) => { if (r.entry_id) respondedKeys.add(String(r.entry_id)); respondedKeys.add(`pid:${r.participant_id}`); });
  const play = (await query(`
    SELECT COALESCE(entry_id, 'pid:' || participant_id) AS play_key, MAX(entry_id) AS entry_id,
      MAX(participant_id) AS participant_id, MAX(participant_group) AS participant_group,
      COUNT(*)::int AS n_sessions, SUM(elapsed_sec) AS total_play_sec,
      MIN(created_at) AS first_at, MAX(created_at) AS last_at
    FROM typing_sessions
    WHERE participant_id IS NOT NULL OR entry_id IS NOT NULL
    GROUP BY COALESCE(entry_id, 'pid:' || participant_id)
  `)).rows;
  const unfinished = play
    .filter((p) => !respondedKeys.has(String(p.play_key)) && !(p.entry_id == null && respondedKeys.has(`pid:${p.participant_id}`)))
    .map((p) => ({
      kind: 'unfinished',
      participant_id: p.participant_id,
      entry_id: p.entry_id,
      group: p.participant_group,
      condition: CONDITION[p.participant_group] || '',
      n_sessions: p.n_sessions,
      total_play_sec: p.total_play_sec != null ? Math.round(Number(p.total_play_sec)) : null,
      first_at: p.first_at, last_at: p.last_at,
    }));

  // 群ごとの集計（回答済みのみ）
  const groups = ['A', 'B', 'C'].map((g) => {
    const rs = responded.filter((r) => r.group === g);
    return {
      group: g, condition: CONDITION[g], n: rs.length,
      ONB: avg(rs, 'ONB'), FIT: avg(rs, 'FIT'), ENJ: avg(rs, 'ENJ'), RET: avg(rs, 'RET'), RED: avg(rs, 'RED'),
      prestart_sec: avg(rs, 'prestart_sec'), diagnosis_sec: avg(rs, 'diagnosis_sec'),
      total_play_sec: avg(rs, 'total_play_sec'), free_play_sec: avg(rs, 'free_play_sec'),
      top1_rate: rate(rs, 'assigned_is_top'), top2_rate: rate(rs, 'assigned_in_top2'),
      spearman: avg(rs, 'spearman'), ai_item_mae: avg(rs, 'ai_item_mae'),
      unfinished: unfinished.filter((u) => u.group === g).length,
    };
  });

  // 次に配る番号（これまでに使われた最大の番号＋1。900番台以上はテストとして除く）
  const usedPids = [...responded, ...unfinished].map((r) => Number(r.participant_id)).filter((n) => Number.isInteger(n) && n > 0 && n < 900);
  const nextPid = (usedPids.length ? Math.max(...usedPids) : 0) + 1;
  const nextGroup = nextPid % 3 === 1 ? 'A' : nextPid % 3 === 2 ? 'B' : 'C';

  return { counts: await counts(), groups, responded, unfinished, next: { pid: nextPid, group: nextGroup, condition: CONDITION[nextGroup] }, hexadOrder: HEXAD_ORDER };
}

async function detail(id) {
  const r = await query(`SELECT id, participant_id, entry_id, participant_group, condition, created_at, answers, payload FROM survey_responses WHERE id = $1`, [id]);
  return r.rows[0] || null;
}

module.exports = async function handler(req, res) {
  const secret = process.env.RESEARCH_EXPORT_KEY;
  if (!secret) return res.status(500).json({ error: 'not_configured' });

  const body = req.method === 'POST' ? (req.body || {}) : {};
  const key = req.method === 'POST' ? body.key : (req.query && req.query.key);
  if (!key || !safeEqual(key, secret)) return res.status(403).json({ error: 'forbidden' });

  try {
    if (req.method === 'GET') {
      const action = (req.query && req.query.action) || 'overview';
      if (action === 'detail') {
        const id = Number(req.query.id);
        if (!Number.isInteger(id)) return res.status(400).json({ error: 'bad_id' });
        const d = await detail(id);
        return d ? res.status(200).json({ success: true, detail: d }) : res.status(404).json({ error: 'not_found' });
      }
      return res.status(200).json({ success: true, ...(await overview()) });
    }

    if (req.method !== 'POST' || body.action !== 'delete') return res.status(400).json({ error: 'bad_request' });
    if (body.confirm !== '削除する') return res.status(400).json({ error: 'confirm_required' });

    let ds = 0, dr = 0;
    if (body.scope === 'all') {
      ds = (await query(`DELETE FROM typing_sessions`)).rowCount;
      dr = (await query(`DELETE FROM survey_responses`)).rowCount;
    } else if (body.scope === 'since' && /^\d{4}-\d{2}-\d{2}$/.test(String(body.since || ''))) {
      const cond = `created_at >= ($1::date)::timestamp AT TIME ZONE 'Asia/Tokyo'`;
      ds = (await query(`DELETE FROM typing_sessions WHERE ${cond}`, [body.since])).rowCount;
      dr = (await query(`DELETE FROM survey_responses WHERE ${cond}`, [body.since])).rowCount;
    } else if (body.scope === 'entry' && (body.entryId || body.responseId)) {
      if (body.entryId) {
        ds = (await query(`DELETE FROM typing_sessions WHERE entry_id = $1`, [String(body.entryId)])).rowCount;
        dr = (await query(`DELETE FROM survey_responses WHERE entry_id = $1`, [String(body.entryId)])).rowCount;
      }
      if (body.responseId) {
        dr += (await query(`DELETE FROM survey_responses WHERE id = $1`, [Number(body.responseId)])).rowCount;
      }
    } else if (body.scope === 'pid_range' && Number.isInteger(Number(body.from)) && Number.isInteger(Number(body.to)) && Number(body.from) <= Number(body.to)) {
      const cond = `participant_id ~ '^[0-9]+$' AND participant_id::bigint BETWEEN $1 AND $2`;
      ds = (await query(`DELETE FROM typing_sessions WHERE ${cond}`, [Number(body.from), Number(body.to)])).rowCount;
      dr = (await query(`DELETE FROM survey_responses WHERE ${cond}`, [Number(body.from), Number(body.to)])).rowCount;
    } else {
      return res.status(400).json({ error: 'bad_scope' });
    }
    return res.status(200).json({ success: true, deletedSessions: ds, deletedSurveys: dr });
  } catch (err) {
    console.error('admin error:', err);
    return res.status(500).json({ error: 'failed' });
  }
};
