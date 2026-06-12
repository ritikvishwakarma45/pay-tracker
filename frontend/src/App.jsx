import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Scan as ScanIcon, 
  PieChart as PieIcon, 
  History as HistoryIcon, 
  User as UserIcon,
  CreditCard as CardIcon,
  Moon, 
  Sun, 
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import EditModal from './components/EditModal';
import AddModal from './components/AddModal';
import AIChatBubble from './components/AIChatBubble';
import AuthPage from './components/AuthPage';
import { apiService } from './services/apiService';

// Lazy load the pages for code-splitting
const Home = lazy(() => import('./pages/Home'));
const Scan = lazy(() => import('./pages/Scan'));
const Insights = lazy(() => import('./pages/Insights'));
const History = lazy(() => import('./pages/History'));
const Profile = lazy(() => import('./pages/Profile'));

// Premium Page loading skeleton/spinner
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[300px] animate-fadeIn">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
    <p className="mt-3 text-[14px] text-on-surface-variant dark:text-slate-400">Loading page...</p>
  </div>
);

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Preferences settings state
  const [currency, setCurrency] = useState(() => localStorage.getItem('pay_tracker_currency') || 'INR');
  const [language, setLanguage] = useState(() => localStorage.getItem('pay_tracker_language') || 'English (US)');

  // Auth state initialized from localStorage
  const [token, setToken] = useState(localStorage.getItem('pay_tracker_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pay_tracker_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Edit modal state
  const [selectedTx, setSelectedTx] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Add modal state
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('pay_tracker_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Save notifications to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pay_tracker_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Check budget breach dynamically
  useEffect(() => {
    if (!user || transactions.length === 0) return;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const totalSpent = currentMonthTransactions.reduce((acc, curr) => acc + curr.amount, 0);
    const limit = user.budgetLimit !== undefined ? user.budgetLimit : 40000;
    const pct = (totalSpent / limit) * 100;

    setNotifications(prev => {
      // Remove any existing budget notifications so we don't duplicate them
      const filtered = prev.filter(n => !n.id.startsWith('budget-'));
      
      const newBudgetNotifs = [];
      if (pct >= 100) {
        newBudgetNotifs.push({
          id: `budget-100-${currentYear}-${currentMonth}`,
          title: 'Budget Limit Exceeded! ⚠️',
          message: `You have spent ₹${totalSpent.toLocaleString('en-IN')}, exceeding your monthly limit of ₹${limit.toLocaleString('en-IN')}.`,
          type: 'danger',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (pct >= 80) {
        newBudgetNotifs.push({
          id: `budget-80-${currentYear}-${currentMonth}`,
          title: 'Budget Warning (80% Reached) 🔔',
          message: `You have spent ₹${totalSpent.toLocaleString('en-IN')} (${Math.round(pct)}%) of your monthly budget of ₹${limit.toLocaleString('en-IN')}.`,
          type: 'warning',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      // Check if we already have this specific budget notification in the filtered list
      // (avoid overriding isRead status if already present)
      const finalNotifs = [...filtered];
      newBudgetNotifs.forEach(bn => {
        const existing = prev.find(n => n.id === bn.id);
        if (existing) {
          finalNotifs.unshift(existing);
        } else {
          finalNotifs.unshift(bn);
        }
      });

      return finalNotifs;
    });
  }, [transactions, user]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Add manual transaction handler
  const handleAddSave = (newTx) => {
    setTransactions(prev => [newTx, ...prev]);
    
    // Add manual success notification
    const addNotif = {
      id: `add-${newTx._id || Date.now()}`,
      title: 'Transaction Added 📝',
      message: `Added ₹${newTx.amount} to ${newTx.merchantName} manually.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [addNotif, ...prev]);

    navigate('/history');
  };

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions when authenticated token is set
  useEffect(() => {
    if (token) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Auth event handlers
  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('pay_tracker_token', newToken);
    localStorage.setItem('pay_tracker_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('pay_tracker_token');
    localStorage.removeItem('pay_tracker_user');
    setToken(null);
    setUser(null);
    setTransactions([]);
    setNotifications([]);
    navigate('/login');
  };

  // Theme Toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Add newly scanned transaction
  const handleScanSuccess = (newTx) => {
    setTransactions(prev => [newTx, ...prev]);
    
    // Add scan success notification
    const scanNotif = {
      id: `scan-${newTx._id || Date.now()}`,
      title: 'Scan Success ✨',
      message: `Scanned ₹${newTx.amount} from ${newTx.merchantName} successfully.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [scanNotif, ...prev]);

    setTimeout(() => {
      navigate('/history');
    }, 1500);
  };

  // Delete transaction handler
  const handleDeleteTransaction = async (id) => {
    try {
      await apiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete transaction.');
    }
  };

  // Open edit modal
  const handleEditOpen = (tx) => {
    setSelectedTx(tx);
    setIsEditOpen(true);
  };

  // Save manual edit
  const handleEditSave = (updatedTx) => {
    setTransactions(prev => prev.map(t => t._id === updatedTx._id ? updatedTx : t));
  };

  const budgetLimit = user?.budgetLimit !== undefined ? user.budgetLimit : 40000;

  const currencyFormats = {
    INR: { locale: 'en-IN', currency: 'INR' },
    USD: { locale: 'en-US', currency: 'USD' },
    EUR: { locale: 'de-DE', currency: 'EUR' },
    GBP: { locale: 'en-GB', currency: 'GBP' }
  };

  const formatCurrency = (val) => {
    const config = currencyFormats[currency] || currencyFormats.INR;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <Routes>
      {/* Login / Auth page route */}
      <Route 
        path="/login" 
        element={
          token ? (
            <Navigate to="/" replace />
          ) : (
            <AuthPage onAuthSuccess={handleAuthSuccess} darkMode={darkMode} />
          )
        } 
      />

      {/* Main dashboard portal route (protected by token check) */}
      <Route 
        path="/" 
        element={
          !token ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="min-h-screen bg-[#F9F9FF] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-24 md:pb-8">
              
              {/* TopAppBar */}
              <header className="w-full top-0 sticky bg-white dark:bg-slate-900 border-b border-outline-variant dark:border-slate-800 z-40 shadow-sm transition-colors">
                <div className="flex justify-between items-center px-4 md:px-8 py-3 max-w-7xl mx-auto h-[64px]">
                  
                  {/* Logo & Avatar */}
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-outline-variant dark:border-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    </div>
                    <h1 className="text-[20px] font-bold text-[#006c49] dark:text-[#6ffbbe] tracking-tight">Pay Tracker</h1>
                  </div>

                  {/* Desktop Navigation */}
                  <nav className="hidden md:flex items-center gap-8">
                    <button 
                      onClick={() => navigate('/')}
                      className={`font-semibold text-[14px] transition-colors flex items-center gap-1.5 ${
                        activeTab === '/' 
                          ? 'text-[#006c49] dark:text-[#6ffbbe]' 
                          : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white'
                      }`}
                    >
                      <HomeIcon className="w-4 h-4" />
                      <span>Home</span>
                    </button>
                    <button 
                      onClick={() => navigate('/scan')}
                      className={`font-semibold text-[14px] transition-colors flex items-center gap-1.5 ${
                        activeTab === '/scan' 
                          ? 'text-[#006c49] dark:text-[#6ffbbe]' 
                          : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white'
                      }`}
                    >
                      <ScanIcon className="w-4 h-4" />
                      <span>Scan</span>
                    </button>
                    <button 
                      onClick={() => navigate('/insights')}
                      className={`font-semibold text-[14px] transition-colors flex items-center gap-1.5 ${
                        activeTab === '/insights' 
                          ? 'text-[#006c49] dark:text-[#6ffbbe]' 
                          : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white'
                      }`}
                    >
                      <PieIcon className="w-4 h-4" />
                      <span>Insights</span>
                    </button>
                    <button 
                      onClick={() => navigate('/history')}
                      className={`font-semibold text-[14px] transition-colors flex items-center gap-1.5 ${
                        activeTab === '/history' 
                          ? 'text-[#006c49] dark:text-[#6ffbbe]' 
                          : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white'
                      }`}
                    >
                      <HistoryIcon className="w-4 h-4" />
                      <span>History</span>
                    </button>
                    <button 
                      onClick={() => navigate('/profile')}
                      className={`font-semibold text-[14px] transition-colors flex items-center gap-1.5 ${
                        activeTab === '/profile' 
                          ? 'text-[#006c49] dark:text-[#6ffbbe]' 
                          : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white'
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                  </nav>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                      onClick={toggleDarkMode}
                      className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors active:scale-95"
                    >
                      {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notifications Bell */}
                    <div className="relative">
                      <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors relative active:scale-95"
                      >
                        <Bell className="w-5 h-5" />
                        {notifications.some(n => !n.isRead) && (
                          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
                        )}
                      </button>

                      {/* Dropdown Popover */}
                      {isNotifOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn max-h-[400px] flex flex-col">
                            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                              <span className="font-bold text-[14px] text-primary dark:text-white">Notifications</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={markAllAsRead}
                                  className="text-[11px] font-bold text-[#006c49] dark:text-[#6ffbbe] hover:underline"
                                >
                                  Read All
                                </button>
                                <button
                                  onClick={clearNotifications}
                                  className="text-[11px] font-bold text-red-500 hover:underline"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>
                            
                            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/50">
                              {notifications.length > 0 ? (
                                notifications.map(n => (
                                  <div
                                    key={n.id}
                                    className={`p-3.5 flex gap-3 transition-colors ${
                                      n.isRead ? 'opacity-75' : 'bg-slate-50/50 dark:bg-slate-800/20 font-medium'
                                    }`}
                                  >
                                    <div className="shrink-0 mt-0.5">
                                      {n.type === 'danger' && <AlertTriangle className="w-4.5 h-4.5 text-red-500" />}
                                      {n.type === 'warning' && <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />}
                                      {n.type === 'success' && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />}
                                      {n.type === 'info' && <Info className="w-4.5 h-4.5 text-blue-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[12.5px] font-bold text-primary dark:text-white truncate">{n.title}</p>
                                      <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal break-words">{n.message}</p>
                                      <p className="text-[9.5px] text-slate-400 mt-1">
                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-[13px] flex flex-col items-center justify-center gap-2">
                                  <Bell className="w-8 h-8 opacity-40 animate-bounce" />
                                  <span>No notifications yet.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      title="Sign Out"
                      className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                  </div>
                </div>
              </header>

              {/* Main Content container */}
              <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
                {loading ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
                    <p className="mt-3 text-[14px] text-on-surface-variant">Connecting to database...</p>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    {/* Lazy-loaded Route children are loaded here */}
                    <Suspense fallback={<PageLoader />}>
                      <Outlet context={{ 
                        transactions, 
                        user, 
                        setUser,
                        budgetLimit, 
                        formatCurrency, 
                        handleScanSuccess, 
                        setIsAddOpen, 
                        handleEditOpen, 
                        handleDeleteTransaction,
                        handleLogout,
                        currency,
                        setCurrency,
                        language,
                        setLanguage
                      }} />
                    </Suspense>
                  </div>
                )}
              </main>

              {/* BottomNavBar (Mobile Only) */}
              <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-xl bg-white dark:bg-slate-900 border-t border-outline-variant dark:border-slate-800 shadow-lg pb-safe transition-colors">
                <div className="flex justify-around items-center px-2 py-2">
                  
                  <button 
                    onClick={() => navigate('/')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 ${
                      activeTab === '/' 
                        ? 'text-[#006c49] dark:text-[#6ffbbe] bg-slate-50 dark:bg-slate-800' 
                        : 'text-on-surface-variant dark:text-slate-400'
                    }`}
                  >
                    <HomeIcon className="w-5 h-5" />
                    <span className="text-[11px] font-medium mt-1">Home</span>
                  </button>

                  <button 
                    onClick={() => navigate('/history')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 ${
                      activeTab === '/history' 
                        ? 'text-[#006c49] dark:text-[#6ffbbe] bg-slate-50 dark:bg-slate-800' 
                        : 'text-on-surface-variant dark:text-slate-400'
                    }`}
                  >
                    <CardIcon className="w-5 h-5" />
                    <span className="text-[11px] font-medium mt-1">Payments</span>
                  </button>

                  <button 
                    onClick={() => navigate('/insights')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 ${
                      activeTab === '/insights' 
                        ? 'text-[#006c49] dark:text-[#6ffbbe] bg-slate-50 dark:bg-slate-800' 
                        : 'text-on-surface-variant dark:text-slate-400'
                    }`}
                  >
                    <PieIcon className="w-5 h-5" />
                    <span className="text-[11px] font-medium mt-1">Insights</span>
                  </button>

                  <button 
                    onClick={() => navigate('/profile')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 ${
                      activeTab === '/profile' 
                        ? 'text-[#006c49] dark:text-[#6ffbbe] bg-slate-50 dark:bg-slate-800' 
                        : 'text-on-surface-variant dark:text-slate-400'
                    }`}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="text-[11px] font-medium mt-1">Profile</span>
                  </button>
                </div>
              </nav>

              {/* Edit Modal Overlay */}
              <EditModal 
                isOpen={isEditOpen} 
                transaction={selectedTx} 
                onClose={() => {
                  setIsEditOpen(false);
                  setSelectedTx(null);
                }} 
                onSave={handleEditSave} 
              />

              {/* Add Modal Overlay */}
              <AddModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSave={handleAddSave}
              />

              {/* Floating AI Chatbot Assistant */}
              <AIChatBubble />
            </div>
          )
        }
      >
        {/* Child paths rendered by the Layout Outlet */}
        <Route index element={<Home />} />
        <Route path="scan" element={<Scan />} />
        <Route path="insights" element={<Insights />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Redirect all unmatched routes back to dashboard root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
