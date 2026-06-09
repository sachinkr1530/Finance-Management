const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification } = require('../services/notificationService');
const { protect } = require('../middleware/auth');

router.get('/all', protect, getNotifications);
router.put('/mark-read', protect, markAsRead);
router.delete('/delete/:id', protect, deleteNotification);

module.exports = router;
