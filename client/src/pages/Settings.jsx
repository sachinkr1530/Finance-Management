import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { updateProfile, changePassword } from '../redux/slices/authSlice';
import { updateProfile } from '../redux/slices/authSlice';
import { toggleTheme } from '../redux/slices/themeSlice';
import { FiUser, FiMail, FiLock, FiSun, FiMoon, FiSave, FiDollarSign, FiShield, FiTrash2, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);

  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', monthlySalary: '', emergencyTarget: '', emergencyCurrent: ''
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        monthlySalary: user.monthlySalary || '',
        emergencyTarget: user.emergencyFund?.target || '',
        emergencyCurrent: user.emergencyFund?.current || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await dispatch(updateProfile({
      name: profileData.name,
      phone: profileData.phone,
      monthlySalary: parseFloat(profileData.monthlySalary) || 0,
      emergencyFund: {
        target: parseFloat(profileData.emergencyTarget) || 0,
        current: parseFloat(profileData.emergencyCurrent) || 0,
      }
    }));
    toast.success('Profile updated successfully!');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const result = await dispatch(changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error('Failed to change password');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'appearance', label: 'Appearance', icon: FiSun },
    { id: 'finance', label: 'Finance', icon: FiDollarSign },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Settings</h1>
        <p className="text-dark-500 dark:text-dark-400">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-6">Profile Information</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-lg font-semibold text-dark-900 dark:text-white">{profileData.name}</p>
                <p className="text-sm text-dark-500 dark:text-dark-400">{profileData.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input type="email" value={profileData.email} className="input-field pl-10 bg-dark-50 dark:bg-dark-800" disabled />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Monthly Salary</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input type="number" value={profileData.monthlySalary} onChange={(e) => setProfileData({ ...profileData, monthlySalary: e.target.value })} className="input-field pl-10" placeholder="₹ 50,000" />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary flex items-center gap-2">
              <FiSave className="w-4 h-4" /> Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-6">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Current Password</label>
              <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">New Password</label>
              <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="input-field" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Confirm New Password</label>
              <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="input-field" required />
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <FiLock className="w-4 h-4" /> Update Password
            </button>
          </form>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-6">Theme</h3>
          <div className="flex gap-4">
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`flex-1 p-6 rounded-2xl border-2 transition-all ${mode === 'light' ? 'border-primary-500 bg-white' : 'border-dark-600 bg-dark-800'}`}
            >
              <FiSun className="w-8 h-8 mb-2 text-yellow-500" />
              <p className="font-semibold text-dark-900 dark:text-white">Light Mode</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Clean and bright</p>
            </button>
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`flex-1 p-6 rounded-2xl border-2 transition-all ${mode === 'dark' ? 'border-primary-500 bg-dark-800' : 'border-dark-200 bg-white'}`}
            >
              <FiMoon className="w-8 h-8 mb-2 text-primary-500" />
              <p className="font-semibold text-dark-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Easy on the eyes</p>
            </button>
          </div>
        </div>
      )}

      {/* Finance Tab */}
      {activeTab === 'finance' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-6">Emergency Fund</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Target Amount</label>
              <input type="number" value={profileData.emergencyTarget} onChange={(e) => setProfileData({ ...profileData, emergencyTarget: e.target.value })} className="input-field" placeholder="₹ 3,00,000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Current Amount</label>
              <input type="number" value={profileData.emergencyCurrent} onChange={(e) => setProfileData({ ...profileData, emergencyCurrent: e.target.value })} className="input-field" placeholder="₹ 50,000" />
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <FiShield className="w-4 h-4" /> Save Emergency Fund
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
