const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide subscription name'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Entertainment', 'Music', 'Shopping', 'Fitness', 'Internet', 'Software', 'Cloud', 'Education', 'News', 'Other'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide subscription amount'],
    min: [0, 'Amount cannot be negative']
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active'
  },
  icon: {
    type: String,
    default: '📺'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  url: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  aiInsight: {
    type: String,
    default: ''
  },
  usageScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
