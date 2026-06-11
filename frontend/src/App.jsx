import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Scan as ScanIcon, 
  PieChart as PieIcon, 
  History as HistoryIcon, 
  Moon, 
  Sun, 
  Bell
} from 'lucide-react';
import EditModal from './components/EditModal';
import AddModal from './components/AddModal';
import AuthPage from './components/AuthPage';
import { apiService } from './services/apiService';

// Lazy load the pages for code-splitting
const Home = lazy(() => import('./pages/Home'));
const Scan = lazy(() => import('./pages/Scan'));
const Insights = lazy(() => import('./pages/Insights'));
const History = lazy(() => import('./pages/History'));

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

  // Add manual transaction handler
  const handleAddSave = (newTx) => {
    setTransactions(prev => [newTx, ...prev]);
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

  const budgetLimit = 40000;
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
                  <div className="flex items-center gap-3">
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
                    <button className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors relative active:scale-95">
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-white"></span>
                    </button>

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
                        budgetLimit, 
                        formatCurrency, 
                        handleScanSuccess, 
                        setIsAddOpen, 
                        handleEditOpen, 
                        handleDeleteTransaction 
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
                    onClick={() => navigate('/scan')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 ${
                      activeTab === '/scan' 
                        ? 'text-[#006c49] dark:text-[#6ffbbe] bg-slate-50 dark:bg-slate-800' 
                        : 'text-on-surface-variant dark:text-slate-400'
                    }`}
                  >
                    <ScanIcon className="w-5 h-5" />
                    <span className="text-[11px] font-medium mt-1">Scan</span>
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
                    onClick={() => navigate('/history')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 ${
                      activeTab === '/history' 
                        ? 'text-[#006c49] dark:text-[#6ffbbe] bg-slate-50 dark:bg-slate-800' 
                        : 'text-on-surface-variant dark:text-slate-400'
                    }`}
                  >
                    <HistoryIcon className="w-5 h-5" />
                    <span className="text-[11px] font-medium mt-1">History</span>
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
            </div>
          )
        }
      >
        {/* Child paths rendered by the Layout Outlet */}
        <Route index element={<Home />} />
        <Route path="scan" element={<Scan />} />
        <Route path="insights" element={<Insights />} />
        <Route path="history" element={<History />} />
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
