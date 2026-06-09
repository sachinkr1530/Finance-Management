const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const { checkUpcomingRenewals } = require('../services/notificationService');

exports.createSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.create({
      user: req.user._id,
      ...req.body
    });

    res.status(201).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const subscriptions = await Subscription.find(filter).sort({ nextBillingDate: 1 });

    const totalMonthly = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        if (s.billingCycle === 'monthly') return sum + s.amount;
        if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
        if (s.billingCycle === 'yearly') return sum + s.amount / 12;
        return sum;
      }, 0);

    const totalYearly = totalMonthly * 12;

    // Detect upcoming renewals (next 7 days)
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingRenewals = subscriptions.filter(s =>
      s.status === 'active' && new Date(s.nextBillingDate) <= weekFromNow
    );

    // AI Insights placeholder
    const insights = subscriptions
      .filter(s => s.status === 'active' && s.usageScore < 4)
      .map(s => ({
        subscription: s.name,
        insight: `Low usage detected (score: ${s.usageScore}/10). Consider cancelling to save ₹${s.amount}/month.`,
        potentialSavings: s.amount
      }));

    res.json({
      success: true,
      subscriptions,
      summary: {
        totalActive: subscriptions.filter(s => s.status === 'active').length,
        totalMonthly: Math.round(totalMonthly),
        totalYearly: Math.round(totalYearly),
        upcomingRenewals: upcomingRenewals.length,
        potentialSavings: insights.reduce((sum, i) => sum + i.potentialSavings, 0)
      },
      insights
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.json({ success: true, message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
