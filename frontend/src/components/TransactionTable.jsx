import React, { useState } from 'react';
import {
  Coffee,
  Receipt,
  GraduationCap,
  Film,
  ShoppingBag,
  HelpCircle,
  Edit2,
  Trash2,
  Sparkles,
  CreditCard,
  Filter,
  Search,
  ChevronDown
} from 'lucide-react';

export default function TransactionTable({ transactions, onEdit, onDelete, formatCurrency: propFormatCurrency }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Category Icon Mapper
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food':
        return <Coffee className="w-5 h-5 text-emerald-600" />;
      case 'Bills':
        return <Receipt className="w-5 h-5 text-indigo-600" />;
      case 'Education':
        return <GraduationCap className="w-5 h-5 text-violet-600" />;
      case 'Entertainment':
        return <Film className="w-5 h-5 text-cyan-600" />;
      case 'Shopping':
        return <ShoppingBag className="w-5 h-5 text-amber-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  // Category Colors
  const getCategoryBadgeStyle = (category) => {
    switch (category) {
      case 'Food':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/55';
      case 'Bills':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/55';
      case 'Education':
        return 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/55';
      case 'Entertainment':
        return 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/55';
      case 'Shopping':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/55';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-800';
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  // Format currency helper (local fallback if parent context not provided)
  const formatCurrency = (val) => {
    if (propFormatCurrency) return propFormatCurrency(val);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filtering transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.amount.toString().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Food', 'Bills', 'Education', 'Entertainment', 'Shopping', 'Others'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-outline-variant dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Table Header Filter controls */}
      <div className="p-4 border-b border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAFBFC] dark:bg-slate-900/60">
        <div>
          <h3 className="font-title-lg text-[16px] font-bold text-primary dark:text-white">Transaction History</h3>
          <p className="text-[12px] text-on-surface-variant dark:text-slate-400 mt-0.5">Showing {filteredTransactions.length} of {transactions.length} items</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant/60 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-[8px] text-[13px] text-primary dark:text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 w-44 sm:w-56 transition-all"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-on-surface-variant dark:text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pr-8 pl-3 py-1.5 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-[8px] text-[13px] font-medium text-primary dark:text-white cursor-pointer focus:outline-none focus:border-accent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-on-surface-variant/60 dark:text-slate-400" />
          </div>
        </div>
      </div>

      {/* Table Content styled as an Item List */}
      <div className="w-full">
        {filteredTransactions.length > 0 ? (
          <div className="flex flex-col">
            {/* Header row (hidden on mobile, grid on desktop) */}
            <div className="hidden md:grid grid-cols-12 items-center border-b border-[#E2E8F0] dark:border-slate-800 bg-[#FAFBFC] dark:bg-slate-900/40 text-on-surface-variant dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider px-6 py-3">
              <div className="col-span-4">Merchant / Date</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Payment Mode</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            {/* List items */}
            <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
              {filteredTransactions.map((tx) => (
                <div key={tx._id} className="hover:bg-[#FAFBFC] dark:hover:bg-slate-800/10 transition-colors">
                  {/* Desktop Grid Layout */}
                  <div className="hidden md:grid grid-cols-12 items-center px-6 py-4">
                    {/* Merchant & Date */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FAFBFC] dark:bg-slate-800 border border-outline-variant dark:border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                        {getCategoryIcon(tx.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-[14px] text-primary dark:text-white">{tx.merchantName}</p>
                        <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-0.5">{formatDate(tx.date)}</p>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="col-span-2">
                      <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold border ${getCategoryBadgeStyle(tx.category)}`}>
                        {tx.category || 'Others'}
                      </span>
                    </div>

                    {/* Payment Mode */}
                    <div className="col-span-2">
                      <span className="text-[13px] font-medium text-primary dark:text-white flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-on-surface-variant/70 dark:text-slate-400" />
                        {tx.paymentMode}
                      </span>
                    </div>

                    {/* Source */}
                    <div className="col-span-2">
                      {tx.isAIGenerated ? (
                        <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-violet-100 dark:border-violet-900/50">
                          <Sparkles className="w-3 h-3" />
                          AI Scan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800">
                          Manual
                        </span>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="col-span-1 text-right">
                      <span className="font-bold text-[14px] text-primary dark:text-white">
                        -{formatCurrency(tx.amount)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(tx)}
                        title="Edit Transaction"
                        className="p-1.5 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 rounded-lg text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete this transaction from ${tx.merchantName}?`)) {
                            onDelete(tx._id);
                          }
                        }}
                        title="Delete Transaction"
                        className="p-1.5 hover:bg-error-container dark:hover:bg-red-950/30 rounded-lg text-on-surface-variant dark:text-slate-400 hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Stacked Card Layout */}
                  <div className="md:hidden flex flex-col gap-3 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FAFBFC] dark:bg-slate-800 border border-outline-variant dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                          {getCategoryIcon(tx.category)}
                        </div>
                        <div>
                          <p className="font-semibold text-[14px] text-primary dark:text-white">{tx.merchantName}</p>
                          <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-0.5">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[14px] text-primary dark:text-white">-{formatCurrency(tx.amount)}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-2">
                          <button
                            onClick={() => onEdit(tx)}
                            title="Edit Transaction"
                            className="p-1 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 rounded-md text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete this transaction from ${tx.merchantName}?`)) {
                                onDelete(tx._id);
                              }
                            }}
                            title="Delete Transaction"
                            className="p-1 hover:bg-error-container dark:hover:bg-red-950/30 rounded-md text-on-surface-variant dark:text-slate-400 hover:text-error transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Badges Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryBadgeStyle(tx.category)}`}>
                        {tx.category || 'Others'}
                      </span>
                      
                      <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        <CreditCard className="w-3 h-3 text-on-surface-variant/70 dark:text-slate-400" />
                        {tx.paymentMode}
                      </span>

                      {tx.isAIGenerated ? (
                        <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-violet-100 dark:border-violet-900/50">
                          <Sparkles className="w-3 h-3" />
                          AI Scan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800">
                          Manual
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-on-surface-variant dark:text-slate-400 text-[14px]">
            No transactions found matching the filters.
          </div>
        )}
      </div>
    </div>
  );
}
