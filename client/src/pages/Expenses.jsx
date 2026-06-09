import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchExpenses, addExpense, updateExpense, deleteExpense, setFilters, clearFilters } from '../redux/slices/expenseSlice';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiX, FiCalendar, FiDownload } from 'react-icons/fi';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColor, getMonthName } from '../utils/helpers';
import { FiMic, FiMicOff,  FiCreditCard } from 'react-icons/fi';

const CATEGORIES = ['Food', 'Fuel', 'Shopping', 'EMI', 'Rent', 'Recharge', 'Entertainment', 'Medical', 'Education', 'Transport', 'Utilities', 'Other'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Net Banking', 'Other'];

const Expenses = () => {
  const dispatch = useDispatch();
  const { list, loading, filters, categoryTotals, totalAmount, pagination } = useSelector((state) => state.expenses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: '', amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'UPI', tags: ''
  });
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenses(filters));
  }, [filters, dispatch]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
    };
    await dispatch(addExpense(data));
    setShowAddModal(false);
    resetForm();
    dispatch(fetchExpenses(filters));
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
    };
    await dispatch(updateExpense({ id: selectedExpense._id, data }));
    setShowEditModal(false);
    resetForm();
    dispatch(fetchExpenses(filters));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await dispatch(deleteExpense(id));
      dispatch(fetchExpenses(filters));
    }
  };

  const openEdit = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      date: new Date(expense.date).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod || 'UPI',
      tags: (expense.tags || []).join(', '),
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'UPI', tags: '' });
    setSelectedExpense(null);
  };

  // Voice input handler
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Please use Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      parseVoiceInput(transcript);
    };

    recognition.start();
  };

  const parseVoiceInput = (text) => {
    // Parse amount
    const amountMatch = text.match(/₹?\s?([\d,]+)/);
    const amount = amountMatch ? amountMatch[1].replace(/,/g, '') : '';

    // Parse category
    let category = 'Other';
    const categoryMap = {
      food: 'Food', khana: 'Food', meal: 'Food', lunch: 'Food', dinner: 'Food', breakfast: 'Food',
      fuel: 'Fuel', petrol: 'Fuel', diesel: 'Fuel', gas: 'Fuel',
      shopping: 'Shopping', clothes: 'Shopping', kapde: 'Shopping',
      emi: 'EMI', loan: 'EMI',
      rent: 'Rent',
      recharge: 'Recharge', mobile: 'Recharge', phone: 'Recharge',
      entertainment: 'Entertainment', movie: 'Entertainment', game: 'Entertainment',
      medical: 'Medical', doctor: 'Medical', medicine: 'Medical', hospital: 'Medical', dawai: 'Medical',
    };

    const lowerText = text.toLowerCase();
    for (const [keyword, cat] of Object.entries(categoryMap)) {
      if (lowerText.includes(keyword)) { category = cat; break; }
    }

    setFormData({
      ...formData,
      title: text.substring(0, 100),
      amount,
      category,
      voiceInput: true,
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Expenses</h1>
          <p className="text-dark-500 dark:text-dark-400">Track and manage your spending</p>
        </div>
        <div className="flex gap-3">
          <button onClick={startVoiceInput} className={`btn-secondary flex items-center gap-2 ${isListening ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
            {isListening ? <FiMicOff className="w-4 h-4 text-red-500" /> : <FiMic className="w-4 h-4" />}
            <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
          </button>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
              className="input-field pl-10 py-2 text-sm"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
            className="input-field w-auto py-2 text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={filters.month}
            onChange={(e) => dispatch(setFilters({ month: parseInt(e.target.value) }))}
            className="input-field w-auto py-2 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
          <select
            value={filters.year}
            onChange={(e) => dispatch(setFilters({ year: parseInt(e.target.value) }))}
            className="input-field w-auto py-2 text-sm"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <button onClick={() => dispatch(clearFilters())} className="btn-secondary text-sm py-2">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-dark-500 dark:text-dark-400">Total Spent</p>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-dark-500 dark:text-dark-400">Transactions</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white mt-1">{pagination.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-dark-500 dark:text-dark-400">Top Category</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
            {categoryTotals[0]?._id || 'None'}
          </p>
        </div>
      </div>

      {/* Expense List */}
      <div className="glass-card">
        {loading ? (
          <LoadingSpinner />
        ) : list.length > 0 ? (
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {list.map((expense, index) => (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${getCategoryColor(expense.category)}15` }}>
                  {getCategoryIcon(expense.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{expense.title}</p>
                    {expense.voiceInput && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">🎤 Voice</span>}
                    {expense.ocrExtracted && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">📷 OCR</span>}
                  </div>
                  <p className="text-xs text-dark-500 dark:text-dark-400">
                    {expense.category} · {expense.paymentMethod} · {formatDate(expense.date)}
                  </p>
                </div>
                <p className="text-sm font-bold text-red-500 dark:text-red-400 shrink-0">-{formatCurrency(expense.amount)}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(expense)} className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors">
                    <FiEdit2 className="w-4 h-4 text-dark-500" />
                  </button>
                  <button onClick={() => handleDelete(expense._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <FiTrash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-dark-400">
            <FiCreditCard className="w-16 h-16 mb-3 opacity-30" />
            <p className="text-lg font-medium">No expenses found</p>
            <p className="text-sm">Add your first expense to get started</p>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Add Expense">
        <ExpenseForm formData={formData} setFormData={setFormData} onSubmit={handleAddExpense} submitLabel="Add Expense" categories={CATEGORIES} paymentMethods={PAYMENT_METHODS} />
      </Modal>

      {/* Edit Expense Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); resetForm(); }} title="Edit Expense">
        <ExpenseForm formData={formData} setFormData={setFormData} onSubmit={handleEditExpense} submitLabel="Update Expense" categories={CATEGORIES} paymentMethods={PAYMENT_METHODS} />
      </Modal>
    </div>
  );
};

const ExpenseForm = ({ formData, setFormData, onSubmit, submitLabel, categories, paymentMethods }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Title *</label>
      <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="e.g., Lunch at office" required />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Amount *</label>
        <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input-field" placeholder="₹ 0" required min="0" step="0.01" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Category *</label>
        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field" required>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Date</label>
        <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Payment Method</label>
        <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="input-field">
          {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
        </select>
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={2} placeholder="Optional note..." />
    </div>
    <div>
      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Tags (comma separated)</label>
      <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="input-field" placeholder="e.g., office, food, weekly" />
    </div>
    <button type="submit" className="w-full btn-primary">{submitLabel}</button>
  </form>
);

export default Expenses;
