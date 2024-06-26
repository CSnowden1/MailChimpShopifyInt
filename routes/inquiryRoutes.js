const express = require('express');
const router = express.Router();
const { handleBasicInquiry, handleDetailedInquiry, handleCompleteInquiry } = require('../controllers/inquiryController');

// Route for basic info (name and email)
router.post('/basic', handleBasicInquiry);

// Route for detailed info (name, email, service, and description)
router.post('/detailed', handleDetailedInquiry);

// Route for complete info (name, email, service, description, appointment time and date)
router.post('/complete', handleCompleteInquiry);

module.exports = router;
