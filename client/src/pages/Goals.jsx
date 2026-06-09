import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchGoals, createGoal, updateGoal, deleteGoal, addSavingsToGoal } from '../redux/slices/goalSlice';
import { FiPlus, FiTarget, FiTrash2, FiDollarSign, FiClock, FiTrendingUp } from 'react-icons/fi';
import Modal from '../components/common/Modal';
import { formatCurrency, formatDate, calculateDaysLeft } from '../utils/helpers';

const GOAL_CATEGORIES = ['Laptop', 'Bike', 'iPhone', 'Vacation', 'Emergency Fund', 'Home', 'Car', 'Education', 'Investment', 'Other'];
const GOAL_ICONS = { 'Laptop': '💻', 'Bike': '🏍️', 'iPhone': '📱', 'Vacation': '✈️', 'Emergency Fund': '🏥', 'Home': '🏠', 'Car': '🚗', 'Education': '📚', 'Investment': '📈', 'Other': '🎯' };
const GOAL_COLORS = ['#6366f1', '#ec4899', '#f97316', '#22c55e', '#ef4444', '#8b5cf6', '#14b8a6', '#3b82f6', '#f59e0b', '#64748b'];

const Goals = () => {
  const dispatch = useDispatch();
  const { list: goals, summary, loading } = useSelector((state) => state.goals);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [formData, setFormData] = useState({
    title: '', category: 'Laptop', targetAmount: '', savedAmount: 0, deadline: '', description: '', priority: 'medium', monthlyTarget: ''
  });

  useEffect(() => { dispatch(fetchGoals()); }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createGoal({
      ...formData,
      icon: GOAL_ICONS[formData.category] || '🎯',
      color: GOAL_COLORS[GOAL_CATEGORIES.indexOf(formData.category)] || '#6366f1',
      targetAmount: parseFloat(formData.targetAmount),
      savedAmount: parseFloat(formData.savedAmount) || 0,
      monthlyTarget: parseFloat(formData.monthlyTarget) || Math.ceil((parseFloat(formData.targetAmount) - (parseFloat(formData.savedAmount) || 0)) / 6),
    }));
    setShowCreateModal(false);
    resetForm();
    dispatch(fetchGoals());
  };

  const handleAddSavings = async () => {
    if (!savingsAmount || !selectedGoal) return;
    await dispatch(addSavingsToGoal({ id: selectedGoal._id, amount: parseFloat(savingsAmount) }));
    setShowSavingsModal(false);
    setSavingsAmount('');
    setSelectedGoal(null);
    dispatch(fetchGoals());
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await dispatch(deleteGoal(id));
      dispatch(fetchGoals());
    }
  };

  const resetForm = () => {
    setFormData({ title: '', category: 'Laptop', targetAmount: '', savedAmount: 0, deadline: '', description: '', priority: 'medium', monthlyTarget: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Financial Goals</h1>
          <p className="text-dark-500 dark:text-dark-400">Plan and track your financial objectives</p>
        </div>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-dark-500 dark:text-dark-400">Total Goals</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white mt-1">{summary.totalGoals}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-dark-500 dark:text-dark-400">Active</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{summary.activeGoals}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-dark-500 dark:text-dark-400">Total Saved</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(summary.totalSaved)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-dark-500 dark:text-dark-400">Overall Progress</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{summary.overallProgress}%</p>
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => {
            const progress = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
            const daysLeft = calculateDaysLeft(goal.deadline);
            const remaining = goal.targetAmount - goal.savedAmount;
            const isCompleted = goal.status === 'completed';

            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card p-6 card-hover relative overflow-hidden ${isCompleted ? 'ring-2 ring-green-500/30' : ''}`}
              >
                {/* Priority indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full ${goal.priority === 'high' ? 'bg-red-500' : goal.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{goal.icon || '🎯'}</span>
                    <div>
                      <h3 className="font-semibold text-dark-900 dark:text-white">{goal.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'}`}>
                        {isCompleted ? '✅ Completed' : goal.category}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(goal._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <FiTrash2 className="w-4 h-4 text-dark-400 hover:text-red-500" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-dark-600 dark:text-dark-300">{formatCurrency(goal.savedAmount)}</span>
                    <span className="text-dark-500 dark:text-dark-400">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="progress-bar-fill"
                      style={{ background: `linear-gradient(90deg, ${goal.color || '#6366f1'}, ${goal.color || '#6366f1'}cc)` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-dark-500 dark:text-dark-400">{progress}% completed</span>
                    <span className="text-xs font-semibold" style={{ color: goal.color || '#6366f1' }}>{progress}%</span>
                  </div>
                </div>

                {/* Goal Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-dark-50 dark:bg-dark-800/50">
                    <p className="text-xs text-dark-500 dark:text-dark-400">Remaining</p>
                    <p className="text-sm font-semibold text-dark-900 dark:text-white">{formatCurrency(Math.max(0, remaining))}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-dark-50 dark:bg-dark-800/50">
                    <p className="text-xs text-dark-500 dark:text-dark-400">Days Left</p>
                    <p className={`text-sm font-semibold ${daysLeft < 30 ? 'text-red-500' : 'text-dark-900 dark:text-white'}`}>{daysLeft} days</p>
                  </div>
                  <div className="p-2 rounded-lg bg-dark-50 dark:bg-dark-800/50">
                    <p className="text-xs text-dark-500 dark:text-dark-400">Monthly Target</p>
                    <p className="text-sm font-semibold text-dark-900 dark:text-white">{formatCurrency(goal.monthlyTarget)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-dark-50 dark:bg-dark-800/50">
                    <p className="text-xs text-dark-500 dark:text-dark-400">Deadline</p>
                    <p className="text-sm font-semibold text-dark-900 dark:text-white">{formatDate(goal.deadline)}</p>
                  </div>
                </div>

                {/* Add Savings Button */}
                {!isCompleted && (
                  <button
                    onClick={() => { setSelectedGoal(goal); setShowSavingsModal(true); }}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 font-medium text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiDollarSign className="w-4 h-4" /> Add Savings
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-dark-400">
          <FiTarget className="w-20 h-20 mb-4 opacity-30" />
          <p className="text-xl font-medium">No goals yet</p>
          <p className="text-sm mt-1">Create your first financial goal to start planning</p>
          <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn-primary mt-4 flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Create Goal
          </button>
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Goal" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Goal Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="e.g., MacBook Pro" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Category *</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">
                {GOAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{GOAL_ICONS[cat]} {cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input-field">
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Target Amount *</label>
              <input type="number" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} className="input-field" placeholder="₹ 50,000" required min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Already Saved</label>
              <input type="number" value={formData.savedAmount} onChange={(e) => setFormData({ ...formData, savedAmount: e.target.value })} className="input-field" placeholder="₹ 0" min="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Deadline *</label>
              <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="input-field" required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Monthly Target</label>
              <input type="number" value={formData.monthlyTarget} onChange={(e) => setFormData({ ...formData, monthlyTarget: e.target.value })} className="input-field" placeholder="Auto-calculated" min="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={2} placeholder="Why is this goal important to you?" />
          </div>
          <button type="submit" className="w-full btn-primary">Create Goal 🎯</button>
        </form>
      </Modal>

      {/* Add Savings Modal */}
      <Modal isOpen={showSavingsModal} onClose={() => { setShowSavingsModal(false); setSavingsAmount(''); }} title={`Add Savings - ${selectedGoal?.title}`}>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10">
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Current: {formatCurrency(selectedGoal?.savedAmount)} / {formatCurrency(selectedGoal?.targetAmount)}
              <br />
              Remaining: {formatCurrency((selectedGoal?.targetAmount || 0) - (selectedGoal?.savedAmount || 0))}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Amount to Add</label>
            <input type="number" value={savingsAmount} onChange={(e) => setSavingsAmount(e.target.value)} className="input-field" placeholder="₹ 5,000" min="1" />
          </div>
          <div className="flex gap-3">
            {[500, 1000, 2000, 5000].map(amt => (
              <button key={amt} onClick={() => setSavingsAmount(amt.toString())} className="flex-1 py-2 rounded-lg bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 text-sm font-medium hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors">
                ₹{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <button onClick={handleAddSavings} className="w-full btn-primary">Add Savings</button>
        </div>
      </Modal>
    </div>
  );
};

export default Goals;
