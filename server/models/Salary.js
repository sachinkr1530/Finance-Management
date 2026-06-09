const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['salary', 'side_income', 'freelance', 'investment', 'rental', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
    min: [0, 'Amount cannot be negative']
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SalarySchema.index({ user: 1, month: 1, year: -1 });

module.exports = mongoose.models.Salary || mongoose.model('Salary', SalarySchema);
