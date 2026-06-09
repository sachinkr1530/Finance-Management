import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiTarget, FiCreditCard, FiActivity, FiArrowRight, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import { expenseAPI, salaryAPI, analyticsAPI, goalAPI, notificationAPI } from '../services/api';
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColor, getScoreColor, CHART_COLORS } from '../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0,
    savingsRate: 0,
    categoryBreakdown: [],
    dailyTrend: [],
    recentExpenses: [],
    goals: [],
    healthScore: null,
    notifications: [],
    predictions: null,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const [analyticsRes, expensesRes, goalsRes, healthRes, notificationsRes] = await Promise.allSettled([
        analyticsAPI.getMonthly({ month, year }),
        expenseAPI.getAll({ month, year, limit: 5 }),
        goalAPI.getAll({ status: 'active' }),
        analyticsAPI.getHealthScore(),
        notificationAPI.getAll({ limit: 5 }),
      ]);

      const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data.analytics : {};
      const expenses = expensesRes.status === 'fulfilled' ? expensesRes.value.data : {};
      const goals = goalsRes.status === 'fulfilled' ? goalsRes.value.data : {};
      const health = healthRes.status === 'fulfilled' ? healthRes.value.data.score : null;
      const notifications = notificationsRes.status === 'fulfilled' ? notificationsRes.value.data.notifications : [];

      setDashboardData({
        totalIncome: analytics.totalIncome || user?.monthlySalary || 0,
        totalExpenses: analytics.totalExpenses || 0,
        savings: analytics.savings || 0,
        savingsRate: analytics.savingsRate || 0,
        categoryBreakdown: analytics.expenseBreakdown || [],
        dailyTrend: analytics.dailyTrend || [],
        recentExpenses: expenses.expenses || [],
        goals: goals.goals || [],
        healthScore: health,
        notifications,
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const { totalIncome, totalExpenses, savings, savingsRate, categoryBreakdown, recentExpenses, goals, healthScore, notifications } = dashboardData;

  const pieData = categoryBreakdown.map((cat, i) => ({
    name: cat._id,
    value: cat.total,
    color: getCategoryColor(cat._id),
  }));

  const dailyChartData = dashboardData.dailyTrend.map(d => ({
    day: `Day ${d._id}`,
    amount: d.total,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
          <p className="text-dark-500 dark:text-dark-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/expenses')} className="btn-secondary text-sm">
            <span className="flex items-center gap-2"><FiCreditCard className="w-4 h-4" /> Add Expense</span>
          </button>
          
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
       
       
        <StatCard title="Monthly Income" value={formatCurrency(totalIncome)} subtitle="This month" icon={FiTrendingUp} trend="up" trendValue="Income" color="green" delay={0.1} />
       <StatCard title="Total Balance" value={formatCurrency(Math.max(totalIncome - totalExpenses, 0))} subtitle={`${savingsRate}% savings rate`} icon={FiDollarSign} trend={(totalIncome - totalExpenses) > 0 ? 'up' : 'down'} trendValue={`${savingsRate}%`} color="primary" delay={0}/>
        
        <StatCard title="Monthly Expenses" value={formatCurrency(totalExpenses)} subtitle={`${categoryBreakdown.length} categories`} icon={FiTrendingDown} trend={totalExpenses > totalIncome ? 'down' : 'up'} trendValue="Spent" color="red" delay={0.2} />
        <StatCard title="Health Score" value={healthScore ? `${healthScore.total}/100` : '--'} subtitle={healthScore?.grade || 'Calculating...'} icon={FiActivity} trend="up" trendValue={healthScore?.grade || '--'} color={healthScore?.total >= 60 ? 'green' : 'yellow'} delay={0.3} />
      </div>

      {/* Financial Health Score Card */}
      {healthScore && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10" className="text-dark-200 dark:text-dark-700" />
                <circle cx="80" cy="80" r="70" fill="none" stroke={getScoreColor(healthScore.total)} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(healthScore.total / 100) * 440} 440`} className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: getScoreColor(healthScore.total) }}>{healthScore.total}</span>
                <span className="text-xs text-dark-500 dark:text-dark-400">out of 100</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Financial Health Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(healthScore.breakdown).map(([key, data]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-600 dark:text-dark-300">{data.label}</span>
                      <span className="font-semibold text-dark-900 dark:text-white">{data.score}/{data.max}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill bg-primary-500" style={{ width: `${(data.score / data.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Daily Expense Trend</h3>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-dark-400">
              <p>No expense data for this month yet</p>
            </div>
          )}
        </motion.div>

        {/* Category Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Category Breakdown</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto">
                {pieData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-dark-600 dark:text-dark-300 flex-1">{cat.name}</span>
                    <span className="text-sm font-semibold text-dark-900 dark:text-white">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-dark-400">
              <p>No categories to show</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Recent Transactions</h3>
            <button onClick={() => navigate('/expenses')} className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center gap-1">
              View All <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div key={expense._id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${getCategoryColor(expense.category)}15` }}>
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{expense.title}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">{expense.category} · {formatDate(expense.date)}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-500 dark:text-red-400">-{formatCurrency(expense.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-dark-400">
              <FiCreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent transactions</p>
            </div>
          )}
        </motion.div>

        {/* Active Goals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Active Goals</h3>
            <button onClick={() => navigate('/goals')} className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center gap-1">
              View All <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => {
                const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100);
                return (
                  <div key={goal._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{goal.icon || '🎯'}</span>
                        <div>
                          <p className="text-sm font-medium text-dark-900 dark:text-white">{goal.title}</p>
                          <p className="text-xs text-dark-500 dark:text-dark-400">{formatCurrency(goal.savedAmount)} of {formatCurrency(goal.targetAmount)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${progress}%`, background: `linear-gradient(to right, ${goal.color || '#6366f1'}, ${goal.color || '#6366f1'}aa)` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-dark-400">
              <FiTarget className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active goals</p>
              <button onClick={() => navigate('/goals')} className="mt-2 text-primary-500 text-sm hover:underline">Create a goal</button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Smart Notifications */}
      {notifications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">🔔 Smart Notifications</h3>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif, i) => (
              <div key={i} className={`p-4 rounded-xl border ${
                notif.priority === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                notif.priority === 'high' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' :
                'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg">{notif.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark-900 dark:text-white">{notif.title}</p>
                    <p className="text-xs text-dark-600 dark:text-dark-300 mt-1">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
