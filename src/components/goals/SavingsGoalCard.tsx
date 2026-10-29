import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  PlusCircle,
  History,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/finance';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onContribute: (goal: SavingsGoal) => void;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onContribute,
}) => {
  const { preferences } = useFinance();
  const [showHistory, setShowHistory] = useState(false);

  const percentAchieved = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 100)
  );
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const today = new Date('2026-10-28');
  const targetDate = new Date(goal.targetDate);
  const diffTime = targetDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
  const monthlyNeeded = remaining > 0 ? Math.round(remaining / monthsLeft) : 0;

  const isCompleted = percentAchieved >= 100;

  return (
    <div className="p-5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 hover:border-slate-700/80 shadow-xs transition-colors space-y-4 group">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="p-2.5 rounded-lg shrink-0"
            style={{
              backgroundColor: `${goal.color}15`,
              border: `1px solid ${goal.color}30`,
            }}
          >
            <CategoryIcon
              name={goal.categoryIcon || 'Target'}
              className="w-4 h-4"
              color={goal.color}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
              {goal.name}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>{goal.targetDate}</span>
              <span>·</span>
              <span>{daysLeft > 0 ? `${daysLeft}d remaining` : 'Target reached'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Edit goal"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal.id)}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Delete goal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Figures Row */}
      <div className="flex items-baseline justify-between gap-2 font-numeric tabular-nums">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            Accumulated Capital
          </span>
          <span className="text-2xl font-bold text-white">
            {formatCurrency(goal.currentAmount, preferences.currency)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            Target
          </span>
          <span className="text-xs font-semibold text-slate-300">
            {formatCurrency(goal.targetAmount, preferences.currency)}
          </span>
        </div>
      </div>

      {/* Progress Bar with Milestone Markers */}
      <div className="space-y-1.5">
        <div className="relative h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
          <div
            style={{
              width: `${percentAchieved}%`,
              backgroundColor: goal.color,
            }}
            className="h-full rounded-full transition-all duration-300"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-numeric tabular-nums">
          <span>
            {isCompleted ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3 h-3" />
                Target 100% Achieved
              </span>
            ) : (
              <span>
                Remaining: <strong className="text-slate-200">{formatCurrency(remaining, preferences.currency)}</strong>
                {monthlyNeeded > 0 && ` (${formatCurrency(monthlyNeeded, preferences.currency)}/mo)`}
              </span>
            )}
          </span>
          <span className="font-semibold text-white">
            {percentAchieved}%
          </span>
        </div>
      </div>

      {/* Notes if present */}
      {goal.notes && (
        <p className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 leading-relaxed">
          {goal.notes}
        </p>
      )}

      {/* Action Row */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <History className="w-3 h-3" />
          <span>{goal.contributions.length} Contributions</span>
        </button>

        <button
          type="button"
          onClick={() => onContribute(goal)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/15 hover:bg-violet-600/25 text-violet-300 text-xs font-semibold border border-violet-500/25 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add / Withdraw</span>
        </button>
      </div>

      {/* Contribution History Collapsible */}
      {showHistory && (
        <div className="pt-2 border-t border-slate-800 space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px]">
          {goal.contributions.length === 0 ? (
            <div className="text-slate-500 italic py-1">No deposits logged yet.</div>
          ) : (
            goal.contributions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/50 border border-slate-800/40"
              >
                <div className="flex items-center gap-2">
                  <span className={c.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}>
                    {c.type === 'deposit' ? '+ Deposit' : '- Withdrawal'}
                  </span>
                  <span className="text-slate-500">{c.date}</span>
                </div>
                <div className="font-semibold text-slate-200 tabular-nums">
                  {formatCurrency(c.amount, preferences.currency)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
