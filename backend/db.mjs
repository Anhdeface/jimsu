/* 

Dev by Quoc Anh
Config Jimsu

t.me/isinato
fb.com/tcpryz



*/



import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'yourpass',
    database: 'QuocAnh'
});
export default pool;
// const [reuslt] = await pool.query('SELECT * FROM user');
// console.log(reuslt);