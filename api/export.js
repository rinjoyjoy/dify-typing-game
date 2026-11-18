const { query } = require('./db');
const { summaryRows, toCsv, safeEqual } = require('./_summary');

/* 研究者用：データをCSVでダウンロードする
   /api/export?key=合言葉                 … アンケート回答ごとに1行（アンケート＋時刻＋診断＋プレイ集計）。分析はこれを使う
                                            同じ参加者番号の回答が複数あれば、すべて別の行で出る（entry_id・pid_duplicates 列で確認）
   /api/export?key=合言葉&type=sessions   … プレイ1回ごとの生データ
   /api/export?key=合言葉&type=raw        … アンケート送信データそのもの（JSON）
   合言葉は Vercel の環境変数 RESEARCH_EXPORT_KEY に設定する。 */

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.RESEARCH_EXPORT_KEY;
  if (!secret) return res.status(500).json({ error: 'RESEARCH_EXPORT_KEY is not configured.' });
  const key = (req.query && req.query.key) || '';
  if (!safeEqual(key, secret)) return res.status(403).json({ error: 'Forbidden' });

  const type = (req.query && req.query.type) || 'summary';
  try {
    let csv;
    if (type === 'sessions') {
      const rows = (await query(`SELECT * FROM typing_sessions ORDER BY created_at`)).rows
        .map((r) => ({ ...r, created_at: r.created_at && new Date(r.created_at).toISOString() }));
      const header = rows.length ? Object.keys(rows[0]) : ['id'];
      csv = toCsv(header, rows);
    } else if (type === 'raw') {
      const rows = (await query(`SELECT id, participant_id, entry_id, participant_group, condition, created_at, payload FROM survey_responses ORDER BY created_at`)).rows
        .map((r) => ({ ...r, created_at: r.created_at && new Date(r.created_at).toISOString() }));
      csv = toCsv(['id', 'participant_id', 'entry_id', 'participant_group', 'condition', 'created_at', 'payload'], rows);
    } else {
      const { header, rows } = await summaryRows();
      csv = toCsv(header, rows);
    }
    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="typing_study_${type}_${stamp}.csv"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Error exporting:', err);
    return res.status(500).json({ error: 'Export failed' });
  }
};
