const rateLimit = require('express-rate-limit');

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

// Helper: attach CORS headers on rate-limit rejection so browser doesn't treat it as a network error
const setCORSOnRateLimit = (req, res, message) => {
    const origin = req.headers.origin;
    if (origin === ALLOWED_ORIGIN) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.status(429).json(typeof message === 'string' ? { message } : message);
};

// Global rate limiter: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => setCORSOnRateLimit(req, res, 'Too many requests from this IP, please try again in 15 minutes'),
});

// Sensitive route protector: 20 attempts per 15 minutes per IP
const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => setCORSOnRateLimit(req, res, { message: 'Too many requests, please try again later.' }),
});

module.exports = { globalLimiter, sensitiveLimiter };
