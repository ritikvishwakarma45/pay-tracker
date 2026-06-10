import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Trash2 } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function EditModal({ transaction, isOpen, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Others');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount || '');
      setMerchantName(transaction.merchantName || '');
      setCategory(transaction.category || 'Others');
      setPaymentMode(transaction.paymentMode || 'UPI');
      setIsAIGenerated(transaction.isAIGenerated || false);
      
      // Format date YYYY-MM-DD
      if (transaction.date) {
        const d = new Date(transaction.date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setDate('');
      }
      setError(null);
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!merchantName.trim()) {
      setError('Please enter a merchant name.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedData = {
        amount: Number(amount),
        merchantName: merchantName.trim(),
        category,
        paymentMode,
        date: new Date(date).toISOString(),
        // Clear isAIGenerated flag since user made manual edits
        isAIGenerated: false, 
      };

      const updated = await apiService.updateTransaction(transaction._id, updatedData);
      onSave(updated);
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
      <div className="bg-white rounded-[16px] w-full max-w-[480px] shadow-2xl overflow-hidden border border-outline-variant">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <h3 className="font-title-lg text-[18px] font-bold text-primary">Edit Transaction</h3>
            {isAIGenerated && (
              <span className="flex items-center gap-0.5 bg-violet-100 text-violet-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#F1F5F9] rounded-full text-on-surface-variant transition-colors"
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
            <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Merchant / Receiver</label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g. Blue Bottle Coffee"
              className="px-3 py-2.5 bg-surface border border-[#E2E8F0] rounded-[10px] text-[14px] text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="px-3 py-2.5 bg-surface border border-[#E2E8F0] rounded-[10px] text-[14px] text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2.5 bg-surface border border-[#E2E8F0] rounded-[10px] text-[14px] text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>

          {/* Category & Payment Mode Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2.5 bg-surface border border-[#E2E8F0] rounded-[10px] text-[14px] text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
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
              <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="px-3 py-2.5 bg-surface border border-[#E2E8F0] rounded-[10px] text-[14px] text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-[#E2E8F0] rounded-[10px] text-[14px] font-semibold text-on-surface-variant hover:bg-surface disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-accent hover:bg-[#059669] text-white rounded-[10px] text-[14px] font-semibold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.2)] disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
