const express = require('express');
const db = require('./db');

const router = express.Router();

//Registration (no hashing)
router.post('/register', (req, res) => {
    const { email, password } = req.body;
    db.run(`INSERT INTO users (email, password) VALUES ('${email}', '${password}')`);
    res.send('User registered (insecure).');
});

//Login (SQL injection)
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`, (err, user) => {
        if (user) {
            res.send('Login successful (insecure).');
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

//Profile (XSS and plain text user info)
router.get('/profile', (req, res) => {
    const userId = req.query.id; //(no authentication)
    db.get(`SELECT id, email, password FROM users WHERE email = ${email}`, (err, user) => { // (SQL injection)
        if (err || !user) {
            return res.status(404).send('User not found.');
        }

        res.send(`
            <h1>Profile Information</h1>
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Password:</strong> ${user.password}</p>
        `);
    });
});

module.exports = router;
