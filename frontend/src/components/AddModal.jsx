import React, { useState, useEffect } from 'react';
import { X, Check, PlusCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function AddModal({ isOpen, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Others');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reset fields to default when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setMerchantName('');
      // Set to local today's date formatted as YYYY-MM-DD
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
      setCategory('Others');
      setPaymentMode('UPI');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!merchantName.trim()) {
      setError('Please enter a merchant or receiver name.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const transactionData = {
      amount: Number(amount),
      merchantName: merchantName.trim(),
      category,
      paymentMode,
      date: new Date(date).toISOString(),
    };

    try {
      const newTx = await apiService.createTransaction(transactionData);
      onSave(newTx);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-[16px] w-full max-w-[480px] shadow-2xl overflow-hidden border border-outline-variant dark:border-slate-800 transition-colors">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-[#E2E8F0] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-accent" />
            <h3 className="font-title-lg text-[18px] font-bold text-primary dark:text-white">Add Transaction</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 rounded-full text-on-surface-variant dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-error-container border border-red-200 text-error text-[13px] rounded-lg">
              {error}
            </div>
          )}

          {/* Merchant Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">Merchant / Receiver</label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g. Zomato, Starbucks, landlord"
              className="px-3 py-2.5 bg-surface dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-[10px] text-[14px] text-primary dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="px-3 py-2.5 bg-surface dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-[10px] text-[14px] text-primary dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2.5 bg-surface dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-[10px] text-[14px] text-primary dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>

          {/* Category & Payment Mode Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2.5 bg-surface dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-[10px] text-[14px] text-primary dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              >
                <option value="Food">Food</option>
                <option value="Bills">Bills</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="px-3 py-2.5 bg-surface dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-[10px] text-[14px] text-primary dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 rounded-[10px] text-[14px] font-semibold text-on-surface-variant dark:text-slate-300 hover:bg-surface dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-accent hover:bg-[#059669] text-white rounded-[10px] text-[14px] font-semibold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.2)] disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <span>Adding...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Add Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
