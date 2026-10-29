import React, { useState } from 'react';
import { Plus, Target, PiggyBank } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { SavingsGoalCard } from '../goals/SavingsGoalCard';
import { SavingsGoalModal } from '../goals/SavingsGoalModal';
import { ContributeModal } from '../goals/ContributeModal';
import { SavingsGoal } from '../../types';

export const SavingsGoalsView: React.FC = () => {
  const { savingsGoals, preferences, deleteSavingsGoal } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [activeContributeGoal, setActiveContributeGoal] = useState<SavingsGoal | null>(null);

  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and primary action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Savings & Wealth Goals</h2>
          <p className="text-xs text-slate-400">
            Dedicated milestones for emergency liquidity, travel, hardware, and life investments
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Aggregate Portfolio Progress Card */}
      <div className="p-5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Accumulated Portfolio Capital</div>
              <div className="text-2xl font-bold text-white font-numeric tabular-nums tracking-tight">
                {formatCurrency(totalSaved, preferences.currency)}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">
                  of {formatCurrency(totalTarget, preferences.currency)} target
                </span>
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
            <div className="text-[11px] text-slate-400">Overall Funded</div>
            <div className="text-2xl font-bold text-emerald-400 font-numeric tabular-nums">
              {overallProgress}%
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${overallProgress}%` }}
              className="h-full bg-emerald-400 transition-all duration-300"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{savingsGoals.length} milestones active</span>
            <span className="tabular-nums">
              Remaining: <strong className="text-slate-200">{formatCurrency(Math.max(0, totalTarget - totalSaved), preferences.currency)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Goal Cards */}
      {savingsGoals.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0f1626] border border-slate-800/80">
          <Target className="w-8 h-8 text-slate-600 mx-auto mb-2.5" />
          <h3 className="text-xs font-bold text-white mb-1">No Goals Defined Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
            Having explicit targets helps prioritize surplus cash flow systematically.
          </p>
          <button
            type="button"
            onClick={() => setIsGoalModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
          >
            Create Your First Savings Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEdit={(target) => {
                setEditingGoal(target);
                setIsGoalModalOpen(true);
              }}
              onDelete={deleteSavingsGoal}
              onContribute={(target) => {
                setActiveContributeGoal(target);
                setIsContributeModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        goalToEdit={editingGoal}
      />

      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => {
          setIsContributeModalOpen(false);
          setActiveContributeGoal(null);
        }}
        goal={activeContributeGoal}
      />
    </div>
  );
};
