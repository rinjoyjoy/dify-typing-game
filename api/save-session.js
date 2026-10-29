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

    const str = (v, max, fallback) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : fallback);
    const num = (v, min, max) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : 0;
    };

    const sql = `
      INSERT INTO typing_sessions
      (nickname, hexad_type, cpm, accuracy, sentences_completed, correct_keystrokes, elapsed_sec, category, difficulty, time_limit_sec, participant_id, participant_group)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, created_at;
    `;

    const values = [
      str(nickname, 50, 'ゲスト'),
      str(hexadType, 50, 'achiever'),
      Math.round(num(cpm, 0, 2000)),
      Math.round(num(accuracy, 0, 100)),
      Math.round(num(sentencesCompleted, 0, 10000)),
      Math.round(num(correctKeystrokes, 0, 100000)),
      Math.round(num(elapsedSec, 0, 36000) * 100) / 100,
      str(category, 50, 'random'),
      str(difficulty, 50, 'random'),
      timeLimitSec == null ? null : Math.round(num(timeLimitSec, 0, 36000)),
      str(participantId, 50, null),
      str(group, 10, null),
    ];

    const result = await query(sql, values);
    return res.status(200).json({ success: true, record: result.rows[0] });
  } catch (err) {
    console.error('Error saving session:', err);
    return res.status(500).json({ error: 'Database save failed' });
  }
};
