const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, sanitizeInput, logger } = require('./middleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'securekey';

router.use(sanitizeInput);
router.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

//User registration
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    res.send('User registered securely.');
});

//User login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

//User profile
router.get('/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, email, password FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user) {
            return res.status(404).send('User not found.');
        }

        //shows only the first 2 letters)
        const maskedEmail = user.email.replace(/^(.{2}).*(@.*)$/, '$1*****$2');

        res.json({
            id: user.id,
            email: maskedEmail,
            password: '*******' // Hide the actual password
        });
    });
});

module.exports = router;
