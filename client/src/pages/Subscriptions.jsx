import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscriptionAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import Modal from '../components/common/Modal';
import { FiPlus, FiTrash2, FiEdit2, FiAlertTriangle, FiTv, FiCheck } from 'react-icons/fi';

const SUB_CATEGORIES = ['Entertainment', 'Music', 'Shopping', 'Fitness', 'Internet', 'Software', 'Cloud', 'Education', 'News', 'Other'];
const SUB_ICONS = { Netflix: '🎬', Spotify: '🎵', Prime: '📦', Gym: '💪', Internet: '🌐', YouTube: '📺', Hotstar: '🎥', Other: '📺' };
const PRESET_SUBS = [
  { name: 'Netflix', category: 'Entertainment', icon: '🎬', color: '#e50914', amount: 649, billingCycle: 'monthly' },
  { name: 'Spotify', category: 'Music', icon: '🎵', color: '#1db954', amount: 119, billingCycle: 'monthly' },
  { name: 'Amazon Prime', category: 'Shopping', icon: '📦', color: '#ff9900', amount: 299, billingCycle: 'monthly' },
  { name: 'Gym', category: 'Fitness', icon: '💪', color: '#6366f1', amount: 1500, billingCycle: 'monthly' },
  { name: 'Internet', category: 'Internet', icon: '🌐', color: '#3b82f6', amount: 999, billingCycle: 'monthly' },
];

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({ totalActive: 0, totalMonthly: 0, totalYearly: 0, potentialSavings: 0 });
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Entertainment', amount: '', billingCycle: 'monthly', nextBillingDate: '', usageScore: 5, notes: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadSubscriptions(); }, []);

  const loadSubscriptions = async () => {
    try {
      const res = await subscriptionAPI.getAll();
      setSubscriptions(res.data.subscriptions);
      setSummary(res.data.summary);
      setInsights(res.data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, amount: parseFloat(formData.amount), icon: SUB_ICONS[formData.name] || '📺' };
    if (editingId) {
      await subscriptionAPI.update(editingId, data);
    } else {
      await subscriptionAPI.create(data);
    }
    setShowModal(false);
    setEditingId(null);
    resetForm();
    loadSubscriptions();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this subscription?')) {
      await subscriptionAPI.delete(id);
      loadSubscriptions();
    }
  };

  const handleEdit = (sub) => {
    setEditingId(sub._id);
    setFormData({
      name: sub.name,
      category: sub.category,
      amount: sub.amount.toString(),
      billingCycle: sub.billingCycle,
      nextBillingDate: new Date(sub.nextBillingDate).toISOString().split('T')[0],
      usageScore: sub.usageScore || 5,
      notes: sub.notes || '',
    });
    setShowModal(true);
  };

  const addPreset = (preset) => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setFormData({
      ...formData,
      name: preset.name,
      category: preset.category,
      amount: preset.amount.toString(),
      billingCycle: preset.billingCycle,
      nextBillingDate: nextMonth.toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'Entertainment', amount: '', billingCycle: 'monthly', nextBillingDate: '', usageScore: 5, notes: '' });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Subscriptions</h1>
          <p className="text-dark-500 dark:text-dark-400">Track and manage recurring payments</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <p className="text-sm text-dark-500 dark:text-dark-400">Active Subscriptions</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white mt-1">{summary.totalActive}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <p className="text-sm text-dark-500 dark:text-dark-400">Monthly Cost</p>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{formatCurrency(summary.totalMonthly)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <p className="text-sm text-dark-500 dark:text-dark-400">Yearly Cost</p>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{formatCurrency(summary.totalYearly)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <p className="text-sm text-dark-500 dark:text-dark-400">Potential Savings</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(summary.potentialSavings)}</p>
        </motion.div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-yellow-500" /> AI Insights
          </h3>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>{insight.subscription}:</strong> {insight.insight}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Add Presets */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-3">Quick Add Popular Subscriptions</h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_SUBS.map((preset) => (
            <button key={preset.name} onClick={() => addPreset(preset)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-sm">
              <span>{preset.icon}</span>
              <span className="text-dark-700 dark:text-dark-300">{preset.name}</span>
              <span className="text-dark-500 dark:text-dark-400">₹{preset.amount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subscription List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub, index) => (
          <motion.div
            key={sub._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-5 card-hover ${sub.status === 'cancelled' ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{sub.icon || '📺'}</span>
                <div>
                  <h3 className="font-semibold text-dark-900 dark:text-white">{sub.name}</h3>
                  <p className="text-xs text-dark-500 dark:text-dark-400">{sub.category}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(sub)} className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"><FiEdit2 className="w-4 h-4 text-dark-400" /></button>
                <button onClick={() => handleDelete(sub._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><FiTrash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold text-dark-900 dark:text-white">{formatCurrency(sub.amount)}</span>
              <span className="text-sm text-dark-500 dark:text-dark-400">/{sub.billingCycle}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-500 dark:text-dark-400">Next billing</span>
                <span className="text-dark-700 dark:text-dark-300">{formatDate(sub.nextBillingDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-500 dark:text-dark-400">Usage Score</span>
                <div className="flex items-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`w-1.5 h-4 rounded-full ${i < (sub.usageScore || 5) ? 'bg-green-500' : 'bg-dark-200 dark:bg-dark-700'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className={`mt-3 text-xs px-2 py-1 rounded-full inline-block ${sub.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : sub.status === 'paused' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
              {sub.status === 'active' ? '✅ Active' : sub.status === 'paused' ? '⏸️ Paused' : '❌ Cancelled'}
            </div>
          </motion.div>
        ))}
      </div>

      {subscriptions.length === 0 && !loading && (
        <div className="glass-card flex flex-col items-center py-16 text-dark-400">
          <FiTv className="w-16 h-16 mb-3 opacity-30" />
          <p className="text-lg font-medium">No subscriptions yet</p>
          <p className="text-sm">Add your first subscription to start tracking</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? 'Edit Subscription' : 'Add Subscription'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="e.g., Netflix" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">
                {SUB_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Amount *</label>
              <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input-field" placeholder="₹ 0" required min="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Billing Cycle</label>
              <select value={formData.billingCycle} onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })} className="input-field">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Next Billing *</label>
              <input type="date" value={formData.nextBillingDate} onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Usage Score (1-10): {formData.usageScore}</label>
            <input type="range" min="1" max="10" value={formData.usageScore} onChange={(e) => setFormData({ ...formData, usageScore: parseInt(e.target.value) })} className="w-full" />
            <div className="flex justify-between text-xs text-dark-400 mt-1"><span>Never used</span><span>Daily use</span></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field" rows={2} />
          </div>
          <button type="submit" className="w-full btn-primary">{editingId ? 'Update' : 'Add'} Subscription</button>
        </form>
      </Modal>
    </div>
  );
};

export default Subscriptions;
