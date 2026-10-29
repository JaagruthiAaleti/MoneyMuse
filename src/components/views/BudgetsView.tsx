import React, { useState } from 'react';
import { Plus, PieChart } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { BudgetCard } from '../budgets/BudgetCard';
import { BudgetModal } from '../budgets/BudgetModal';
import { Budget } from '../../types';

export const BudgetsView: React.FC = () => {
  const { budgets, categorySpending, preferences, deleteBudget } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const totalAllocated = budgets.reduce((sum, b) => (b.isActive ? sum + b.limit : sum), 0);
  const totalSpentInBudgetCategories = budgets.reduce((sum, b) => {
    if (!b.isActive) return sum;
    const spent = categorySpending.find((c) => c.categoryId === b.categoryId)?.amount || 0;
    return sum + spent;
  }, 0);

  const totalRemaining = totalAllocated - totalSpentInBudgetCategories;
  const overallUtilization = totalAllocated > 0 ? Math.round((totalSpentInBudgetCategories / totalAllocated) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and primary action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Category Spending Budgets</h2>
          <p className="text-xs text-slate-400">
            Establish disciplined spending ceilings across living categories
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Aggregate Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Total Allocated Budget</div>
          <div className="text-2xl font-bold text-white font-numeric tabular-nums mt-1">
            {formatCurrency(totalAllocated, preferences.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{budgets.length} active spending caps</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Current Month Outflow</div>
          <div className="text-2xl font-bold text-violet-300 font-numeric tabular-nums mt-1">
            {formatCurrency(totalSpentInBudgetCategories, preferences.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{overallUtilization}% overall utilization</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Safe Remaining Capital</div>
          <div
            className={`text-2xl font-bold font-numeric tabular-nums mt-1 ${
              totalRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(totalRemaining, preferences.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalRemaining >= 0 ? 'Comfortably within pacing limits' : 'Pacing deficit detected'}
          </div>
        </div>
      </div>

      {/* Grid of Budget Cards */}
      {budgets.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0f1626] border border-slate-800/80">
          <PieChart className="w-8 h-8 text-slate-600 mx-auto mb-2.5" />
          <h3 className="text-xs font-bold text-white mb-1">No Active Budgets Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
            Setting spending targets helps prevent unexpected month-end surprises.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const spent = categorySpending.find((c) => c.categoryId === b.categoryId)?.amount || 0;
            return (
              <BudgetCard
                key={b.id}
                budget={b}
                spentAmount={spent}
                onEdit={(target) => {
                  setEditingBudget(target);
                  setIsModalOpen(true);
                }}
                onDelete={deleteBudget}
              />
            );
          })}
        </div>
      )}

      {/* Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        budgetToEdit={editingBudget}
      />
    </div>
  );
};
