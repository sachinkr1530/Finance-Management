const Expense = require('../models/Expense');
const Salary = require('../models/Salary');
const Goal = require('../models/Goal');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    // Income for the month
    const income = await Salary.aggregate([
      { $match: { user: req.user._id } },
      { $match: { $expr: { $and: [{ $eq: ['$month', m.toString()] }, { $eq: ['$year', y] }] } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const totalIncome = income.reduce((sum, i) => sum + i.total, 0);

    // Expenses for the month
    const expenses = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);

    // Daily trend
    const dailyTrend = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: { $dayOfMonth: '$date' }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    // Last 6 months trend
    const sixMonthsAgo = new Date(y, m - 7, 1);
    const monthlyTrend = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: sixMonthsAgo, $lte: end } } },
      { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyIncomeTrend = await Salary.aggregate([
      { $match: { user: req.user._id, year: { $gte: y - 1 } } },
      { $group: { _id: { month: '$month', year: '$year' }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Savings calculation
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    res.json({
      success: true,
      analytics: {
        totalIncome,
        totalExpenses,
        savings,
        savingsRate,
        expenseBreakdown: expenses,
        dailyTrend,
        monthlyTrend,
        monthlyIncomeTrend,
        budgetUtilization: totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFinancialHealthScore = async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // 1. Savings Score (0-25)
    const monthExpenses = await Expense.aggregate([
      { $match: { user: user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSpent = monthExpenses[0]?.total || 0;
    const salary = user.monthlySalary || 0;
    const savingsRate = salary > 0 ? (salary - totalSpent) / salary : 0;
    const savingsScore = Math.min(25, Math.round(savingsRate * 125)); // 20% savings = 25 points

    // 2. Expense Control Score (0-25)
    const expenseControl = salary > 0 ? Math.max(0, 1 - (totalSpent / salary)) : 0.5;
    const expenseScore = Math.round(expenseControl * 25);

    // 3. Goal Progress Score (0-25)
    const goals = await Goal.find({ user: user._id, status: 'active' });
    const avgGoalProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + (g.savedAmount / g.targetAmount), 0) / goals.length
      : 0;
    const goalScore = Math.round(avgGoalProgress * 25);

    // 4. Emergency Fund Score (0-25)
    const emergencyRatio = user.emergencyFund?.target > 0
      ? (user.emergencyFund?.current || 0) / user.emergencyFund.target
      : 0;
    const emergencyScore = Math.min(25, Math.round(emergencyRatio * 25));

    const totalScore = savingsScore + expenseScore + goalScore + emergencyScore;

    // Generate recommendations
    const recommendations = [];
    if (savingsScore < 15) recommendations.push('Increase your savings rate to at least 20% of income');
    if (expenseScore < 15) recommendations.push('Try to reduce discretionary spending');
    if (goalScore < 15) recommendations.push('Focus more on achieving your financial goals');
    if (emergencyScore < 15) recommendations.push('Build an emergency fund of 3-6 months expenses');

    // Financial personality
    let personality = 'balanced';
    if (savingsRate > 0.3) personality = 'saver';
    else if (savingsRate < 0.05) personality = 'spender';
    else if (goals.length > 3) personality = 'investor';

    res.json({
      success: true,
      score: {
        total: totalScore,
        breakdown: {
          savings: { score: savingsScore, max: 25, label: 'Savings' },
          expenseControl: { score: expenseScore, max: 25, label: 'Expense Control' },
          goals: { score: goalScore, max: 25, label: 'Goal Progress' },
          emergencyFund: { score: emergencyScore, max: 25, label: 'Emergency Fund' }
        },
        grade: totalScore >= 80 ? 'A' : totalScore >= 60 ? 'B' : totalScore >= 40 ? 'C' : 'D',
        recommendations,
        personality
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPredictions = async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();

    // Get last 3 months data for prediction
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const monthlyExpenses = await Expense.aggregate([
      { $match: { user: user._id, date: { $gte: threeMonthsAgo } } },
      { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const avgMonthlyExpense = monthlyExpenses.length > 0
      ? monthlyExpenses.reduce((sum, m) => sum + m.total, 0) / monthlyExpenses.length
      : 0;

    const salary = user.monthlySalary || 0;
    const predictedSavings = salary - avgMonthlyExpense;
    const overspendingRisk = avgMonthlyExpense > salary * 0.8 ? 'high' : avgMonthlyExpense > salary * 0.6 ? 'medium' : 'low';

    // Goal predictions
    const goals = await Goal.find({ user: user._id, status: 'active' });
    const goalPredictions = goals.map(goal => {
      const remaining = goal.targetAmount - goal.savedAmount;
      const monthsToDeadline = Math.ceil((new Date(goal.deadline) - now) / (1000 * 60 * 60 * 24 * 30));
      const requiredMonthly = remaining / Math.max(1, monthsToDeadline);
      const achievable = predictedSavings >= requiredMonthly;
      const predictedDate = achievable
        ? new Date(now.getTime() + (remaining / Math.max(1, predictedSavings)) * 30 * 24 * 60 * 60 * 1000)
        : null;

      return {
        goal: goal.title,
        remaining,
        monthsLeft: monthsToDeadline,
        requiredMonthly: Math.round(requiredMonthly),
        achievable,
        predictedCompletion: predictedDate?.toLocaleDateString() || 'Beyond current savings capacity',
        onTrack: goal.savedAmount / goal.targetAmount >= (1 - monthsToDeadline / 12)
      };
    });

    // Future balance prediction (3 months)
    const futureBalances = [];
    let runningBalance = 0;
    for (let i = 1; i <= 3; i++) {
      const monthIncome = salary;
      const monthExpense = avgMonthlyExpense * (1 + (Math.random() - 0.5) * 0.1); // slight variance
      runningBalance += monthIncome - monthExpense;
      futureBalances.push({
        month: new Date(now.getFullYear(), now.getMonth() + i).toLocaleString('default', { month: 'long' }),
        predictedIncome: monthIncome,
        predictedExpense: Math.round(monthExpense),
        predictedSavings: Math.round(monthIncome - monthExpense),
        cumulativeSavings: Math.round(runningBalance)
      });
    }

    res.json({
      success: true,
      predictions: {
        nextMonthSavings: Math.round(predictedSavings),
        overspendingRisk,
        avgMonthlyExpense: Math.round(avgMonthlyExpense),
        goalPredictions,
        futureBalances
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
