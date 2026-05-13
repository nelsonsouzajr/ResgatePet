const { Pool } = require('pg');

const fixes = [
  [1, 'Av. Paulista, próximo ao número 1500, São Paulo – SP'],
  [2, 'Rua Augusta, 300, Consolação, São Paulo – SP'],
  [3, 'Praça da República, Santos – SP'],
  [4, 'Vila Madalena, São Paulo – SP'],
  [5, 'Rodovia Anhanguera, km 94, Campinas – SP'],
];

(async () => {
  const dbPassword = process.argv[2] || process.env.PG_PASSWORD;
  if (!dbPassword) {
    console.error('Usage: node scripts/fix-accented-texts.js <dbPassword>');
    process.exit(1);
  }

  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'resgatepet',
    user: 'postgresql_common',
    password: dbPassword,
  });

  try {
    for (const [id, locationDescription] of fixes) {
      await pool.query('UPDATE rescue_cases SET location_description = $1 WHERE id = $2', [locationDescription, id]);
    }

    const result = await pool.query('SELECT id, location_description FROM rescue_cases ORDER BY id');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
