const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Secure database connected.');
    }
});

db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)`);

module.exports = db;
