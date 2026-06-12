import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import TransactionTable from '../components/TransactionTable';
import { apiService } from '../services/apiService';

export default function History() {
  const { transactions, handleEditOpen, handleDeleteTransaction, setIsAddOpen } = useOutletContext();

  const handleExport = async () => {
    try {
      const blob = await apiService.exportTransactions();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paytracker_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to export transactions.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[26px] md:text-[32px] font-bold text-primary dark:text-white">Transactions</h2>
          <p className="text-[14px] text-on-surface-variant dark:text-slate-400 mt-1">
            Review, search, and manually update your entries.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-[10px] text-[14px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 duration-150 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-accent hover:bg-[#059669] text-white rounded-[10px] text-[14px] font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-95 duration-150 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      <TransactionTable
        transactions={transactions}
        onEdit={handleEditOpen}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}
