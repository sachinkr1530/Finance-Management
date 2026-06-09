export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatDateShort = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
};

export const getMonthName = (monthNum) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthNum - 1] || '';
};

export const getPercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

export const getCategoryColor = (category) => {
  const colors = {
    Food: '#f97316',
    Fuel: '#6366f1',
    Shopping: '#ec4899',
    EMI: '#ef4444',
    Rent: '#8b5cf6',
    Recharge: '#14b8a6',
    Entertainment: '#f59e0b',
    Medical: '#22c55e',
    Education: '#3b82f6',
    Transport: '#64748b',
    Utilities: '#a855f7',
    Other: '#94a3b8',
  };
  return colors[category] || '#6366f1';
};

export const getCategoryIcon = (category) => {
  const icons = {
    Food: '🍔',
    Fuel: '⛽',
    Shopping: '🛍️',
    EMI: '💳',
    Rent: '🏠',
    Recharge: '📱',
    Entertainment: '🎬',
    Medical: '🏥',
    Education: '📚',
    Transport: '🚗',
    Utilities: '💡',
    Other: '📌',
  };
  return icons[category] || '📌';
};

export const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

export const getScoreGrade = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
};

export const calculateDaysLeft = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#64748b', '#a855f7', '#94a3b8'];
