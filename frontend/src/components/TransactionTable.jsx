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

export default function TransactionTable({ transactions, onEdit, onDelete }) {
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Bills':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Education':
        return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'Entertainment':
        return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Shopping':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  // Format currency helper
  const formatCurrency = (val) => {
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
    <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      
      {/* Table Header Filter controls */}
      <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAFBFC]">
        <div>
          <h3 className="font-title-lg text-[16px] font-bold text-primary">Transaction History</h3>
          <p className="text-[12px] text-on-surface-variant mt-0.5">Showing {filteredTransactions.length} of {transactions.length} items</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant/60" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 w-44 sm:w-56 transition-all"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-on-surface-variant" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pr-8 pl-3 py-1.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-medium text-primary cursor-pointer focus:outline-none focus:border-accent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-on-surface-variant/60" />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {filteredTransactions.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#FAFBFC] text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                <th className="p-4">Merchant / Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Payment Mode</th>
                <th className="p-4">Source</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-surface/50 group transition-colors">
                  {/* Merchant name & date */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FAFBFC] border border-outline-variant flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
                        {getCategoryIcon(tx.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-[14px] text-primary">{tx.merchantName}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category badge */}
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold border ${getCategoryBadgeStyle(tx.category)}`}>
                      {tx.category || 'Others'}
                    </span>
                  </td>

                  {/* Payment Mode */}
                  <td className="p-4">
                    <span className="text-[13px] font-medium text-primary flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-on-surface-variant/70" />
                      {tx.paymentMode}
                    </span>
                  </td>

                  {/* Source (AI vs Manual) */}
                  <td className="p-4">
                    {tx.isAIGenerated ? (
                      <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-violet-100">
                        <Sparkles className="w-3 h-3" />
                        AI Scan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-slate-100">
                        Manual
                      </span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="p-4 text-right">
                    <span className="font-bold text-[14px] text-primary">
                      -{formatCurrency(tx.amount)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => onEdit(tx)}
                        title="Edit Transaction"
                        className="p-1.5 hover:bg-[#F1F5F9] rounded-lg text-on-surface-variant hover:text-primary transition-colors"
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
                        className="p-1.5 hover:bg-error-container rounded-lg text-on-surface-variant hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-on-surface-variant text-[14px]">
            No transactions found matching the filters.
          </div>
        )}
      </div>
    </div>
  );
}
