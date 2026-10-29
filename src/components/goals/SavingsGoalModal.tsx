import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addSavingsGoal, updateSavingsGoal, preferences } = useFinance();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-03-31');
  const [categoryIcon, setCategoryIcon] = useState('Target');
  const [color, setColor] = useState('#34D399');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const icons = ['Target', 'ShieldCheck', 'Plane', 'Laptop', 'Sparkles', 'Home', 'Car', 'GraduationCap', 'HeartPulse'];
  const colors = ['#34D399', '#38BDF8', '#818CF8', '#A78BFA', '#EC4899', '#FBBF24', '#FB7185'];

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setTargetDate(goalToEdit.targetDate);
      setCategoryIcon(goalToEdit.categoryIcon);
      setColor(goalToEdit.color);
      setNotes(goalToEdit.notes || '');
    } else {
      setName('');
      setTargetAmount('');
      setTargetDate('2027-03-31');
      setCategoryIcon('Target');
      setColor('#34D399');
      setNotes('');
    }
    setError('');
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount);

    if (!name.trim()) {
      setError('Please provide a goal name.');
      return;
    }

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Please provide a positive target amount.');
      return;
    }

    if (goalToEdit) {
      updateSavingsGoal(goalToEdit.id, {
        name: name.trim(),
        targetAmount: parsedTarget,
        targetDate,
        categoryIcon,
        color,
        notes: notes.trim() || undefined,
      });
    } else {
      addSavingsGoal({
        name: name.trim(),
        targetAmount: parsedTarget,
        targetDate,
        categoryIcon,
        color,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="relative w-full max-w-md bg-[#0f1626] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {goalToEdit ? 'Modify Savings Goal' : 'Create Savings Goal'}
            </h2>
            <p className="text-[11px] text-slate-400">
              Track wealth milestones and long-term financial allocations
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Goal Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund, Japan Trip, M4 Mac Studio"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Amount ({preferences.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
                {preferences.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                min="100"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="250000"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-numeric font-bold text-base focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Completion Date
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Color & Icon Selection */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Accent Theme
              </label>
              <div className="flex items-center gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                      color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Strategy / Purpose (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Park in Liquid Mutual Funds for emergency liquidity"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Footer Submit */}
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
              <span>{goalToEdit ? 'Save Changes' : 'Create Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
