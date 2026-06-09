const Notification = require('../models/Notification');
const Expense = require('../models/Expense');
const Goal = require('../models/Goal');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const { isRead, type, limit = 20 } = req.query;
    const filter = { user: req.user._id };
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type) filter.type = type;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkUpcomingRenewals = async (userId) => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcoming = await Subscription.find({
    user: userId,
    status: 'active',
    nextBillingDate: { $lte: threeDaysFromNow, $gte: now }
  });

  for (const sub of upcoming) {
    const existing = await Notification.findOne({
      user: userId,
      type: 'subscription_renewal',
      'data.subscriptionId': sub._id,
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    });

    if (!existing) {
      await Notification.create({
        user: userId,
        type: 'subscription_renewal',
        title: `🔄 ${sub.name} Renewal`,
        message: `${sub.name} subscription of ₹${sub.amount} will renew on ${new Date(sub.nextBillingDate).toLocaleDateString()}.`,
        priority: 'medium',
        icon: '🔄',
        data: { subscriptionId: sub._id }
      });
    }
  }
};

exports.generateSmartNotifications = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Check overspending
  const monthExpenses = await Expense.aggregate([
    { $match: { user: userId } },
    { $match: { $expr: { $and: [{ $eq: [{ $month: '$date' }, currentMonth + 1] }, { $eq: [{ $year: '$date' }, currentYear] }] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const totalSpent = monthExpenses[0]?.total || 0;
  const salary = user.monthlySalary || 0;

  if (salary > 0) {
    const spentPercentage = (totalSpent / salary) * 100;

    if (spentPercentage > 90) {
      await createIfNotExists(userId, 'overspending', '🚨 Critical: Over Budget!',
        `You've spent ${Math.round(spentPercentage)}% of your salary. Only ₹${Math.round(salary - totalSpent).toLocaleString()} remaining!`, 'critical');
    } else if (spentPercentage > 75) {
      await createIfNotExists(userId, 'budget_warning', '⚠️ Budget Warning',
        `You've used ${Math.round(spentPercentage)}% of your monthly budget. Be careful with spending.`, 'high');
    }
  }

  // Check goal deadlines
  const activeGoals = await Goal.find({
    user: userId,
    status: 'active',
    deadline: { $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) }
  });

  for (const goal of activeGoals) {
    const daysLeft = Math.ceil((new Date(goal.deadline) - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30 && goal.progressPercentage < 80) {
      await createIfNotExists(userId, 'goal_reminder', `🎯 Goal: ${goal.title}`,
        `Only ${daysLeft} days left! You've saved ${goal.progressPercentage}% so far. Need ₹${goal.remainingAmount.toLocaleString()} more.`, 'high');
    }
  }

  // Low savings alert
  if (salary > 0 && (salary - totalSpent) < salary * 0.1) {
    await createIfNotExists(userId, 'low_savings', '💾 Low Savings Alert',
      `Your savings this month are below 10% of income. Try to save at least 20%.`, 'medium');
  }
};

async function createIfNotExists(userId, type, title, message, priority) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await Notification.findOne({
    user: userId,
    type,
    createdAt: { $gte: today }
  });

  if (!existing) {
    await Notification.create({ user: userId, type, title, message, priority });
  }
}
