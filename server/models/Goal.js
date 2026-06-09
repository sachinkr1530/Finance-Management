const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide goal title'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Laptop', 'Bike', 'iPhone', 'Vacation', 'Emergency Fund', 'Home', 'Car', 'Education', 'Investment', 'Other'],
    required: true
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please provide target amount'],
    min: [0, 'Amount cannot be negative']
  },
  savedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Amount cannot be negative']
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide deadline']
  },
  monthlyTarget: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '🎯'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  autoSave: {
    type: Boolean,
    default: false
  },
  autoSaveAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

GoalSchema.virtual('remainingAmount').get(function () {
  return Math.max(0, this.targetAmount - this.savedAmount);
});

GoalSchema.virtual('progressPercentage').get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.savedAmount / this.targetAmount) * 100));
});

GoalSchema.virtual('predictedCompletionDate').get(function () {
  if (this.monthlyTarget <= 0) return null;
  const remaining = this.remainingAmount;
  const monthsNeeded = Math.ceil(remaining / this.monthlyTarget);
  const predicted = new Date();
  predicted.setMonth(predicted.getMonth() + monthsNeeded);
  return predicted;
});

GoalSchema.set('toJSON', { virtuals: true });
GoalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
