/* 

Dev by Quoc Anh
Config Jimsu

t.me/isinato
fb.com/tcpryz



*/

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    socketPath: '/run/mysqld/mysqld.sock',
    user: 'quanh',
    database: 'quanh_db'
});
export default pool;
