const express = require('express');
const router = express.Router();
const { getMonthlyAnalytics, getFinancialHealthScore, getPredictions } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/monthly', protect, getMonthlyAnalytics);
router.get('/health-score', protect, getFinancialHealthScore);
router.get('/predictions', protect, getPredictions);

module.exports = router;
