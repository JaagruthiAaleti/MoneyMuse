import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgetToEdit,
}) => {
  const { categories, addBudget, updateBudget, preferences } = useFinance();

  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [error, setError] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (budgetToEdit) {
      setCategoryId(budgetToEdit.categoryId);
      setLimit(budgetToEdit.limit.toString());
      setPeriod(budgetToEdit.period);
      setAlertThreshold(budgetToEdit.alertThreshold.toString());
    } else {
      setCategoryId(expenseCategories[0]?.id || '');
      setLimit('');
      setPeriod('monthly');
      setAlertThreshold('80');
    }
    setError('');
  }, [budgetToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(limit);
    const parsedThreshold = parseInt(alertThreshold, 10);

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError('Please specify a positive budget limit amount.');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];

    if (budgetToEdit) {
      updateBudget(budgetToEdit.id, {
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        categoryColor: selectedCategory.color,
        categoryIcon: selectedCategory.icon,
        limit: parsedLimit,
        period,
        alertThreshold: parsedThreshold || 80,
      });
    } else {
      addBudget({
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        categoryColor: selectedCategory.color,
        categoryIcon: selectedCategory.icon,
        limit: parsedLimit,
        period,
        alertThreshold: parsedThreshold || 80,
        isActive: true,
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
              {budgetToEdit ? 'Modify Budget' : 'Create Category Budget'}
            </h2>
            <p className="text-[11px] text-slate-400">
              Set spending caps and threshold alerts to protect your savings
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

          {/* Category Select */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Expense Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Limit */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Spending Limit ({preferences.currencySymbol})
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
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-numeric font-bold text-base focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Period & Alert Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Budget Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Alert Threshold (%)
              </label>
              <select
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="75">75% of limit</option>
                <option value="80">80% of limit</option>
                <option value="90">90% of limit</option>
                <option value="100">100% (Strict)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
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
              <span>{budgetToEdit ? 'Save Changes' : 'Create Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
