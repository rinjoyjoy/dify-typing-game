const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

let isInitialized = false;

async function query(text, params) {
  if (!isInitialized) {
    await initDb();
  }
  return pool.query(text, params);
}

async function initDb() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS typing_sessions (
      id SERIAL PRIMARY KEY,
      nickname TEXT NOT NULL,
      hexad_type VARCHAR(50) NOT NULL,
      cpm INT NOT NULL,
      accuracy INT NOT NULL,
      sentences_completed INT NOT NULL,
      correct_keystrokes INT NOT NULL,
      elapsed_sec NUMERIC(10, 2) NOT NULL,
      category VARCHAR(50),
      difficulty VARCHAR(50),
      time_limit_sec INT,
      participant_id VARCHAR(50),
      participant_group VARCHAR(10),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  // 既存テーブルに対しては列を追加でマイグレーション（研究の3群割り付け対応）
  const migrateQuery = `
    ALTER TABLE typing_sessions ADD COLUMN IF NOT EXISTS participant_id VARCHAR(50);
    ALTER TABLE typing_sessions ADD COLUMN IF NOT EXISTS participant_group VARCHAR(10);
  `;
  try {
    await pool.query(createTableQuery);
    await pool.query(migrateQuery);
    isInitialized = true;
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

module.exports = { query, pool };
