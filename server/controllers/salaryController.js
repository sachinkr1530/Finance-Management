const Salary = require('../models/Salary');
const User = require('../models/User');

exports.addSalary = async (req, res) => {
  try {
    const { type, amount, month, year, description, source, isRecurring } = req.body;

    const salary = await Salary.create({
      user: req.user._id,
      type,
      amount,
      month,
      year,
      description,
      source,
      isRecurring
    });

    // Update user's monthly salary if type is salary
    if (type === 'salary') {
      await User.findByIdAndUpdate(req.user._id, { monthlySalary: amount });
    }

    res.status(201).json({ success: true, salary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalaryHistory = async (req, res) => {
  try {
    const { year } = req.query;
    const filter = { user: req.user._id };
    if (year) filter.year = parseInt(year);

    const salaries = await Salary.find(filter).sort({ year: -1, month: -1 });

    const totalIncome = salaries.reduce((sum, s) => sum + s.amount, 0);
    const mainSalary = salaries.find(s => s.type === 'salary')?.amount || 0;
    const sideIncomes = salaries.filter(s => s.type !== 'salary').reduce((sum, s) => sum + s.amount, 0);

    // Monthly breakdown
    const monthlyBreakdown = await Salary.aggregate([
      { $match: filter },
      { $group: { _id: { month: '$month', year: '$year' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.json({
      success: true,
      salaries,
      summary: {
        totalIncome,
        mainSalary,
        sideIncomes,
        averageMonthlyIncome: totalIncome / Math.max(1, monthlyBreakdown.length)
      },
      monthlyBreakdown
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    res.json({ success: true, message: 'Salary record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
