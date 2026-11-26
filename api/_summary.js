const crypto = require('crypto');
/* 集計の共通処理（export.js と admin.js から使う）。ファイル名が _ で始まるので、Vercel ではAPIとして公開されない */
const { query } = require('./db');
const PostSurvey = require('../post-survey-items.js');

const HEXAD_ORDER = ['achiever', 'player', 'socialiser', 'freeSpirit', 'philanthropist', 'disruptor'];
const EVENT_COLS = ['entry', 't0Start', 't0Submit', 'onboardingStart', 'onboardingEnd', 't1Start', 't1Submit', 'firstGameStart', 'freeChoiceShown', 'surveyStart', 'surveySubmit', 'extraPlayChosen', 'extraPlayStart', 'finished'];
const COUNT_COLS = ['n_games_started', 'n_post_survey_games', 'n_clear', 'n_fail', 'n_rediagnose_clicked', 'n_rediagnose_done', 'n_resumes'];
// 途中経過の送信（T0・T1）と最後の送信（final）。参加IDごとに、いちばん進んだ送信を1行として使う
const STAGE_RANK = { T0: 1, T1: 2, final: 3 };

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(header, rows) {
  return '﻿' + [header.map(csvCell).join(','), ...rows.map((r) => header.map((h) => csvCell(r[h])).join(','))].join('\r\n');
}

function mean(nums) {
  const v = nums.filter((n) => typeof n === 'number' && Number.isFinite(n));
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 1000) / 1000 : null;
}
// 全項目が有効（数値）な場合だけ平均する。判断できない（DK）・該当しない（NA）・比較できない（NC）・空欄が1つでもあれば null
function meanAll(nums) {
  return nums.length && nums.every((n) => typeof n === 'number' && Number.isFinite(n)) ? mean(nums) : null;
}
function secBetween(a, b) {
  if (!a || !b) return null;
  const d = (Date.parse(b) - Date.parse(a)) / 1000;
  return Number.isFinite(d) ? Math.round(d * 10) / 10 : null;
}
function ranks(values) {
  // 同順位は平均順位（大きい値ほど順位1）
  const idx = values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
  const r = new Array(values.length);
  for (let k = 0; k < idx.length;) {
    let j = k;
    while (j + 1 < idx.length && idx[j + 1].v === idx[k].v) j++;
    const avg = (k + j) / 2 + 1;
    for (let m = k; m <= j; m++) r[idx[m].i] = avg;
    k = j + 1;
  }
  return r;
}
function spearman(x, y) {
  const rx = ranks(x), ry = ranks(y);
  const mx = rx.reduce((a, b) => a + b, 0) / rx.length;
  const my = ry.reduce((a, b) => a + b, 0) / ry.length;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < rx.length; i++) {
    num += (rx[i] - mx) * (ry[i] - my);
    dx += (rx[i] - mx) ** 2;
    dy += (ry[i] - my) ** 2;
  }
  return dx && dy ? Math.round((num / Math.sqrt(dx * dy)) * 1000) / 1000 : null;
}

async function summaryRows() {
  // 1回答＝1行（同じ参加者番号の回答が複数あっても、上書き・統合せずにすべて出す。pid_duplicates で確認できる）
  const allSurveys = (await query(`
    SELECT id, participant_id, entry_id, participant_group, condition, answers, payload, created_at
    FROM survey_responses
    ORDER BY created_at
  `)).rows;
  // 途中経過（T0・T1）と最後の送信を、参加IDごとに1行にまとめる（いちばん進んだ送信。同じ段階なら新しいほう）
  const stageOf = (s) => (s.payload && s.payload.stage) || 'final'; // stage がない古い記録は最後の送信
  const best = new Map();
  allSurveys.forEach((s) => {
    const k = s.entry_id || (s.payload && s.payload.entryId) || `id:${s.id}`;
    const cur = best.get(k);
    const rank = STAGE_RANK[stageOf(s)] || 3;
    if (!cur || rank > cur.rank || (rank === cur.rank && new Date(s.created_at) >= new Date(cur.s.created_at))) best.set(k, { s, rank });
  });
  const surveys = [...best.values()].map((b) => b.s).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  // プレイ記録は参加IDごとに集計する（参加IDがない古い記録は参加者番号で集計）
  // 診断をやり直した人は、やり直し後のプレイを含めないので、1回ずつ取り出してから集計する
  const sessions = (await query(`
    SELECT COALESCE(entry_id, 'pid:' || participant_id) AS play_key, created_at, hexad_type,
      elapsed_sec, cpm, accuracy, correct_keystrokes, mistakes
    FROM typing_sessions
    WHERE participant_id IS NOT NULL OR entry_id IS NOT NULL
  `)).rows;
  const sessionsByKey = new Map();
  sessions.forEach((r) => {
    const k = String(r.play_key);
    if (!sessionsByKey.has(k)) sessionsByKey.set(k, []);
    sessionsByKey.get(k).push(r);
  });
  const num = (x) => (x == null || x === '' ? null : Number(x));
  const aggPlay = (list, cutoff) => {
    const cut = cutoff ? new Date(cutoff).getTime() : null;
    const xs = (list || []).filter((r) => !cut || new Date(r.created_at).getTime() <= cut);
    if (!xs.length) return {};
    const sum = (k) => xs.reduce((a, r) => a + (num(r[k]) || 0), 0);
    const avg = (k) => { const v = xs.map((r) => num(r[k])).filter((v) => v != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const cpms = xs.map((r) => num(r.cpm)).filter((v) => v != null);
    return {
      n_sessions: xs.length, total_play_sec: sum('elapsed_sec'),
      mean_cpm: avg('cpm'), max_cpm: cpms.length ? Math.max(...cpms) : null,
      mean_accuracy: avg('accuracy'),
      total_correct_keystrokes: sum('correct_keystrokes'), total_mistakes: sum('mistakes'),
    };
  };
  const pidCount = new Map();
  surveys.forEach((s) => { const k = String(s.participant_id); pidCount.set(k, (pidCount.get(k) || 0) + 1); });

  const itemIds = PostSurvey.ALL_ITEMS.map((i) => i.id);
  const hexItems = PostSurvey.ALL_ITEMS.filter((i) => i.scale === 'HEX');

  const rows = surveys.map((s) => {
    const a = s.answers || {};
    const p = s.payload || {};
    const ev = p.events || {};
    const row = {
      response_id: s.id,
      participant_id: s.participant_id,
      entry_id: s.entry_id || p.entryId || '',
      pid_duplicates: pidCount.get(String(s.participant_id)) || 1, // 2以上なら、同じ番号で複数回答がある
      group: s.participant_group,
      condition: s.condition,
      stage: stageOf(s), // final＝アンケートまで回答、T1＝準備直後の質問まで、T0＝はじめの4問まで（途中でやめた・回答中）
      complete: stageOf(s) === 'final' ? 1 : 0,
      submitted_at: s.created_at && new Date(s.created_at).toISOString(),
      items_version: (s.payload && s.payload.itemsVersion) || '',
    };
    itemIds.forEach((id) => { row[id] = a[id] ?? ''; });

    // 得点（修正版の集計方法）：ONB1〜3（AI対話・アンケート群のみ）と RET1〜3 は全項目が有効な場合だけ平均。
    // FIT・ENJ・RED は総合平均を作らず項目別。RET4・ONB4 は単項目。
    for (const sc of PostSurvey.SCORES) {
      row[sc.id] = sc.groups && !sc.groups.includes(s.participant_group) ? '' : meanAll(sc.items.map((id) => a[id]));
    }
    // 動機づけ傾向：方向ごとの2問がともに有効なら平均（6方向を保持。12問の合計は作らない）
    const hexMeans = {};
    HEXAD_ORDER.forEach((t) => {
      hexMeans[t] = meanAll(hexItems.filter((i) => i.hexadType === t).map((i) => a[i.id]));
      row[`HEX_${t}`] = hexMeans[t];
    });
    row.n_dont_know = Object.values(a).filter((v) => v === 'DK').length;

    // 割り当てられたタイプ（診断なし群は達成者で固定）と、本人のHexad-12との一致
    // 診断をやり直した人は、最初の診断を分析に使う（やり直し後の結果は final_type に残す）
    const hist = Array.isArray(p.diagnosisHistory) ? p.diagnosisHistory : [];
    const finalHr = p.hexadResult || null;
    const hr = (hist[0] && hist[0].hexadResult) || finalHr;
    row.n_diagnoses = s.participant_group === 'C' ? 0 : hist.length + (finalHr ? 1 : 0);
    row.rediagnosed = hist.length > 0 ? 1 : 0;
    row.final_type = finalHr && finalHr.primaryType ? finalHr.primaryType : '';
    row.type_changed = hist.length > 0 && hr && finalHr ? (hr.primaryType !== finalHr.primaryType ? 1 : 0) : '';
    // やり直した時刻。これより後のプレイ記録は集計に含めない。アンケートの回答もやり直し後なので、満足度などの分析からは除く（rediagnosed=1 で絞る）
    const rediagAt = hist[0] && hist[0].archivedAt ? hist[0].archivedAt : null;
    row.rediagnosed_at = rediagAt || '';
    // アンケート送信後のプレイ（自由に遊んだ分・送信後の再診断）も含めない
    const submittedAt = row.complete && s.created_at ? new Date(s.created_at).toISOString() : null;
    const cutoff = rediagAt && (!submittedAt || rediagAt < submittedAt) ? rediagAt : submittedAt;
    const assigned = hr && hr.primaryType ? hr.primaryType : (s.participant_group === 'C' ? 'achiever' : null);
    row.assigned_type = assigned;
    row.classify_method = (hr && hr.method) || p.classifyMethod || null; // llm_items＝AIが12項目を推定（3回平均）、survey＝Hexad-12に回答
    row.hex_source = p.hexSource || 'post_survey'; // onboarding＝アンケート群が最初の診断で答えたHexad-12（診断と基準が同じ回答）
    HEXAD_ORDER.forEach((t) => { row[`assigned_score_${t}`] = hr && hr.scores ? hr.scores[t] ?? '' : ''; });
    const hexComplete = HEXAD_ORDER.every((t) => typeof hexMeans[t] === 'number');
    if (hexComplete) {
      const top = Math.max(...HEXAD_ORDER.map((t) => hexMeans[t]));
      row.hex_top_types = HEXAD_ORDER.filter((t) => hexMeans[t] === top).join('|');
      if (assigned) {
        const r = ranks(HEXAD_ORDER.map((t) => hexMeans[t]));
        row.assigned_rank_in_hex = r[HEXAD_ORDER.indexOf(assigned)];
        row.assigned_is_top = hexMeans[assigned] === top ? 1 : 0;
      }
      if (assigned) {
        row.assigned_in_top2 = row.assigned_rank_in_hex <= 2 ? 1 : 0;
      }
      if (hr && hr.scores && HEXAD_ORDER.every((t) => Number.isFinite(Number(hr.scores[t])))) {
        row.spearman_assigned_vs_hex = spearman(HEXAD_ORDER.map((t) => Number(hr.scores[t])), HEXAD_ORDER.map((t) => hexMeans[t]));
      }
    }
    // AI対話群：AIが推定したHexad-12の各項目の点数（3回の平均）と、本人の回答との平均絶対誤差
    const aiItems = hr && hr.itemRatings ? hr.itemRatings : null;
    hexItems.forEach((it) => { row[`ai_${it.id}`] = aiItems ? aiItems[it.id] ?? '' : ''; });
    row.ai_runs = hr && hr.runs ? hr.runs : '';
    // 本人が数値で答えた項目だけで計算する（判断できない・空欄の項目は除く。使った項目数を ai_item_mae_n に出す）
    const maeItems = aiItems ? hexItems.filter((it) => typeof a[it.id] === 'number' && Number.isFinite(Number(aiItems[it.id]))) : [];
    row.ai_item_mae = maeItems.length ? mean(maeItems.map((it) => Math.abs(Number(aiItems[it.id]) - a[it.id]))) : '';
    row.ai_item_mae_n = maeItems.length || '';

    // 時刻と所要時間
    EVENT_COLS.forEach((k) => { row[`t_${k}`] = ev[k] || ''; });
    row.prestart_sec = secBetween(ev.entry, ev.firstGameStart);        // 番号入力 → 初回スタート（T0・T1の回答時間も含む）
    row.prep_sec = secBetween(ev.t0Submit, ev.t1Start);                // 群ごとの開始準備：はじめの4問の回答後 → スタートを押して準備直後の質問が出るまで
    row.t0_sec = secBetween(ev.t0Start, ev.t0Submit);                  // はじめの4問の回答時間
    row.t1_sec = secBetween(ev.t1Start, ev.t1Submit);                  // 準備直後の質問の回答時間
    row.diagnosis_sec = secBetween(ev.onboardingStart, ev.onboardingEnd); // 診断の開始 → 練習の準備へ（A・B群）
    // やり直した人は、やり直した時点で打ち切る（それ以降は分析に含めない）
    const playEnd = cutoff && ev.surveyStart && cutoff < ev.surveyStart ? cutoff : ev.surveyStart;
    row.play_window_sec = secBetween(ev.firstGameStart, playEnd);  // 初回スタート → アンケート開始
    row.free_play_sec = ev.freeChoiceShown ? (cutoff && cutoff < ev.freeChoiceShown ? 0 : secBetween(ev.freeChoiceShown, playEnd)) : ''; // 選べるようになってから遊んだ時間
    COUNT_COLS.forEach((k) => { row[k] = ev[k] ?? 0; });

    // プレイ記録（DBの typing_sessions を参加者番号で集計）
    const eid = s.entry_id || p.entryId;
    const plList = (eid && sessionsByKey.get(String(eid))) || sessionsByKey.get(`pid:${s.participant_id}`) || [];
    const pl = aggPlay(plList, cutoff); // やり直した人は、やり直すまでのプレイだけ
    // アンケート送信後に自分から遊んだ分（自由継続）。送信後に診断をやり直してタイプが変わったら、そこで打ち切る
    if (submittedAt) {
      const subT = new Date(submittedAt).getTime();
      const sorted = [...plList].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const pre = sorted.filter((r) => new Date(r.created_at).getTime() <= subT);
      const refType = (pre.length && pre[pre.length - 1].hexad_type) || (finalHr && finalHr.primaryType) || null;
      let n = 0, sec = 0;
      for (const r of sorted.filter((r) => new Date(r.created_at).getTime() > subT)) {
        if (refType && r.hexad_type && r.hexad_type !== refType) break;
        n += 1; sec += Number(r.elapsed_sec) || 0;
      }
      row.post_survey_sessions = n;
      row.post_survey_play_sec = sec;
    } else { row.post_survey_sessions = ''; row.post_survey_play_sec = ''; }
    row.n_sessions = pl.n_sessions ?? '';
    row.total_play_sec = pl.total_play_sec != null ? Math.round(Number(pl.total_play_sec) * 10) / 10 : '';
    row.mean_cpm = pl.mean_cpm != null ? Math.round(Number(pl.mean_cpm) * 10) / 10 : '';
    row.max_cpm = pl.max_cpm ?? '';
    row.mean_accuracy = pl.mean_accuracy != null ? Math.round(Number(pl.mean_accuracy) * 10) / 10 : '';
    row.total_correct_keystrokes = pl.total_correct_keystrokes ?? '';
    row.total_mistakes = pl.total_mistakes ?? '';

    const c = p.client || {};
    row.viewport = c.viewport || '';
    row.max_touch_points = c.maxTouchPoints ?? '';
    row.user_agent = c.userAgent || '';
    const firstChat = hist[0] && Array.isArray(hist[0].chatTranscript) ? hist[0].chatTranscript : p.chatTranscript;
    row.chat_turns = Array.isArray(firstChat) ? firstChat.filter((l) => l.role === 'user').length : '';
    row.chat_turns_final = Array.isArray(p.chatTranscript) ? p.chatTranscript.filter((l) => l.role === 'user').length : '';
    return row;
  });

  const header = rows.length ? Object.keys(rows[0]) : ['participant_id'];
  return { header, rows };
}


module.exports = { summaryRows, toCsv, safeEqual, HEXAD_ORDER };
