const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const dotenv = require('dotenv');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const xss = require('xss');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Initialize Express
const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.use(xssClean());
app.use(cors());

// Initialize SQLite Database
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

// Logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'secure.log' })
    ]
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Access denied. No token provided.');

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = user;
        next();
    });
};

// Input Sanitization Middleware
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            req.body[key] = xss(req.body[key]);
        }
    }
    next();
};

app.use(sanitizeInput);
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Registration
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
        if (err) return res.status(500).send('Error registering user.');
        res.send('User registered securely.');
    });
});

// Login
app.post('/login', (req, res) => {
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

// Profile
app.get('/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, email, password FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user) {
            return res.status(404).send('User not found.');
        }
        const maskedEmail = user.email.replace(/^(.{2}).*(@.*)$/, '$1*****$2');
        res.json({
            id: user.id,
            email: maskedEmail,
            password: '*******'
        });
    });
});

// Start the server
app.listen(4000, () => console.log('Secure app running on port 4000'));
