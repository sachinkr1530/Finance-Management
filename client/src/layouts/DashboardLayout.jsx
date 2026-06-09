import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { toggleTheme } from '../redux/slices/themeSlice';
import { FiHome, FiCreditCard, FiTarget, FiBarChart2, FiMessageSquare, FiSettings, FiLogOut, FiSun, FiMoon, FiBell, FiUser, FiTv, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { path: '/', label: 'Dashboard', icon: FiHome },
  { path: '/expenses', label: 'Expenses', icon: FiCreditCard },
  { path: '/goals', label: 'Goals', icon: FiTarget },
  { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: '/subscriptions', label: 'Subscriptions', icon: FiTv },
  { path: '/settings', label: 'Settings', icon: FiSettings },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={`min-h-screen bg-dark-50 dark:bg-dark-950 transition-colors duration-300`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-dark-200 dark:border-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
              F
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-900 dark:text-white">FinanceAI</h1>
              <p className="text-xs text-dark-500 dark:text-dark-400">Smart Money Manager</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-200 dark:border-dark-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-900 dark:text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-dark-500 dark:text-dark-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors text-sm"
            >
              {mode === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-200 dark:border-dark-800">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
                <FiMenu className="w-5 h-5 text-dark-700 dark:text-dark-300" />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
                </h2>
                <p className="text-sm text-dark-500 dark:text-dark-400">Here's your financial overview</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              >
                <FiBell className="w-5 h-5 text-dark-600 dark:text-dark-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-primary-500/20"
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
