const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const winston = require('winston');
const xss = require('xss');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'securekey';

//Logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'secure.log' })
    ]
});

//Authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Access denied. No token provided.');

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = user;
        next();
    });
};

//Input sanitiser 
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            req.body[key] = xss(req.body[key]);
        }
    }
    next();
};

module.exports = { authenticateToken, sanitizeInput, logger };
