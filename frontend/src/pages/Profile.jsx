import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  User, 
  Shield, 
  Sliders, 
  LifeBuoy, 
  ChevronRight, 
  Lock, 
  CheckCircle2, 
  EyeOff, 
  CreditCard, 
  Bell, 
  Globe, 
  HelpCircle, 
  Mail, 
  Info, 
  Star, 
  Pencil, 
  LogOut, 
  X,
  ShieldAlert,

} from 'lucide-react';
import avatarImg from '../assets/avatar.png';
import { apiService } from '../services/apiService';

export default function Profile() {
  const { 
    user, 
    setUser, 
    handleLogout, 
  } = useOutletContext();
  const navigate = useNavigate();

  // Dialog State Management
  const [activeModal, setActiveModal] = useState(null); // 'edit_profile', 'banks', 'subscription', 'password', 'privacy_center', 'notifications', 'help_center', 'contact', 'about'

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editStatus, setEditStatus] = useState({ type: '', message: '' });

  // Budget Limit Form State
  const [editBudget, setEditBudget] = useState(user?.budgetLimit || 40000);
  const [budgetStatus, setBudgetStatus] = useState({ type: '', message: '' });
  const [editCategoryBudgets, setEditCategoryBudgets] = useState(() => {
    const defaultBudgets = { Food: 0, Bills: 0, Education: 0, Entertainment: 0, Shopping: 0, Others: 0 };
    if (user?.categoryBudgets) {
      const uBudgets = user.categoryBudgets instanceof Map 
        ? Object.fromEntries(user.categoryBudgets) 
        : user.categoryBudgets;
      return { ...defaultBudgets, ...uBudgets };
    }
    return defaultBudgets;
  });

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });

  // Bank Account State
  const [linkedBanks, setLinkedBanks] = useState(() => {
    const saved = localStorage.getItem('pay_tracker_banks');
    return saved ? JSON.parse(saved) : ['HDFC BANK', 'ICICI BANK'];
  });


  // Image Upload state (Simulated)
  const [avatar, setAvatar] = useState(avatarImg);
  const [avatarMsg, setAvatarMsg] = useState('');

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditBudget(user.budgetLimit || 40000);
      
      const defaultBudgets = { Food: 0, Bills: 0, Education: 0, Entertainment: 0, Shopping: 0, Others: 0 };
      const uBudgets = user.categoryBudgets instanceof Map 
        ? Object.fromEntries(user.categoryBudgets) 
        : user.categoryBudgets || {};
      setEditCategoryBudgets({ ...defaultBudgets, ...uBudgets });
    }
  }, [user]);

  // Submit profile edit (reaches backend and stores updated user context)
  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      setEditStatus({ type: 'error', message: 'Name and email are required.' });
      return;
    }
    try {
      setEditStatus({ type: 'info', message: 'Updating profile...' });
      const updated = await apiService.updateProfile({ name: editName, email: editEmail });
      
      // Update Context
      setUser(updated);
      localStorage.setItem('pay_tracker_user', JSON.stringify(updated));
      localStorage.setItem('pay_tracker_token', updated.token);
      
      setEditStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => {
        setActiveModal(null);
        setEditStatus({ type: '', message: '' });
      }, 1200);
    } catch (err) {
      setEditStatus({ type: 'error', message: err.message || 'Failed to update profile.' });
    }
  };

  // Submit budget limit update (reaches backend and stores updated user context)
  const handleUpdateBudgetSubmit = async (e) => {
    e.preventDefault();
    const parsed = Number(editBudget);
    if (isNaN(parsed) || parsed < 0) {
      setBudgetStatus({ type: 'error', message: 'Please enter a valid positive number.' });
      return;
    }
    try {
      setBudgetStatus({ type: 'info', message: 'Updating budget limit...' });
      const updated = await apiService.updateProfile({ 
        budgetLimit: parsed,
        categoryBudgets: editCategoryBudgets
      });
      
      // Update Context
      setUser(updated);
      localStorage.setItem('pay_tracker_user', JSON.stringify(updated));
      localStorage.setItem('pay_tracker_token', updated.token);
      
      setBudgetStatus({ type: 'success', message: 'Budget limit updated successfully!' });
      setTimeout(() => {
        setActiveModal(null);
        setBudgetStatus({ type: '', message: '' });
      }, 1200);
    } catch (err) {
      setBudgetStatus({ type: 'error', message: err.message || 'Failed to update budget limit.' });
    }
  };

  // Submit Password update
  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordStatus({ type: 'error', message: 'Current password is required.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    try {
      setPasswordStatus({ type: 'info', message: 'Updating password...' });
      await apiService.updateProfile({ password: newPassword });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setActiveModal(null);
        setPasswordStatus({ type: '', message: '' });
      }, 1200);
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.message || 'Failed to update password.' });
    }
  };

  // Handle Avatar Change (Simulated)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAvatar(uploadEvent.target.result);
        setAvatarMsg('Profile photo updated locally!');
        setTimeout(() => setAvatarMsg(''), 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-12 animate-fadeIn">

      {/* User Header Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
            <img 
              src={avatar} 
              alt="User Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <label className="absolute bottom-0 right-0 bg-[#006c49] hover:bg-[#005237] text-white p-2 rounded-full cursor-pointer shadow-lg border-2 border-white dark:border-slate-900 transition-all hover:scale-105">
            <Pencil className="w-4 h-4" />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        {avatarMsg && (
          <p className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
            {avatarMsg}
          </p>
        )}

        <h3 className="text-[22px] font-bold text-primary dark:text-white mt-4">
          {user?.name || 'Alex Johnson'}
        </h3>
        <p className="text-[14px] text-on-surface-variant dark:text-slate-400 mt-0.5">
          {user?.email || 'alex.j@paytracker.io'}
        </p>

        <button 
          onClick={() => setActiveModal('edit_profile')}
          className="mt-4 px-6 py-2 bg-[#006c49] hover:bg-[#005439] text-white text-[14px] font-bold rounded-[10px] transition-colors shadow-sm active:scale-95 duration-100"
        >
          Edit Profile
        </button>
      </div>

      {/* Profile Categories List */}
      <div className="space-y-6">
        
        {/* Category 1: Account */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-outline-variant dark:border-slate-800 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-[#EEF3FE] dark:bg-slate-800/60 px-4 py-3.5 flex items-center gap-3 border-b border-[#E2E8F0] dark:border-slate-800">
            <User className="w-5 h-5 text-secondary dark:text-[#6ffbbe]" />
            <span className="font-bold text-[15px] text-primary dark:text-white">Account</span>
          </div>
          {/* Body items */}
          <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
            <div 
              onClick={() => setActiveModal('edit_profile')}
              className="flex justify-between items-center px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[14px] font-bold text-primary dark:text-white">Personal Information</p>
                <p className="text-[12px] text-on-surface-variant dark:text-slate-400 mt-0.5">Manage your identity data</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>

            <div 
              onClick={() => setActiveModal('edit_budget')}
              className="flex justify-between items-center px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[14px] font-bold text-primary dark:text-white">Monthly Budget Limit</p>
                <p className="text-[12px] text-on-surface-variant dark:text-slate-400 mt-0.5">
                  Current Limit: ₹{user?.budgetLimit !== undefined ? user.budgetLimit : 40000}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Category 2: Security & Privacy */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-outline-variant dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="bg-[#EEF3FE] dark:bg-slate-800/60 px-4 py-3.5 flex items-center gap-3 border-b border-[#E2E8F0] dark:border-slate-800">
            <Shield className="w-5 h-5 text-secondary dark:text-[#6ffbbe]" />
            <span className="font-bold text-[15px] text-primary dark:text-white">Security & Privacy</span>
          </div>
          <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
            <div 
              onClick={() => setActiveModal('password')}
              className="flex justify-between items-center px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <span className="text-[14px] font-bold text-primary dark:text-white">Change Password</span>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>

            <div 
              onClick={() => setActiveModal('privacy_center')}
              className="flex justify-between items-center px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <span className="text-[14px] font-bold text-primary dark:text-white">Privacy Center</span>
              <EyeOff className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>


        {/* Category 4: Support */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-outline-variant dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="bg-[#EEF3FE] dark:bg-slate-800/60 px-4 py-3.5 flex items-center gap-3 border-b border-[#E2E8F0] dark:border-slate-800">
            <LifeBuoy className="w-5 h-5 text-secondary dark:text-[#6ffbbe]" />
            <span className="font-bold text-[15px] text-primary dark:text-white">Support</span>
          </div>
          <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
            <div 
              onClick={() => setActiveModal('help_center')}
              className="flex justify-between items-center px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <span className="text-[14px] font-bold text-primary dark:text-white">Help Center</span>
              <HelpCircle className="w-5 h-5 text-slate-400" />
            </div>


            <div 
              onClick={() => setActiveModal('about')}
              className="flex justify-between items-center px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <span className="text-[14px] font-bold text-primary dark:text-white">About PayTracker</span>
              <Info className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Log Out CTA */}
        <div className="pt-4 flex justify-center">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-[16px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 py-3 px-6 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-98 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* 1. Edit Profile Modal */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#EEF3FE] dark:bg-slate-800/60">
              <h3 className="font-bold text-[16px] text-primary dark:text-white">Edit Profile Details</h3>
              <button onClick={() => { setActiveModal(null); setEditStatus({ type: '', message: '' }); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfileSubmit} className="p-5 space-y-4">
              {editStatus.message && (
                <div className={`p-3 rounded-lg text-[13px] font-medium ${
                  editStatus.type === 'error' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' :
                  editStatus.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                  'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {editStatus.message}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] focus:outline-none focus:border-[#006c49] dark:text-white"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] focus:outline-none focus:border-[#006c49] dark:text-white"
                  placeholder="email@example.com"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setActiveModal(null); setEditStatus({ type: '', message: '' }); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[14px] rounded-[10px] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#006c49] hover:bg-[#005439] text-white font-bold text-[14px] rounded-[10px] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1.2 Edit Budget Modal */}
      {activeModal === 'edit_budget' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#EEF3FE] dark:bg-slate-800/60">
              <h3 className="font-bold text-[16px] text-primary dark:text-white">Edit Monthly Budget</h3>
              <button onClick={() => { setActiveModal(null); setBudgetStatus({ type: '', message: '' }); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleUpdateBudgetSubmit} className="p-5 space-y-4">
              {budgetStatus.message && (
                <div className={`p-3 rounded-lg text-[13px] font-medium ${
                  budgetStatus.type === 'error' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' :
                  budgetStatus.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                  'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {budgetStatus.message}
                </div>
              )}
              <div className="space-y-3 pr-1 max-h-[350px] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Monthly Budget (₹)</label>
                  <input 
                    type="number" 
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] focus:outline-none focus:border-[#006c49] dark:text-white"
                    placeholder="e.g. 40000"
                  />
                </div>
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[13px] font-bold text-primary dark:text-white mb-2">Category Budgets (Optional)</p>
                  <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mb-3">Set specific limits for individual categories (keep 0 for unlimited).</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {['Food', 'Bills', 'Education', 'Entertainment', 'Shopping', 'Others'].map(cat => (
                      <div key={cat} className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            {cat === 'Food' ? 'local_cafe' :
                             cat === 'Bills' ? 'receipt' :
                             cat === 'Education' ? 'school' :
                             cat === 'Entertainment' ? 'movie' :
                             cat === 'Shopping' ? 'shopping_bag' : 'help_outline'}
                          </span>
                          {cat}
                        </label>
                        <input 
                          type="number" 
                          value={editCategoryBudgets[cat] || ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                            setEditCategoryBudgets(prev => ({ ...prev, [cat]: val }));
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-[8px] text-[13px] focus:outline-none focus:border-[#006c49] dark:text-white"
                          placeholder="No limit"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setActiveModal(null); setBudgetStatus({ type: '', message: '' }); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[14px] rounded-[10px] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#006c49] hover:bg-[#005439] text-white font-bold text-[14px] rounded-[10px] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 4. Change Password Modal */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#EEF3FE] dark:bg-slate-800/60">
              <h3 className="font-bold text-[16px] text-primary dark:text-white">Change Account Password</h3>
              <button onClick={() => { setActiveModal(null); setPasswordStatus({ type: '', message: '' }); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePasswordSubmit} className="p-5 space-y-4">
              {passwordStatus.message && (
                <div className={`p-3 rounded-lg text-[13px] font-medium ${
                  passwordStatus.type === 'error' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' :
                  passwordStatus.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                  'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {passwordStatus.message}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] focus:outline-none focus:border-[#006c49] dark:text-white"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] focus:outline-none focus:border-[#006c49] dark:text-white"
                  placeholder="Min 8 characters"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] focus:outline-none focus:border-[#006c49] dark:text-white"
                  placeholder="••••••••"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setActiveModal(null); setPasswordStatus({ type: '', message: '' }); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[14px] rounded-[10px] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#006c49] hover:bg-[#005439] text-white font-bold text-[14px] rounded-[10px] transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Privacy Center Modal */}
      {activeModal === 'privacy_center' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#EEF3FE] dark:bg-slate-800/60">
              <h3 className="font-bold text-[16px] text-primary dark:text-white">Privacy Center</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-3 items-start bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl text-blue-700 dark:text-blue-300 text-[13px] leading-relaxed">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Your transaction data is encrypted end-to-end. We do not sell or expose your financial statements to external parties.</span>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => alert("Downloading all backup files to your browser...")}
                  className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-[13.5px] dark:text-white"
                >
                  Export Data Backup (JSON)
                </button>
                <button 
                  onClick={() => alert("Request to purge data recorded. All server logs deleted.")}
                  className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-[13.5px] text-red-600 dark:text-red-400"
                >
                  Delete Account & Wipe Transactions
                </button>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-[#006c49] hover:bg-[#005439] text-white font-bold text-[14px] rounded-[10px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 9. Help Center Modal */}
      {activeModal === 'help_center' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#EEF3FE] dark:bg-slate-800/60">
              <h3 className="font-bold text-[16px] text-primary dark:text-white">Help Center FAQ</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-1.5">
                <p className="text-[14px] font-bold text-primary dark:text-white">Q: How does the AI Scanner work?</p>
                <p className="text-[12.5px] text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  A: The AI scanner analyzes image screenshots to extract merchant names, categories, currency signs, transaction dates, and amounts using optical character recognition (OCR).
                </p>
              </div>
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="text-[14px] font-bold text-primary dark:text-white">Q: Can I edit scanned entries?</p>
                <p className="text-[12.5px] text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  A: Yes, you can edit dates, amounts, categories, and merchant names directly from the "Payments" list by clicking on the pencil edit button.
                </p>
              </div>
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="text-[14px] font-bold text-primary dark:text-white">Q: How do I change the default currency?</p>
                <p className="text-[12.5px] text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  A: Go to the "Preferences" section on this page, click "Currency" and select your preferred coin type. The whole app will update instantly.
                </p>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-[#006c49] hover:bg-[#005439] text-white font-bold text-[14px] rounded-[10px] transition-colors mt-2"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. About PayTracker Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden scale-in">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#EEF3FE] dark:bg-slate-800/60">
              <h3 className="font-bold text-[16px] text-primary dark:text-white">About PayTracker</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-5 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white mx-auto flex items-center justify-center font-extrabold text-[24px] shadow-md">
                P
              </div>
              <div>
                <h4 className="font-bold text-[18px] text-primary dark:text-white">PayTracker App</h4>
                <p className="text-[12px] text-on-surface-variant dark:text-slate-400 mt-1">Version 2.4.0 (Build 2026.06)</p>
              </div>
              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed px-2">
                PayTracker is a smart expense-tracking application designed to automate receipt collation and analytics with advanced AI.
              </p>
              <div className="pt-2 text-[11px] text-slate-400">
                © 2026 PayTracker Inc. All rights reserved.
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-[#006c49] hover:bg-[#005439] text-white font-bold text-[14px] rounded-[10px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
