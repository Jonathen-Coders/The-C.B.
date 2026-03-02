const mysql = require('mysql2/promise');

let pool;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: { rejectUnauthorized: false }
    });

    // Create tables if they don't exist
    await initTables();
  }
  return pool;
}

async function initTables() {
  const conn = await pool.getConnection();
  try {
    // General key-value store (replaces Replit DB)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS bot_data (
        key_name VARCHAR(512) PRIMARY KEY,
        value JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Stats tracking table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS bot_stats (
        guild_id VARCHAR(64) NOT NULL,
        stat_type VARCHAR(64) NOT NULL,
        count BIGINT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (guild_id, stat_type)
      )
    `);

    console.log('[MySQL] Tables initialized successfully.');
  } finally {
    conn.release();
  }
}

// Simple get/set/delete helpers (mirrors Replit DB API)
async function dbGet(key) {
  const pool = await getPool();
  const [rows] = await pool.execute(
    'SELECT value FROM bot_data WHERE key_name = ?',
    [key]
  );
  if (rows.length === 0) return null;
  return rows[0].value;
}

async function dbSet(key, value) {
  const pool = await getPool();
  await pool.execute(
    `INSERT INTO bot_data (key_name, value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE value = VALUES(value)`,
    [key, JSON.stringify(value)]
  );
}

async function dbDelete(key) {
  const pool = await getPool();
  await pool.execute('DELETE FROM bot_data WHERE key_name = ?', [key]);
}

async function dbList(prefix) {
  const pool = await getPool();
  const [rows] = await pool.execute(
    'SELECT key_name FROM bot_data WHERE key_name LIKE ?',
    [`${prefix}%`]
  );
  return rows.map(r => r.key_name);
}

// Stats helpers
async function incrementStat(guildId, statType) {
  const pool = await getPool();
  await pool.execute(
    `INSERT INTO bot_stats (guild_id, stat_type, count) VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE count = count + 1`,
    [guildId, statType]
  );
}

async function setStat(guildId, statType, value) {
  const pool = await getPool();
  await pool.execute(
    `INSERT INTO bot_stats (guild_id, stat_type, count) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE count = VALUES(count)`,
    [guildId, statType, value]
  );
}

async function getStat(guildId, statType) {
  const pool = await getPool();
  const [rows] = await pool.execute(
    'SELECT count FROM bot_stats WHERE guild_id = ? AND stat_type = ?',
    [guildId, statType]
  );
  return rows.length > 0 ? rows[0].count : 0;
}

module.exports = { getPool, dbGet, dbSet, dbDelete, dbList, incrementStat, setStat, getStat };
