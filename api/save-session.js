const { query } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      nickname = 'ゲスト',
      hexadType = 'achiever',
      cpm = 0,
      accuracy = 100,
      sentencesCompleted = 0,
      correctKeystrokes = 0,
      elapsedSec = 0,
      category = 'random',
      difficulty = 'random',
      timeLimitSec = null,
      participantId = null,
      group = null,
    } = req.body || {};

    const sql = `
      INSERT INTO typing_sessions
      (nickname, hexad_type, cpm, accuracy, sentences_completed, correct_keystrokes, elapsed_sec, category, difficulty, time_limit_sec, participant_id, participant_group)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, created_at;
    `;

    const values = [
      nickname,
      hexadType,
      Math.round(cpm),
      Math.round(accuracy),
      sentencesCompleted,
      correctKeystrokes,
      elapsedSec,
      category,
      difficulty,
      timeLimitSec,
      participantId,
      group,
    ];

    const result = await query(sql, values);
    return res.status(200).json({ success: true, record: result.rows[0] });
  } catch (err) {
    console.error('Error saving session:', err);
    return res.status(500).json({ error: 'Database save failed', details: err.message });
  }
};
