import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TransactionList } from '../transactions/TransactionList';
import { TransactionModal } from '../transactions/TransactionModal';

interface TransactionsViewProps {
  onOpenAddTransaction: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenAddTransaction }) => {
  return (
    <div className="space-y-4">
      {/* Header action bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Ledger & Transaction History</h2>
          <p className="text-xs text-slate-400">Search, filter, edit, and export your personal transactions</p>
        </div>

        <button
          type="button"
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Main List */}
      <TransactionList />
    </div>
  );
};
