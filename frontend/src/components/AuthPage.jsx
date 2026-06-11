import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Key, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';
import { apiService } from '../services/apiService';

// Custom SVG Google Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

// Custom SVG GitHub Icon
const GithubIcon = () => (
  <svg className="w-5 h-5 mr-2 flex-shrink-0 text-slate-700 dark:text-slate-300" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

export default function AuthPage({ onAuthSuccess, darkMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI States
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleSocialClick = (provider) => {
    showToast(`${provider} Authentication is a visual demo. Please sign in with email/password.`, 'info');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isLogin && !name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (!isLogin && !agreeTerms) {
      newErrors.agree = 'You must agree to the Terms and Privacy Policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        // Handle login
        const data = await apiService.login(email, password);
        showToast('Logged in successfully!', 'success');
        setTimeout(() => {
          onAuthSuccess(data.token, { _id: data._id, name: data.name, email: data.email });
        }, 800);
      } else {
        // Handle signup
        const data = await apiService.signup(name, email, password);
        showToast('Account registered successfully! Logging you in...', 'success');
        setTimeout(() => {
          onAuthSuccess(data.token, { _id: data._id, name: data.name, email: data.email });
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Authentication failed. Please check details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 relative overflow-hidden transition-colors duration-200">
      
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/5 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px] dark:bg-teal-500/5 pointer-events-none"></div>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 animate-slideDown ${
          toast.type === 'success' 
            ? 'bg-emerald-500 text-white' 
            : toast.type === 'info'
            ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
            : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? (
            <ShieldCheck className="w-5 h-5" />
          ) : toast.type === 'info' ? (
            <Sparkles className="w-5 h-5 text-amber-300 dark:text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-[13.5px] font-medium">{toast.message}</span>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="hover:opacity-85 active:scale-90 ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="w-full max-w-[450px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl p-6 md:p-8 transition-all relative z-10">
        
        {/* Toggle Mode (Header Layout matching sign up spec) */}
        {!isLogin && (
          <div className="flex justify-between items-center mb-6">
            {/* Small Header Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
                <span className="material-symbols-outlined text-[18px]">wallet</span>
              </div>
              <span className="font-bold text-[16px] text-slate-900 dark:text-white">PayTracker</span>
            </div>
            <div className="text-[13px] text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button 
                onClick={() => { setIsLogin(true); setErrors({}); }}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Log in
              </button>
            </div>
          </div>
        )}

        {/* LOGO & INTRO (For Login Screen) */}
        {isLogin && (
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 mb-3 active:scale-95 duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[28px] font-medium">wallet</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">PayTracker</h2>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1">Sign in to your financial dashboard</p>
          </div>
        )}

        {/* SIGN UP TITLE */}
        {!isLogin && (
          <div className="flex justify-between items-baseline mb-6">
            <h3 className="text-[22px] font-bold text-slate-900 dark:text-white">Create Account</h3>
            <span className="text-xs text-slate-400 font-medium">Step 1 of 3</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name field (Signup Only) */}
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border ${
                    errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  } rounded-xl text-[14px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.name}</p>}
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isLogin ? "name@company.com" : "jane@company.com"}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border ${
                  errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                } rounded-xl text-[14px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => showToast('Password reset is not configured for this demo.', 'info')}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border ${
                  errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                } rounded-xl text-[14px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!isLogin && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Min. 8 characters</p>}
            {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.password}</p>}
          </div>

          {/* Terms checkbox (Signup Only) */}
          {!isLogin && (
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-[12px] text-slate-500 dark:text-slate-400 leading-normal">
                  I agree to the{' '}
                  <button type="button" onClick={() => showToast('Terms of Service will display here.', 'info')} className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" onClick={() => showToast('Privacy Policy will display here.', 'info')} className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>
              {errors.agree && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.agree}</p>}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/60 text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all duration-150"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isLogin ? (
              <span>Sign In</span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* OR SEPARATOR */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isLogin ? 'Or Continue With' : 'Or Sign Up With'}
          </span>
        </div>

        {/* SOCIAL AUTH BUTTONS */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialClick('Google')}
            className="flex items-center justify-center px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[13px] font-semibold text-slate-700 dark:text-slate-300 rounded-xl transition-all hover:shadow-sm active:scale-95 duration-100"
          >
            <GoogleIcon />
            <span>Google</span>
          </button>
          
          {isLogin ? (
            <button
              type="button"
              onClick={() => handleSocialClick('SSO')}
              className="flex items-center justify-center px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[13px] font-semibold text-slate-700 dark:text-slate-300 rounded-xl transition-all hover:shadow-sm active:scale-95 duration-100"
            >
              <Key className="w-4.5 h-4.5 mr-2 text-slate-500 flex-shrink-0" />
              <span>SSO</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSocialClick('GitHub')}
              className="flex items-center justify-center px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[13px] font-semibold text-slate-700 dark:text-slate-300 rounded-xl transition-all hover:shadow-sm active:scale-95 duration-100"
            >
              <GithubIcon />
              <span>Github</span>
            </button>
          )}
        </div>

        {/* Toggle Auth Mode Link (Login Bottom) */}
        {isLogin && (
          <p className="text-[13px] text-center text-slate-500 dark:text-slate-400 mt-6 select-none">
            New to PayTracker?{' '}
            <button
              onClick={() => { setIsLogin(false); setErrors({}); }}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none"
            >
              Create an account
            </button>
          </p>
        )}

        {/* AI Security Alert Card (Signup Only) */}
        {!isLogin && (
          <div className="mt-6 p-3 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[12px] font-bold text-emerald-800 dark:text-emerald-400">AI Security Active</h4>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-500/80 leading-normal mt-0.5">
                Your data is encrypted with bank-level security and processed through our private financial intelligence layer.
              </p>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
            <button type="button" onClick={() => showToast('Privacy Policy details.', 'info')} className="hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</button>
            <span>•</span>
            <button type="button" onClick={() => showToast('Terms of Service details.', 'info')} className="hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</button>
          </div>
          <p className="text-[10px] text-slate-350 dark:text-slate-600 mt-2">
            {isLogin ? '© 2024 PayTracker Inc.' : '© 2024 PayTracker Technologies Inc. All rights reserved.'}
          </p>
        </div>

      </div>
    </div>
  );
}
