import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

export default function Report() {
  const { transactions, user, budgetLimit, formatCurrency, categoryBudgets = {} } = useOutletContext();
  const navigate = useNavigate();

  const now = new Date();
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Filter current month transactions
  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const totalSpent = monthlyTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = Math.max(0, budgetLimit - totalSpent);
  const spentPct = Math.round((totalSpent / budgetLimit) * 100);

  // Group by categories
  const catSpent = monthlyTransactions.reduce((acc, curr) => {
    const cat = curr.category || 'Others';
    acc[cat] = (acc[cat] || 0) + curr.amount;
    return acc;
  }, {});

  const allCategories = ['Food', 'Bills', 'Education', 'Entertainment', 'Shopping', 'Others'];

  // AI-powered financial wellness recommendations (templated dynamically based on category expenditures)
  const getAIRecommendations = () => {
    const recommendations = [];
    const highestCategory = Object.entries(catSpent).sort((a, b) => b[1] - a[1])[0];

    if (spentPct >= 100) {
      recommendations.push({
        title: 'Critical Budget Alert',
        desc: `You have exceeded your total limit by ${spentPct - 100}%. Pause all non-essential shopping immediately.`,
        type: 'danger'
      });
    } else if (spentPct >= 80) {
      recommendations.push({
        title: 'Budget warning',
        desc: 'You are approaching your total limit. We recommend cooking at home and deferring large purchases.',
        type: 'warning'
      });
    }

    if (highestCategory) {
      const [cat, spent] = highestCategory;
      if (cat === 'Food' && spent > budgetLimit * 0.2) {
        recommendations.push({
          title: 'Dining Optimization',
          desc: 'Your largest expense is Food. Preparing meals at home or meal-prepping on weekends can save up to ₹3,500/month.',
          type: 'tip'
        });
      } else if (cat === 'Shopping' && spent > budgetLimit * 0.15) {
        recommendations.push({
          title: 'Shopping Restraint',
          desc: 'Shopping spend is high. Try implementing the "30-day waiting rule" before buying non-essential items.',
          type: 'tip'
        });
      } else if (cat === 'Entertainment') {
        recommendations.push({
          title: 'Subscription Audit',
          desc: 'Audit your entertainment subscriptions. Canceling unused streaming services is an easy win for your savings.',
          type: 'tip'
        });
      }
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Excellent Control',
        desc: 'Your spending is well within limits. Consider auto-investing the surplus into mutual funds or index funds.',
        type: 'success'
      });
    }

    return recommendations;
  };

  const aiTips = getAIRecommendations();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-2 px-4 sm:px-0 pb-12">
      {/* Stylesheet injector for print media to hide navbar/sidebar & adjust layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          header, nav, footer, .no-print, aside, button {
            display: none !important;
          }
          .print-border-less {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-card-bg {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      {/* Action Top bar - Hidden when printing */}
      <div className="no-print flex justify-between items-center bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-4 transition-colors">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-bold text-[13px] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-400 font-semibold hidden md:inline">Ready to print or save as PDF</span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-[#059669] text-white rounded-lg font-bold text-[13px] shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Statement
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div className="print-border-less bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-2xl shadow-xl p-4 sm:p-8 space-y-8 transition-colors">
        {/* Statement Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#006c49] flex items-center justify-center text-white font-black text-lg shadow-sm">P</span>
              <span className="font-bold text-xl text-primary dark:text-white">PayTracker <span className="text-accent">AI</span></span>
            </div>
            <p className="text-[12px] text-slate-400 font-medium">Automated Personal Financial Statement</p>
          </div>
          <div className="text-right space-y-1">
            <span className="inline-block px-2.5 py-1 rounded bg-[#E8F5E9] dark:bg-emerald-950/20 text-[#006c49] dark:text-emerald-400 font-bold text-[11px] tracking-wide uppercase">
              {currentMonthName}
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Generated: {now.toLocaleDateString('en-IN')}</p>
          </div>
        </div>        {/* User Account Info */}
        <div className="flex justify-between items-start gap-4 text-[13px] bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl print-card-bg">
          <div>
            <p className="text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider text-[10px]">Prepared For</p>
            <p className="font-bold text-primary dark:text-white mt-0.5">{user?.name || 'Authorized Member'}</p>
            <p className="text-slate-500 dark:text-slate-450 text-[11px] mt-0.5">{user?.email || 'member@paytracker.io'}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider text-[10px]">Statement Period</p>
            <p className="font-bold text-primary dark:text-white mt-0.5">{currentMonthName}</p>
            <p className="text-slate-500 dark:text-slate-450 text-[11px] mt-0.5">Account Statement</p>
          </div>
        </div>

        {/* Statement Summary Card */}
        <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 space-y-4 print-card-bg">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Budget Health</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
              spentPct >= 100 ? 'bg-red-50 dark:bg-red-950/20 text-red-500' : 
              spentPct >= 80 ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' : 
              'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
            }`}>
              {spentPct >= 100 ? `Overlimit (${spentPct}%)` : spentPct >= 80 ? `Warning (${spentPct}%)` : `Healthy (${spentPct}%)`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                spentPct >= 100 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 
                spentPct >= 80 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 
                'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              }`}
              style={{ width: `${Math.min(100, spentPct)}%` }}
            ></div>
          </div>

          {/* 3-Column stats grid */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-center">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</p>
              <p className="font-bold text-[16px] text-primary dark:text-white mt-0.5">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Budget Limit</p>
              <p className="font-bold text-[16px] text-slate-500 dark:text-slate-400 mt-0.5">{formatCurrency(budgetLimit)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Remaining</p>
              <p className={`font-bold text-[16px] mt-0.5 ${
                totalSpent > budgetLimit ? 'text-red-500' : 'text-[#006c49] dark:text-emerald-400'
              }`}>
                {totalSpent > budgetLimit ? `-${formatCurrency(totalSpent - budgetLimit)}` : formatCurrency(remainingBudget)}
              </p>
            </div>
          </div>
        </div>

        {/* Category breakdown list */}
        <div className="space-y-4">
          <h3 className="font-bold text-[14px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-accent" />
            Category-wise Breakdown
          </h3>
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900/35 space-y-3">
            {allCategories.map(cat => {
              const spent = catSpent[cat] || 0;
              const limit = Number(categoryBudgets[cat]) || 0;
              const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
              const isDanger = limit > 0 && pct >= 100;
              const isWarning = limit > 0 && pct >= 80 && pct < 100;

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[12.5px]">
                    <span className="font-bold text-primary dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">
                        {cat === 'Food' ? 'local_cafe' :
                         cat === 'Bills' ? 'receipt' :
                         cat === 'Education' ? 'school' :
                         cat === 'Entertainment' ? 'movie' :
                         cat === 'Shopping' ? 'shopping_bag' : 'help_outline'}
                      </span>
                      {cat}
                    </span>
                    <span className="text-slate-650 dark:text-slate-350 font-medium text-[12px]">
                      {formatCurrency(spent)} <span className="text-slate-300 dark:text-slate-700">/</span> <span className="font-bold text-slate-500">{limit > 0 ? formatCurrency(limit) : 'No Limit'}</span>
                    </span>
                  </div>
                  
                  {limit > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-accent'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                      <span className={`text-[10px] font-bold shrink-0 ${
                        isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {pct}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Financial Recommendations */}
        <div className="space-y-3">
          <h3 className="font-bold text-[14px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent" />
            AI Savings & Wellness Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiTips.map((tip, idx) => (
              <div key={idx} className="p-4 border border-outline-variant dark:border-slate-800 rounded-xl space-y-2 flex gap-3 items-start print-card-bg">
                {tip.type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                {tip.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                {tip.type === 'tip' && <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />}
                {tip.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
                <div className="space-y-0.5">
                  <p className="font-bold text-[13px] text-primary dark:text-white leading-none">{tip.title}</p>
                  <p className="text-[12px] text-on-surface-variant dark:text-slate-400 leading-normal">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="space-y-4">
          <h3 className="font-bold text-[14px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-accent" />
            Recent Activity
          </h3>
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900/35 divide-y divide-slate-100 dark:divide-slate-800">
            {monthlyTransactions.slice(0, 5).map(tx => (
              <div key={tx._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      {tx.category === 'Food' ? 'local_cafe' :
                       tx.category === 'Bills' ? 'receipt' :
                       tx.category === 'Education' ? 'school' :
                       tx.category === 'Entertainment' ? 'movie' :
                       tx.category === 'Shopping' ? 'shopping_bag' : 'help_outline'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[13px] text-primary dark:text-white truncate">{tx.merchantName}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {tx.category} • {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-[13px] text-primary dark:text-white">-{formatCurrency(tx.amount)}</p>
                  <p className="text-[10px] text-slate-400">{tx.paymentMode || 'UPI'}</p>
                </div>
              </div>
            ))}
            {monthlyTransactions.length === 0 && (
              <div className="p-6 text-center text-slate-400 font-medium">
                No activity recorded for this period.
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center space-y-1">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">This is an automated ledger generated by PayTracker AI.</p>
          <p className="text-[10px] text-slate-300 dark:text-slate-600">All data represents local aggregates parsed securely via Groq Cloud APIs.</p>
        </div>
      </div>
    </div>
  );
}
