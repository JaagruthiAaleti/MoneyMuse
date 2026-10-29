import React from 'react';
import { Edit2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Budget } from '../../types';
import { formatCurrency } from '../../utils/finance';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';

interface BudgetCardProps {
  budget: Budget;
  spentAmount: number;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  spentAmount,
  onEdit,
  onDelete,
}) => {
  const { preferences } = useFinance();

  const percentUsed = Math.round((spentAmount / budget.limit) * 100);
  const remaining = budget.limit - spentAmount;
  const isOver = remaining < 0;
  const isNearLimit = percentUsed >= budget.alertThreshold && !isOver;

  // Days left in current month (reference Oct 28, 2026 => 3 days left in Oct)
  const daysLeft = Math.max(1, 31 - 28);
  const dailyRunway = remaining > 0 ? Math.round(remaining / daysLeft) : 0;

  let statusText = (
    <span className="text-[11px] font-medium text-emerald-400">
      On Track ({percentUsed}%)
    </span>
  );
  let barColor = 'bg-emerald-400';

  if (isOver) {
    statusText = (
      <span className="text-[11px] font-medium text-rose-400">
        Over Limit ({percentUsed}%)
      </span>
    );
    barColor = 'bg-rose-500';
  } else if (isNearLimit) {
    statusText = (
      <span className="text-[11px] font-medium text-amber-400">
        Near Cap ({percentUsed}%)
      </span>
    );
    barColor = 'bg-amber-400';
  }

  return (
    <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 hover:border-slate-700/80 shadow-xs transition-colors space-y-3.5 group">
      {/* Top row: Category icon + name + actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="p-2 rounded-lg shrink-0"
            style={{
              backgroundColor: `${budget.categoryColor}15`,
              border: `1px solid ${budget.categoryColor}30`,
            }}
          >
            <CategoryIcon
              name={budget.categoryIcon || 'Tag'}
              className="w-4 h-4"
              color={budget.categoryColor}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white truncate group-hover:text-violet-300 transition-colors">
              {budget.categoryName}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Monthly Ceiling
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Edit budget"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget.id)}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Delete budget"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Figures Row */}
      <div className="flex items-baseline justify-between gap-2 font-numeric tabular-nums">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            Actual Spent
          </span>
          <span className="text-lg font-bold text-white">
            {formatCurrency(spentAmount, preferences.currency)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            Cap Limit
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {formatCurrency(budget.limit, preferences.currency)}
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(100, percentUsed)}%` }}
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <span className="text-slate-400">
            {isOver ? (
              <span className="text-rose-400">
                Deficit: {formatCurrency(Math.abs(remaining), preferences.currency)}
              </span>
            ) : (
              <span>
                Runway: <strong className="text-slate-200 font-numeric tabular-nums">{formatCurrency(remaining, preferences.currency)}</strong>
              </span>
            )}
          </span>
          {statusText}
        </div>
      </div>
    </div>
  );
};
