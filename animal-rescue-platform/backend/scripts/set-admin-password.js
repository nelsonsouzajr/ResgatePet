const { Pool } = require('pg');

(async () => {
  const dbPassword = process.argv[2] || process.env.PG_PASSWORD;
  if (!dbPassword) {
    console.error('Usage: node set-admin-password.js <dbPassword>');
    process.exit(1);
  }

  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'resgatepet',
    user: 'postgres',
    password: dbPassword,
  });

  try {
    const hash = '$2a$10$f7HylvBTtd83qt8sxIL9j.SNF743s4LK6dj7CauKu6B/1VD5JrbFi';
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'admin@resgatepet.com']);
    const r = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', ['admin@resgatepet.com']);
    console.log(r.rows);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
