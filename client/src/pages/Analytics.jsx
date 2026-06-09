import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI } from '../services/api';
import { formatCurrency, getMonthName, getCategoryColor, getScoreColor, CHART_COLORS } from '../utils/helpers';
import { FiCalendar, FiActivity, FiTrendingUp, FiTarget } from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend
} from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [analytics, setAnalytics] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { loadData(); }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, healthRes, predRes] = await Promise.allSettled([
        analyticsAPI.getMonthly({ month, year }),
        analyticsAPI.getHealthScore(),
        analyticsAPI.getPredictions(),
      ]);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.analytics);
      if (healthRes.status === 'fulfilled') setHealthScore(healthRes.value.data.score);
      if (predRes.status === 'fulfilled') setPredictions(predRes.value.data.predictions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoryPieData = (analytics?.expenseBreakdown || []).map((cat, i) => ({
    name: cat._id,
    value: cat.total,
    color: getCategoryColor(cat._id),
  }));

  const monthlyTrendData = (analytics?.monthlyTrend || []).map(m => ({
    month: getMonthName(m._id.month),
    expenses: m.total,
  }));

  const incomeVsExpense = monthlyTrendData.map((m, i) => ({
    ...m,
    income: analytics?.totalIncome || 0,
  }));

  const dailyData = (analytics?.dailyTrend || []).map(d => ({
    day: d._id,
    amount: d.total,
  }));

  const futureData = (predictions?.futureBalances || []).map(f => ({
    month: f.month,
    savings: f.predictedSavings,
    cumulative: f.cumulativeSavings,
  }));

  if (loading) return <LoadingSpinner size="lg" text="Loading analytics..." />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiActivity },
    { id: 'expenses', label: 'Expenses', icon: FiCalendar },
    { id: 'predictions', label: 'Predictions', icon: FiTrendingUp },
    { id: 'health', label: 'Health Score', icon: FiTarget },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Analytics</h1>
          <p className="text-dark-500 dark:text-dark-400">Deep insights into your finances</p>
        </div>
        <div className="flex gap-3">
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="input-field w-auto py-2 text-sm">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="input-field w-auto py-2 text-sm">
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-card p-5">
              <p className="text-sm text-dark-500 dark:text-dark-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(analytics?.totalIncome)}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <p className="text-sm text-dark-500 dark:text-dark-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{formatCurrency(analytics?.totalExpenses)}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
              <p className="text-sm text-dark-500 dark:text-dark-400">Net Savings</p>
              <p className={`text-2xl font-bold mt-1 ${(analytics?.savings || 0) >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-500'}`}>{formatCurrency(analytics?.savings)}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
              <p className="text-sm text-dark-500 dark:text-dark-400">Savings Rate</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{analytics?.savingsRate || 0}%</p>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Monthly Expense Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrendData}>
                  <defs>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="expenses" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {categoryPieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Budget Utilization */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Budget Utilization</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-dark-600 dark:text-dark-300">Spent</span>
                  <span className="text-sm font-semibold text-dark-900 dark:text-white">{analytics?.budgetUtilization || 0}%</span>
                </div>
                <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, analytics?.budgetUtilization || 0)}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${(analytics?.budgetUtilization || 0) > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : (analytics?.budgetUtilization || 0) > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-dark-500 dark:text-dark-400">of {formatCurrency(analytics?.totalIncome)}</p>
                <p className="text-lg font-bold text-dark-900 dark:text-white">{formatCurrency(analytics?.totalExpenses)}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Daily Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Category Spending</h3>
              <div className="space-y-3">
                {(analytics?.expenseBreakdown || []).map((cat, i) => {
                  const percentage = analytics?.totalExpenses ? Math.round((cat.total / analytics.totalExpenses) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-600 dark:text-dark-300">{cat._id} ({cat.count})</span>
                        <span className="font-semibold text-dark-900 dark:text-white">{formatCurrency(cat.total)} ({percentage}%)</span>
                      </div>
                      <div className="progress-bar-bg h-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="progress-bar-fill h-2" style={{ backgroundColor: getCategoryColor(cat._id) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5">
              <p className="text-sm text-dark-500 dark:text-dark-400">Predicted Monthly Savings</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(predictions?.nextMonthSavings)}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-dark-500 dark:text-dark-400">Overspending Risk</p>
              <p className={`text-2xl font-bold mt-1 ${predictions?.overspendingRisk === 'high' ? 'text-red-500' : predictions?.overspendingRisk === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                {predictions?.overspendingRisk?.toUpperCase() || 'LOW'}
              </p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-dark-500 dark:text-dark-400">Avg Monthly Expense</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-white mt-1">{formatCurrency(predictions?.avgMonthlyExpense)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">3-Month Savings Prediction</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={predictions?.futureBalances || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="predictedSavings" fill="#6366f1" radius={[4, 4, 0, 0]} name="Monthly Savings" />
                  <Bar dataKey="cumulativeSavings" fill="#22c55e" radius={[4, 4, 0, 0]} name="Cumulative" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Goal Completion Predictions</h3>
              <div className="space-y-4">
                {(predictions?.goalPredictions || []).map((goal, i) => (
                  <div key={i} className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-dark-900 dark:text-white">{goal.goal}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${goal.achievable ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {goal.achievable ? '✅ On Track' : '⚠️ Risk'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-dark-500 dark:text-dark-400">Remaining</p>
                        <p className="font-semibold text-dark-900 dark:text-white">{formatCurrency(goal.remaining)}</p>
                      </div>
                      <div>
                        <p className="text-dark-500 dark:text-dark-400">Monthly Needed</p>
                        <p className="font-semibold text-dark-900 dark:text-white">{formatCurrency(goal.requiredMonthly)}</p>
                      </div>
                      <div>
                        <p className="text-dark-500 dark:text-dark-400">Predicted</p>
                        <p className="font-semibold text-dark-900 dark:text-white">{goal.predictedCompletion}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!predictions?.goalPredictions || predictions.goalPredictions.length === 0) && (
                  <p className="text-center text-dark-400 py-8">No active goals to predict</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Health Score Tab */}
      {activeTab === 'health' && healthScore && (
        <div className="space-y-6">
          <div className="glass-card p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="12" className="text-dark-200 dark:text-dark-700" />
                  <motion.circle
                    cx="100" cy="100" r="85" fill="none" stroke={getScoreColor(healthScore.total)} strokeWidth="12"
                    strokeLinecap="round" strokeDasharray={`${(healthScore.total / 100) * 534} 534`}
                    initial={{ strokeDasharray: '0 534' }}
                    animate={{ strokeDasharray: `${(healthScore.total / 100) * 534} 534` }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold" style={{ color: getScoreColor(healthScore.total) }}>{healthScore.total}</span>
                  <span className="text-sm text-dark-500 dark:text-dark-400">out of 100</span>
                  <span className="text-lg font-semibold mt-1" style={{ color: getScoreColor(healthScore.total) }}>{healthScore.grade}</span>
                </div>
              </div>

              <div className="flex-1 w-full">
                <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Financial Health Breakdown</h3>
                <div className="space-y-5">
                  {Object.entries(healthScore.breakdown).map(([key, data], i) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-dark-600 dark:text-dark-300">{data.label}</span>
                        <span className="text-sm font-bold text-dark-900 dark:text-white">{data.score}/{data.max}</span>
                      </div>
                      <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(data.score / data.max) * 100}%` }}
                          transition={{ duration: 1.5, delay: i * 0.2 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {healthScore.recommendations?.length > 0 && (
                  <div className="mt-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">💡 Recommendations</h4>
                    <ul className="space-y-1">
                      {healthScore.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-yellow-700 dark:text-yellow-400">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
