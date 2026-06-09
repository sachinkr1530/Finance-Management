const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide expense title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide expense amount'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide expense category'],
    enum: ['Food', 'Fuel', 'Shopping', 'EMI', 'Rent', 'Recharge', 'Entertainment', 'Medical', 'Education', 'Transport', 'Utilities', 'Other']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Card', 'Net Banking', 'Other'],
    default: 'UPI'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['monthly', 'weekly', 'yearly'],
    default: 'monthly'
  },
  tags: [{
    type: String,
    trim: true
  }],
  billImage: {
    type: String,
    default: ''
  },
  ocrExtracted: {
    type: Boolean,
    default: false
  },
  voiceInput: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
