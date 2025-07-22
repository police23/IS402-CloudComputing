const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: '123456', // replace with your MySQL password
    database: 'cnpm' // replace with your database name
});

module.exports = pool;
