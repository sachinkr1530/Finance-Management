const express = require('express');
const router = express.Router();
const { chat, analyze } = require('../services/aiService');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, chat);
router.post('/analyze', protect, analyze);

module.exports = router;
