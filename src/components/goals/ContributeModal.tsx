import React, { useState } from 'react';
import { X, Check, ArrowDownLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/finance';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { contributeToGoal, preferences } = useFinance();

  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);

    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid positive contribution amount.');
      return;
    }

    if (type === 'withdrawal' && parsed > goal.currentAmount) {
      setError(`Cannot withdraw more than current balance (${formatCurrency(goal.currentAmount, preferences.currency)}).`);
      return;
    }

    const projectedAmount = type === 'deposit' ? goal.currentAmount + parsed : goal.currentAmount - parsed;

    contributeToGoal(goal.id, parsed, type, note.trim() || undefined);

    // If milestone reached 100%, trigger celebratory confetti!
    if (projectedAmount >= goal.targetAmount) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#34D399', '#67E8F9', '#FBBF24'],
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="relative w-full max-w-md bg-[#0f1626] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-600/15 text-violet-400 border border-violet-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Allocate Savings</h2>
              <p className="text-[11px] text-slate-400">
                Deposit or withdraw from <strong className="text-white">{goal.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Type Toggle: Deposit / Withdrawal */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                type === 'deposit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposit (Add)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('withdrawal')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                type === 'withdrawal'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>

          {/* Goal Progress Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Current Saved:</span>
              <span className="font-numeric font-bold text-white">
                {formatCurrency(goal.currentAmount, preferences.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Target:</span>
              <span className="font-numeric text-slate-300">
                {formatCurrency(goal.targetAmount, preferences.currency)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Amount ({preferences.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
                {preferences.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="20000"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-numeric font-bold text-base focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly salary sweep, Diwali bonus"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm {type === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
