import pool from './db.mjs';

async function alter() {
  try {
    await pool.query('ALTER TABLE user ADD COLUMN pass2 VARCHAR(255) DEFAULT NULL');
    console.log('Success');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists');
    } else {
      console.error('Error:', err);
    }
  } finally {
    process.exit(0);
  }
}
alter();
