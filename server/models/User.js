const UserSchema = new (require('mongoose')).Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: 'INR'
  },
  monthlySalary: {
    type: Number,
    default: 0
  },
  financialPersonality: {
    type: String,
    enum: ['saver', 'spender', 'balanced', 'investor'],
    default: 'balanced'
  },
  preferences: {
    darkMode: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' }
  },
  emergencyFund: {
    target: { type: Number, default: 0 },
    current: { type: Number, default: 0 }
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

UserSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = require('mongoose').models.User || require('mongoose').model('User', UserSchema);
