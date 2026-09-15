const { query } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. 全体文字数の集計
    const totalResult = await query(`SELECT COALESCE(SUM(correct_keystrokes), 0) AS total FROM typing_sessions`);
    const communityTotal = parseInt(totalResult.rows[0].total, 10);

    // 2. 全セッション件数
    const countResult = await query(`SELECT COUNT(*) AS count FROM typing_sessions`);
    const totalSessions = parseInt(countResult.rows[0].count, 10);

    // 3. タイプ別の達成サマリー（プレイ回数・最高CPM・最高正確率・カテゴリ数など）
    const typeSummaryQuery = `
      SELECT 
        hexad_type,
        COUNT(*) as play_count,
        MAX(cpm) as max_cpm,
        MAX(accuracy) as max_accuracy,
        SUM(correct_keystrokes) as total_chars,
        COUNT(DISTINCT category) as unique_categories,
        COUNT(DISTINCT difficulty) as unique_difficulties
      FROM typing_sessions
      GROUP BY hexad_type
    `;
    const typeSummaryResult = await query(typeSummaryQuery);

    // 4. トップリーダーボード (TOP 20、参加者ごとの自己ベスト1件のみ・社交家機能で実在の他者と比較するために使用)
    const leaderboardQuery = `
      SELECT id, nickname, hexad_type, cpm, accuracy, created_at
      FROM (
        SELECT DISTINCT ON (COALESCE(participant_id::text, nickname))
          id, nickname, hexad_type, cpm, accuracy, created_at
        FROM typing_sessions
        ORDER BY COALESCE(participant_id::text, nickname), cpm DESC
      ) best_per_participant
      ORDER BY cpm DESC, accuracy DESC
      LIMIT 20
    `;
    const leaderboardResult = await query(leaderboardQuery);

    return res.status(200).json({
      success: true,
      communityTotal,
      totalSessions,
      typeSummary: typeSummaryResult.rows,
      leaderboard: leaderboardResult.rows,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return res.status(500).json({ error: 'Database fetch failed', details: err.message });
  }
};
