const express = require('express');
const router = express.Router();
const { handleBasicInquiry, handleDetailedInquiry, handleCompleteInquiry } = require('../controllers/inquiryController');

// Define allowed origins
const allowedOrigins = ['https://chrissnowden.com', 'http://localhost:3000'];

// Middleware to check origin and handle CORS
const checkOrigin = (req, res, next) => {
    const origin = req.get('Origin') || req.get('Referer');
    if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', 'true'); // Set to 'true' if using credentials (cookies, authorization headers)

        // Set Referrer-Policy header
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        next();
    } else {
        res.status(403).json({ message: 'Forbidden' });
    }
};

// Routes with CORS middleware applied
router.post('/basic', checkOrigin, handleBasicInquiry);
router.post('/detailed', checkOrigin, handleDetailedInquiry);
router.post('/complete', checkOrigin, handleCompleteInquiry);

module.exports = router;
