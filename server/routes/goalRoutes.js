const express = require('express');
const router = express.Router();
const { createGoal, getGoals, updateGoal, deleteGoal, addSavingsToGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createGoal);
router.get('/all', protect, getGoals);
router.put('/update/:id', protect, updateGoal);
router.delete('/delete/:id', protect, deleteGoal);
router.post('/add-savings/:id', protect, addSavingsToGoal);

module.exports = router;
