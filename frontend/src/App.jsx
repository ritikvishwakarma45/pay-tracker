import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  Scan as ScanIcon, 
  PieChart as PieIcon, 
  History as HistoryIcon, 
  Moon, 
  Sun, 
  Sparkles,
  HelpCircle,
  Bell,
  ArrowRight,
  TrendingDown,
  Wallet,
  Plus
} from 'lucide-react';
import UploadZone from './components/UploadZone';
import DashboardStats from './components/DashboardStats';
import AnalyticsCharts from './components/AnalyticsCharts';
import TransactionTable from './components/TransactionTable';
import EditModal from './components/EditModal';
import AddModal from './components/AddModal';
import { API_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Edit modal state
  const [selectedTx, setSelectedTx] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Add modal state
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add manual transaction handler
  const handleAddSave = (newTx) => {
    setTransactions(prev => [newTx, ...prev]);
    setActiveTab('history');
  };

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/transactions`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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
    // Add to list and switch to History to inspect
    setTransactions(prev => [newTx, ...prev]);
    setTimeout(() => {
      setActiveTab('history');
    }, 1500);
  };

  // Delete transaction handler
  const handleDeleteTransaction = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTransactions(prev => prev.filter(t => t._id !== id));
      } else {
        alert('Failed to delete transaction.');
      }
    } catch (err) {
      console.error(err);
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

  // Stats calculation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
  const currentMonthSpent = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const budgetLimit = 40000;
  const remainingBudget = Math.max(0, budgetLimit - currentMonthSpent);
  const spentPct = Math.min(100, Math.round((currentMonthSpent / budgetLimit) * 100));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
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
              onClick={() => setActiveTab('home')}
              className={`font-semibold text-[14px] transition-colors flex items-center gap-1.5 ${
                activeTab === 'home' 
                  ? 'text-[#006c49] dark:text-[#6ffbbe]' 
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => setActiveTab('scan')}
              className={`font-semibold text-[14px] transition-colors flex items-center gap-1.5 ${
                activeTab === 'scan' 
                  ? 'text-[#006c49] dark:text-[#6ffbbe]' 
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white'
              }`}
            >
              <ScanIcon className="w-4 h-4" />
              <span>Scan</span>
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={`font-semibold text-[14px] transition-colors flex items-center gap-1.5 ${
                activeTab === 'insights' 
                  ? 'text-[#006c49] dark:text-[#6ffbbe]' 
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white'
              }`}
            >
              <PieIcon className="w-4 h-4" />
              <span>Insights</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`font-semibold text-[14px] transition-colors flex items-center gap-1.5 ${
                activeTab === 'history' 
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
          <div className="space-y-8 animate-fadeIn">
            
            {/* 1. HOME TAB */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                <div>
                  <p className="text-[14px] text-on-surface-variant dark:text-slate-400">Good Morning, Alex</p>
                  <h2 className="text-[26px] md:text-[32px] font-bold text-primary dark:text-white mt-0.5">Overview</h2>
                </div>

                {/* Dashboard Stats row */}
                <DashboardStats transactions={transactions} budgetLimit={budgetLimit} />

                {/* Bento layout (Recent Activity summary & Quick Scan Card) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Home Quick scan CTA card */}
                  <div className="lg:col-span-4 bg-primary text-white rounded-xl p-6 border border-slate-800 flex flex-col justify-between min-h-[200px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl -mr-6 -mt-6"></div>
                    <div>
                      <h4 className="font-bold text-[18px] flex items-center gap-1.5">
                        AI Receipt Scanner
                        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                      </h4>
                      <p className="text-[13px] text-gray-400 mt-2 leading-relaxed">
                        Instantly extract amount, vendor, date, and category from your payment screenshots.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('scan')}
                      className="mt-6 w-full py-2.5 bg-accent hover:bg-[#059669] text-white rounded-[10px] text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.3)] active:scale-95 duration-150 transition-colors"
                    >
                      <span>Scan New Receipt</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Recent activities preview (Top 3) */}
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-outline-variant dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="p-5 flex justify-between items-center border-b border-[#E2E8F0] dark:border-slate-800">
                      <h3 className="font-title-lg text-[16px] font-bold text-primary dark:text-white">Recent Activity</h3>
                      <button 
                        onClick={() => setActiveTab('history')}
                        className="text-[12px] font-semibold text-[#006c49] dark:text-[#6ffbbe] hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                      {transactions.slice(0, 3).map((tx) => (
                        <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-outline-variant dark:border-slate-700 flex items-center justify-center text-on-surface-variant">
                              <span className="material-symbols-outlined text-[20px]">
                                {tx.category === 'Food' ? 'local_cafe' :
                                 tx.category === 'Bills' ? 'receipt' :
                                 tx.category === 'Education' ? 'school' :
                                 tx.category === 'Entertainment' ? 'movie' :
                                 tx.category === 'Shopping' ? 'shopping_bag' : 'help_outline'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-[14px] text-primary dark:text-white">{tx.merchantName}</p>
                              <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
                                {tx.category} • {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-[14px] text-primary dark:text-white">-{formatCurrency(tx.amount)}</span>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <div className="p-8 text-center text-on-surface-variant dark:text-slate-400 text-[14px]">
                          No recent transactions.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SCAN TAB */}
            {activeTab === 'scan' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[26px] md:text-[32px] font-bold text-primary dark:text-white">Receipt Scanner</h2>
                  <p className="text-[14px] text-on-surface-variant dark:text-slate-400 mt-1">Upload files to extract transaction details automatically.</p>
                </div>
                <div className="max-w-2xl mx-auto py-8 space-y-6">
                  <UploadZone onScanSuccess={handleScanSuccess} />
                  <div className="text-center">
                    <span className="text-[13px] text-on-surface-variant dark:text-slate-400">Don't have a receipt? </span>
                    <button
                      onClick={() => setIsAddOpen(true)}
                      className="text-[13px] font-bold text-[#006c49] dark:text-[#6ffbbe] hover:underline"
                    >
                      Enter details manually
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. INSIGHTS TAB */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[26px] md:text-[32px] font-bold text-primary dark:text-white">Analytics & Insights</h2>
                  <p className="text-[14px] text-on-surface-variant dark:text-slate-400 mt-1">Inspect categories and trends over time.</p>
                </div>
                <AnalyticsCharts transactions={transactions} />
              </div>
            )}

            {/* 4. HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[26px] md:text-[32px] font-bold text-primary dark:text-white">Transactions</h2>
                    <p className="text-[14px] text-on-surface-variant dark:text-slate-400 mt-1">Review, search, and manually update your entries.</p>
                  </div>
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="self-start sm:self-center px-4 py-2.5 bg-accent hover:bg-[#059669] text-white rounded-[10px] text-[14px] font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-95 duration-150 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Transaction</span>
                  </button>
                </div>
                <TransactionTable 
                  transactions={transactions} 
                  onEdit={handleEditOpen} 
                  onDelete={handleDeleteTransaction} 
                />
              </div>
            )}

          </div>
        )}
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-xl bg-white dark:bg-slate-900 border-t border-outline-variant dark:border-slate-800 shadow-lg pb-safe transition-colors">
        <div className="flex justify-around items-center px-2 py-2">
          
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 ${
              activeTab === 'home' 
                ? 'text-[#006c49] dark:text-[#6ffbbe] bg-slate-50 dark:bg-slate-800' 
                : 'text-on-surface-variant dark:text-slate-400'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 ${
              activeTab === 'scan' 
                ? 'text-[#006c49] dark:text-[#6ffbbe] bg-slate-50 dark:bg-slate-800' 
                : 'text-on-surface-variant dark:text-slate-400'
            }`}
          >
            <ScanIcon className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1">Scan</span>
          </button>

          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 ${
              activeTab === 'insights' 
                ? 'text-[#006c49] dark:text-[#6ffbbe] bg-slate-50 dark:bg-slate-800' 
                : 'text-on-surface-variant dark:text-slate-400'
            }`}
          >
            <PieIcon className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1">Insights</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 ${
              activeTab === 'history' 
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
  );
}
