const { Pool } = require('pg');

// pg v9 から sslmode=require/prefer/verify-ca の意味が変わる（現在は verify-full 相当）。
// 現在の挙動（証明書を検証する）をそのまま明示して、警告を出さないようにする。
const connectionString = (process.env.POSTGRES_URL || process.env.DATABASE_URL || '')
  .replace(/sslmode=(require|prefer|verify-ca)/, 'sslmode=verify-full');

const pool = new Pool({
  connectionString,
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
    ALTER TABLE typing_sessions ADD COLUMN IF NOT EXISTS mistakes INT;
    ALTER TABLE typing_sessions ADD COLUMN IF NOT EXISTS classify_method VARCHAR(20);
    ALTER TABLE typing_sessions ADD COLUMN IF NOT EXISTS hexad_scores JSONB;
  `;
  // 本実験のアプリ内アンケート（1回答＝1行。回答・記録した時刻・診断結果などはJSONでまとめて保存）
  const createSurveyTableQuery = `
    CREATE TABLE IF NOT EXISTS survey_responses (
      id SERIAL PRIMARY KEY,
      participant_id VARCHAR(50),
      participant_group VARCHAR(10),
      condition VARCHAR(20),
      items_version VARCHAR(20),
      answers JSONB NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    await pool.query(migrateQuery);
    await pool.query(createSurveyTableQuery);
    isInitialized = true;
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

module.exports = { query, pool };
