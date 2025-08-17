const { Pool } = require('pg');

// It's highly recommended to use environment variables for database connection details.
// Set the DATABASE_URL environment variable.
// Example: 'postgresql://user:password@host:port/database'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
