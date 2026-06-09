const express = require('express');
const router = express.Router();
const { createSubscription, getSubscriptions, updateSubscription, deleteSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createSubscription);
router.get('/all', protect, getSubscriptions);
router.put('/update/:id', protect, updateSubscription);
router.delete('/delete/:id', protect, deleteSubscription);

module.exports = router;
