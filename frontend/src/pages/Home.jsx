import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import DashboardStats from '../components/DashboardStats';

export default function Home() {
  const { transactions, user, budgetLimit, categoryBudgets, formatCurrency, handleScanSuccess } = useOutletContext();
  const navigate = useNavigate();

  const timeGreet = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[14px] text-on-surface-variant dark:text-slate-400">{timeGreet()}, {user?.name || 'User'}</p>
        <h2 className="text-[26px] md:text-[32px] font-bold text-primary dark:text-white mt-0.5">Overview</h2>
      </div>

      {/* Dashboard Stats row */}
      <DashboardStats transactions={transactions} budgetLimit={budgetLimit} categoryBudgets={categoryBudgets} />

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
            onClick={() => navigate('/scan')}
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
              onClick={() => navigate('/history')}
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
  );
}
