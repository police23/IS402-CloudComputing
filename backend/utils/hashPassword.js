const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function hashAndUpdatePassword(userId, plainPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'your_db_password',
        database: 'your_db_name'
    });

    await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
    );
    await connection.end();
    console.log('Password updated!');
}

// Ví dụ: cập nhật mật khẩu admin (id=1) thành 'adminpass'
hashAndUpdatePassword(1, 'adminpass');

const password = '123456'; // Mật khẩu gốc
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Hashed password:', hash);
    }
});
