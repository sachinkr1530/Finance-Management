const express = require('express');
const router = express.Router();
const { addSalary, getSalaryHistory, deleteSalary } = require('../controllers/salaryController');
const { protect } = require('../middleware/auth');

router.post('/add', protect, addSalary);
router.get('/history', protect, getSalaryHistory);
router.delete('/delete/:id', protect, deleteSalary);

module.exports = router;
