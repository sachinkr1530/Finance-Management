import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'primary', delay = 0 }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/20',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    red: 'from-red-500 to-red-600 shadow-red-500/20',
    yellow: 'from-amber-500 to-amber-600 shadow-amber-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    pink: 'from-pink-500 to-pink-600 shadow-pink-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6 card-hover"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white">{value}</p>
          {(subtitle || trendValue) && (
            <div className="flex items-center gap-2 mt-2">
              {trendValue && (
                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                  trend === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  trend === 'down' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                </span>
              )}
              {subtitle && <span className="text-xs text-dark-500 dark:text-dark-400">{subtitle}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
