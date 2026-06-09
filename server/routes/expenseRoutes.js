const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, updateExpense, deleteExpense, getExpenseStats } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.post('/add', protect, addExpense);
router.get('/all', protect, getExpenses);
router.get('/stats', protect, getExpenseStats);
router.put('/update/:id', protect, updateExpense);
router.delete('/delete/:id', protect, deleteExpense);

module.exports = router;
