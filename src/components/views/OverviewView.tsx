import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  Plus,
  Sparkles,
  PieChart,
  Target,
  FileSpreadsheet,
  Lightbulb,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, generateSparklinePoints } from '../../utils/finance';
import { SummaryCard } from '../dashboard/SummaryCard';
import { CashFlowChart } from '../charts/CashFlowChart';
import { SpendingDonutChart } from '../charts/SpendingDonutChart';
import { BudgetCard } from '../budgets/BudgetCard';
import { BudgetModal } from '../budgets/BudgetModal';
import { SavingsGoalModal } from '../goals/SavingsGoalModal';
import { CsvImportModal } from '../transactions/CsvImportModal';
import { CategoryIcon } from '../common/CategoryIcon';
import { Budget } from '../../types';

interface OverviewViewProps {
  onOpenAddTransaction: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onOpenAddTransaction }) => {
  const {
    financialSummary,
    categorySpending,
    dailyCashFlow,
    budgets,
    filteredTransactions,
    insights,
    preferences,
    setActiveTab,
    deleteBudget,
    setSearchQuery,
  } = useFinance();

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Sparkline data series
  const incomeSparkline = generateSparklinePoints(
    dailyCashFlow.map((d) => d.income),
    80,
    24
  );
  const expenseSparkline = generateSparklinePoints(
    dailyCashFlow.map((d) => d.expense),
    80,
    24
  );
  const savingsSparkline = generateSparklinePoints(
    dailyCashFlow.map((d) => Math.max(0, d.net)),
    80,
    24
  );

  return (
    <div className="space-y-6">
      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquid Reserves (Primary Hero) */}
        <SummaryCard
          title="Total Liquid Reserves"
          amount={formatCurrency(financialSummary.totalBalance, preferences.currency)}
          icon={<Wallet className="w-4 h-4 text-violet-400" />}
          deltaText={`${financialSummary.savingsRate}% saved`}
          deltaType={financialSummary.savingsRate >= 20 ? 'positive' : 'neutral'}
          subtitle="this cycle"
          sparklinePoints={savingsSparkline}
          sparklineColor="#8b5cf6"
          isPrimary={true}
          tooltip="Calculated from your verified bank reserves, cash accounts, and net cash flow."
        />

        {/* Gross Inflows */}
        <SummaryCard
          title="Period Inflow (Income)"
          amount={formatCurrency(financialSummary.totalIncome, preferences.currency)}
          icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
          deltaText={`${financialSummary.prevPeriod.incomeChangePercent >= 0 ? '+' : ''}${financialSummary.prevPeriod.incomeChangePercent}%`}
          deltaType={financialSummary.prevPeriod.incomeChangePercent >= 0 ? 'positive' : 'negative'}
          subtitle="vs prev"
          sparklinePoints={incomeSparkline}
          sparklineColor="#22d3ee"
          tooltip="Gross earnings including tech salary, freelance consulting, and dividends."
        />

        {/* Gross Outflows */}
        <SummaryCard
          title="Period Outflow (Expenses)"
          amount={formatCurrency(financialSummary.totalExpenses, preferences.currency)}
          icon={<TrendingDown className="w-4 h-4 text-rose-400" />}
          deltaText={`${financialSummary.prevPeriod.expenseChangePercent >= 0 ? '+' : ''}${financialSummary.prevPeriod.expenseChangePercent}%`}
          deltaType={financialSummary.prevPeriod.expenseChangePercent <= 0 ? 'positive' : 'negative'}
          subtitle="vs prev"
          sparklinePoints={expenseSparkline}
          sparklineColor="#fb7185"
          tooltip="Total expenditures across rent, groceries, transport, dining, and utilities."
        />

        {/* Savings Velocity */}
        <SummaryCard
          title="Savings Velocity"
          amount={`${financialSummary.savingsRate}%`}
          icon={<PiggyBank className="w-4 h-4 text-emerald-400" />}
          deltaText={`${financialSummary.prevPeriod.savingsRateChangePercent >= 0 ? '+' : ''}${financialSummary.prevPeriod.savingsRateChangePercent}% pts`}
          deltaType={financialSummary.prevPeriod.savingsRateChangePercent >= 0 ? 'positive' : 'negative'}
          subtitle="vs prior"
          sparklinePoints={savingsSparkline}
          sparklineColor="#34d399"
          tooltip="Percentage of incoming capital retained as surplus wealth (Target: 20%+)."
        />
      </div>

      {/* Quick Action Strip */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs">
        <span className="text-xs font-semibold text-slate-400 px-2 font-mono">
          Actions
        </span>

        <button
          type="button"
          onClick={onOpenAddTransaction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/15 hover:bg-violet-600/25 text-violet-300 text-xs font-medium border border-violet-500/25 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-violet-400" />
          <span>Add Transaction</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setEditingBudget(null);
            setIsBudgetModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/50 transition-colors cursor-pointer"
        >
          <PieChart className="w-3.5 h-3.5 text-indigo-400" />
          <span>Set Budget</span>
        </button>

        <button
          type="button"
          onClick={() => setIsGoalModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/50 transition-colors cursor-pointer"
        >
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span>New Goal</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCsvModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/50 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Import CSV</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coach')}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 text-violet-300 text-xs font-medium border border-slate-700/50 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Consult AI Coach</span>
        </button>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart data={dailyCashFlow} />
        </div>
        <div className="lg:col-span-1">
          <SpendingDonutChart
            categories={categorySpending}
            onSelectCategory={(catId) => {
              const cat = categorySpending.find((c) => c.categoryId === catId);
              if (cat) {
                setSearchQuery(cat.categoryName);
                setActiveTab('transactions');
              }
            }}
          />
        </div>
      </div>

      {/* Financial Insights Strip */}
      <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <h2 className="text-xs font-semibold text-white tracking-tight">
              Data-Backed Observations
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {insights.length} active findings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className={`p-3 rounded-lg border text-xs ${
                ins.type === 'positive'
                  ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200'
                  : ins.type === 'warning'
                  ? 'bg-rose-950/20 border-rose-900/40 text-slate-200'
                  : 'bg-indigo-950/20 border-indigo-900/40 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-white truncate">{ins.title}</span>
                {ins.metric && (
                  <span className="font-mono text-[10px] text-slate-400 tabular-nums shrink-0">
                    {ins.metric}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {ins.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Budgets & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Budgets */}
        <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div>
              <h2 className="text-xs font-semibold text-white tracking-tight">
                Active Category Budgets
              </h2>
              <p className="text-[11px] text-slate-400">Pacing and threshold utilization</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('budgets')}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {budgets.slice(0, 3).map((b) => {
              const spent = categorySpending.find((c) => c.categoryId === b.categoryId)?.amount || 0;
              return (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  spentAmount={spent}
                  onEdit={(target) => {
                    setEditingBudget(target);
                    setIsBudgetModalOpen(true);
                  }}
                  onDelete={deleteBudget}
                />
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div>
              <h2 className="text-xs font-semibold text-white tracking-tight">
                Recent Ledger Activity
              </h2>
              <p className="text-[11px] text-slate-400">Latest recorded cash movements</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {filteredTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                onClick={() => {
                  setSearchQuery(tx.title);
                  setActiveTab('transactions');
                }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-slate-200 shrink-0"
                    style={{
                      backgroundColor: `${tx.categoryColor}15`,
                      border: `1px solid ${tx.categoryColor}30`,
                    }}
                  >
                    {tx.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                      {tx.title}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{tx.categoryName}</span>
                      <span>·</span>
                      <span className="font-mono">{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 font-numeric tabular-nums font-semibold text-xs">
                  <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}>
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, preferences.currency)}
                  </span>
                  <div className="text-[10px] text-slate-500 font-sans">{tx.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgetToEdit={editingBudget}
      />
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
    </div>
  );
};
