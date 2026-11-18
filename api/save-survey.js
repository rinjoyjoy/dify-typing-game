const { query } = require('./db');

// アプリ内アンケートの回答を保存する（study-flow.js から自動送信）
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const answers = body.answers;
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers is required' });
    }

    const payloadText = JSON.stringify(body);
    if (payloadText.length > 500000) {
      return res.status(413).json({ error: 'Payload too large' });
    }

    const str = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

    const result = await query(
      `INSERT INTO survey_responses
         (participant_id, entry_id, participant_group, condition, items_version, answers, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at;`,
      [
        str(body.participantId, 50),
        str(body.entryId, 64),
        str(body.group, 10),
        str(body.condition, 20),
        str(body.itemsVersion, 20),
        JSON.stringify(answers),
        payloadText,
      ]
    );
    return res.status(200).json({ success: true, record: result.rows[0] });
  } catch (err) {
    console.error('Error saving survey:', err);
    return res.status(500).json({ error: 'Database save failed' });
  }
};
