const crypto = require('crypto');
const { query } = require('./db');

/* 研究者用ページ（admin.html）から呼ぶ管理用API
   GET  /api/admin?key=合言葉                     … 保存されている件数を返す
   POST /api/admin { key, action: 'delete', scope: 'since' | 'all', since: 'YYYY-MM-DD', confirm: '削除する' }
        … 記録を削除する（scope=since なら、その日（日本時間）以降の記録だけ）
   合言葉は Vercel の環境変数 RESEARCH_EXPORT_KEY（CSVダウンロードと同じ） */

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

async function counts() {
  const s = await query(`SELECT COUNT(*)::int AS n, MIN(created_at) AS first, MAX(created_at) AS last FROM typing_sessions`);
  let r = { rows: [{ n: 0, first: null, last: null }] };
  try { r = await query(`SELECT COUNT(*)::int AS n, MIN(created_at) AS first, MAX(created_at) AS last FROM survey_responses`); } catch (e) {}
  return { sessions: s.rows[0], surveys: r.rows[0] };
}

module.exports = async function handler(req, res) {
  const secret = process.env.RESEARCH_EXPORT_KEY;
  if (!secret) return res.status(500).json({ error: 'not_configured' });

  const body = req.method === 'POST' ? (req.body || {}) : {};
  const key = req.method === 'POST' ? body.key : (req.query && req.query.key);
  if (!key || !safeEqual(key, secret)) return res.status(403).json({ error: 'forbidden' });

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, counts: await counts() });
    }
    if (req.method !== 'POST' || body.action !== 'delete') {
      return res.status(400).json({ error: 'bad_request' });
    }
    if (body.confirm !== '削除する') {
      return res.status(400).json({ error: 'confirm_required' });
    }

    let deletedSessions = 0;
    let deletedSurveys = 0;
    if (body.scope === 'all') {
      deletedSessions = (await query(`DELETE FROM typing_sessions`)).rowCount;
      deletedSurveys = (await query(`DELETE FROM survey_responses`)).rowCount;
    } else if (body.scope === 'since' && /^\d{4}-\d{2}-\d{2}$/.test(String(body.since || ''))) {
      // 指定した日の0時（日本時間）以降の記録だけを消す
      const cond = `created_at >= ($1::date)::timestamp AT TIME ZONE 'Asia/Tokyo'`;
      deletedSessions = (await query(`DELETE FROM typing_sessions WHERE ${cond}`, [body.since])).rowCount;
      deletedSurveys = (await query(`DELETE FROM survey_responses WHERE ${cond}`, [body.since])).rowCount;
    } else {
      return res.status(400).json({ error: 'bad_scope' });
    }
    return res.status(200).json({ success: true, deletedSessions, deletedSurveys, counts: await counts() });
  } catch (err) {
    console.error('admin error:', err);
    return res.status(500).json({ error: 'failed' });
  }
};
