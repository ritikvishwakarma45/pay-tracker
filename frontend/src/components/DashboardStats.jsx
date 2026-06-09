import React from 'react';
import { DollarSign, Wallet, TrendingDown, ArrowDownRight, IndianRupee } from 'lucide-react';

export default function DashboardStats({ transactions, budgetLimit = 40000 }) {
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
    </div>
  );
}
