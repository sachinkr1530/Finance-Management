const Expense = require('../models/Expense');
const Notification = require('../models/Notification');

exports.addExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date, paymentMethod, isRecurring, recurringFrequency, tags, billImage, ocrExtracted, voiceInput } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      description,
      date: date || Date.now(),
      paymentMethod,
      isRecurring,
      recurringFrequency,
      tags,
      billImage,
      ocrExtracted,
      voiceInput
    });

    // Check for overspending alert
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthExpenses = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $match: { $expr: { $and: [{ $eq: [{ $month: '$date' }, currentMonth + 1] }, { $eq: [{ $year: '$date' }, currentYear] }] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalSpent = monthExpenses[0]?.total || 0;
    const salary = req.user.monthlySalary || 0;

    if (salary > 0 && totalSpent > salary * 0.8) {
      await Notification.create({
        user: req.user._id,
        type: 'overspending',
        title: '⚠️ Overspending Alert',
        message: `You've spent ₹${totalSpent.toLocaleString()} this month (${Math.round((totalSpent / salary) * 100)}% of salary). Consider cutting back.`,
        priority: totalSpent > salary ? 'critical' : 'high'
      });
    }

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { month, year, category, search, sortBy, sortOrder, page = 1, limit = 20, startDate, endDate } = req.query;

    const filter = { user: req.user._id };

    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy || 'date'] = sortOrder === 'asc' ? 1 : -1;

    const expenses = await Expense.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(filter);

    // Get category totals
    const categoryTotals = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const totalAmount = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);

    res.json({
      success: true,
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      categoryTotals,
      totalAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExpenseStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    // Daily expenses for the month
    const dailyExpenses = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: { $dayOfMonth: '$date' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Category breakdown
    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Total for the month
    const monthTotal = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Previous month for comparison
    const prevStart = new Date(y, m - 2, 1);
    const prevEnd = new Date(y, m - 1, 0, 23, 59, 59);
    const prevTotal = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const currentTotal = monthTotal[0]?.total || 0;
    const previousTotal = prevTotal[0]?.total || 0;
    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        totalSpent: currentTotal,
        totalTransactions: monthTotal[0]?.count || 0,
        dailyAverage: currentTotal / (end.getDate()),
        changeFromLastMonth: parseFloat(change),
        categoryBreakdown,
        dailyExpenses,
        topCategory: categoryBreakdown[0] || null,
        averagePerTransaction: currentTotal / (monthTotal[0]?.count || 1)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
