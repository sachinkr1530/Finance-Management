import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { FiBell, FiCheck, FiTrash2, FiAlertTriangle, FiTarget, FiCreditCard, FiDollarSign } from 'react-icons/fi';

const typeIcons = {
  overspending: '🚨',
  budget_warning: '⚠️',
  goal_reminder: '🎯',
  subscription_renewal: '🔄',
  low_savings: '💾',
  goal_completed: '🎉',
  salary_received: '💰',
  weekly_report: '📊',
  ai_insight: '🤖',
  system: '🔔',
};

const priorityColors = {
  low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
  medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
  high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10',
  critical: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    await notificationAPI.markRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id) => {
    await notificationAPI.delete(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Notifications</h1>
          <p className="text-dark-500 dark:text-dark-400">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <FiCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {notifications.map((notif, i) => (
            <motion.div
              key={notif._id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 border-l-4 ${priorityColors[notif.priority] || ''} ${!notif.isRead ? 'ring-1 ring-primary-200 dark:ring-primary-800' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{typeIcons[notif.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-dark-900 dark:text-white text-sm">{notif.title}</h3>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                  </div>
                  <p className="text-sm text-dark-600 dark:text-dark-300 mt-1">{notif.message}</p>
                  <p className="text-xs text-dark-400 mt-2">{formatDate(notif.createdAt)}</p>
                </div>
                <button onClick={() => deleteNotif(notif._id)} className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 shrink-0">
                  <FiTrash2 className="w-4 h-4 text-dark-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && !loading && (
          <div className="glass-card flex flex-col items-center py-16 text-dark-400">
            <FiBell className="w-16 h-16 mb-3 opacity-30" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
