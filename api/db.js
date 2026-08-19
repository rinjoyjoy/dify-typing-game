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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    isInitialized = true;
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

module.exports = { query, pool };
