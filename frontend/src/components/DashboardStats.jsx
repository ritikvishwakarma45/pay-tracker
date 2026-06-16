import React from 'react';
import { DollarSign, Wallet, TrendingDown, ArrowDownRight, IndianRupee } from 'lucide-react';

export default function DashboardStats({ transactions, budgetLimit = 40000, categoryBudgets = {} }) {
  // Filter transactions for current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const totalSpentThisMonth = currentMonthTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = Math.max(0, budgetLimit - totalSpentThisMonth);
  const spentPercentage = Math.min(100, Math.round((totalSpentThisMonth / budgetLimit) * 100));

  const averageTransaction = currentMonthTransactions.length > 0 
    ? Math.round(totalSpentThisMonth / currentMonthTransactions.length) 
    : 0;

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const budgetsObj = categoryBudgets instanceof Map 
    ? Object.fromEntries(categoryBudgets) 
    : categoryBudgets || {};

  const activeCategoryBudgets = Object.entries(budgetsObj)
    .map(([cat, limit]) => ({ category: cat, limit: Number(limit) }))
    .filter(b => b.limit > 0);

  const catSpent = currentMonthTransactions.reduce((acc, curr) => {
    const cat = curr.category || 'Others';
    acc[cat] = (acc[cat] || 0) + curr.amount;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Total Spent Card (Span 6) */}
      <div className="md:col-span-6 bg-surface rounded-[12px] p-6 border border-outline-variant flex flex-col justify-between min-h-[180px] relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D1FAE5]/30 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="z-10">
          <p className="font-title-lg text-[15px] font-semibold text-on-surface-variant flex items-center gap-1.5">
            Spent Current Month
            <TrendingDown className="w-4 h-4 text-accent" />
          </p>
          <p className="font-display-lg text-[36px] font-bold text-primary mt-2 tracking-tight">
            {formatCurrency(totalSpentThisMonth)}
          </p>
        </div>

        <div className="z-10 flex items-center justify-between mt-6">
          <div className="bg-[#D1FAE5] px-3 py-1 rounded-full flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-accent" />
            <span className="font-label-md text-[12px] text-accent font-bold">12% vs last month</span>
          </div>
        </div>
      </div>

      {/* Budget Remaining Card (Span 3) */}
      <div className="md:col-span-3 bg-white rounded-[12px] p-6 border border-outline-variant flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow">
        <div>
          <div className="flex justify-between items-center">
            <p className="font-title-lg text-[15px] font-semibold text-on-surface-variant">Budget Remaining</p>
            <Wallet className="w-5 h-5 text-on-surface-variant/70" />
          </div>
          <p className="font-headline-md text-[24px] font-bold text-primary mt-2">
            {formatCurrency(remainingBudget)}
          </p>
        </div>

        <div className="mt-4">
          <div className="flex justify-between font-label-md text-[12px] text-on-surface-variant mb-1.5">
            <span>Spent: {spentPercentage}%</span>
            <span>Total: {formatCurrency(budgetLimit)}</span>
          </div>
          <div className="w-full bg-[#e2e8f8] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${spentPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Average Transaction Card (Span 3) */}
      <div className="md:col-span-3 bg-white rounded-[12px] p-6 border border-outline-variant flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow">
        <div>
          <div className="flex justify-between items-center">
            <p className="font-title-lg text-[15px] font-semibold text-on-surface-variant">Average Transaction</p>
            <IndianRupee className="w-4 h-4 text-on-surface-variant/70" />
          </div>
          <p className="font-headline-md text-[24px] font-bold text-primary mt-2">
            {formatCurrency(averageTransaction)}
          </p>
        </div>

        <div className="mt-4">
          <p className="text-[12px] text-on-surface-variant">
            Based on {currentMonthTransactions.length} transaction{currentMonthTransactions.length !== 1 ? 's' : ''} this month.
          </p>
        </div>
      </div>

      {/* Category Budgets Row (Span 12) */}
      {activeCategoryBudgets.length > 0 && (
        <div className="col-span-12 bg-white dark:bg-slate-900 rounded-[12px] p-6 border border-outline-variant dark:border-slate-800 transition-colors">
          <h4 className="font-bold text-[16px] text-primary dark:text-white mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-accent">view_cozy</span>
            Category Budgets
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activeCategoryBudgets.map(({ category, limit }) => {
              const spent = catSpent[category] || 0;
              const pct = Math.min(100, Math.round((spent / limit) * 100));
              const isWarning = pct >= 80 && pct < 100;
              const isDanger = pct >= 100;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="font-bold text-primary dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-500">
                        {category === 'Food' ? 'local_cafe' :
                         category === 'Bills' ? 'receipt' :
                         category === 'Education' ? 'school' :
                         category === 'Entertainment' ? 'movie' :
                         category === 'Shopping' ? 'shopping_bag' : 'help_outline'}
                      </span>
                      {category}
                    </span>
                    <span className="text-on-surface-variant dark:text-slate-400 font-medium">
                      {formatCurrency(spent)} / <span className="font-bold">{formatCurrency(limit)}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isDanger ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                        isWarning ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                        'bg-accent'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className={`${
                      isDanger ? 'text-red-500' :
                      isWarning ? 'text-amber-500' :
                      'text-[#006c49] dark:text-[#6ffbbe]'
                    }`}>
                      {pct}% Spent
                    </span>
                    {isDanger ? (
                      <span className="text-red-500 flex items-center gap-0.5">⚠️ Limit Breached</span>
                    ) : isWarning ? (
                      <span className="text-amber-500 flex items-center gap-0.5">🔔 Near Limit</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">₹{(limit - spent) > 0 ? (limit - spent).toLocaleString('en-IN') : 0} Left</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
