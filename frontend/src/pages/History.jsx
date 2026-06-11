import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import TransactionTable from '../components/TransactionTable';

export default function History() {
  const { transactions, handleEditOpen, handleDeleteTransaction, setIsAddOpen } = useOutletContext();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[26px] md:text-[32px] font-bold text-primary dark:text-white">Transactions</h2>
          <p className="text-[14px] text-on-surface-variant dark:text-slate-400 mt-1">
            Review, search, and manually update your entries.
          </p>
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
  );
}
