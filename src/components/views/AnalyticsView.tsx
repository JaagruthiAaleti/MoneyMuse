import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { CashFlowChart } from '../charts/CashFlowChart';
import { SpendingDonutChart } from '../charts/SpendingDonutChart';
import { MonthlyComparisonChart } from '../charts/MonthlyComparisonChart';
import { DailySpendingHeatmap } from '../charts/DailySpendingHeatmap';
import { SpendingArchetypesChart } from '../charts/SpendingArchetypesChart';
import { MerchantVelocityChart } from '../charts/MerchantVelocityChart';

export const AnalyticsView: React.FC = () => {
  const {
    categorySpending,
    dailyCashFlow,
    monthlyComparison,
    transactions,
    currentDateRange,
    preferences,
    setActiveTab,
    setSearchQuery,
  } = useFinance();

  const periodTxs = transactions.filter(
    (t) => t.date >= currentDateRange.start && t.date <= currentDateRange.end
  );

  const largestTxs = [...periodTxs]
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-white tracking-tight">
          Financial Intelligence & Pattern Analytics
        </h2>
        <p className="text-xs text-slate-400">
          Macro capital dynamics, 50/30/20 allocation, daily spending matrices, and payee velocity
        </p>
      </div>

      {/* 50/30/20 Capital Structure & Cost Elasticity */}
      <SpendingArchetypesChart />

      {/* Primary Cash Flow and Period Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart data={dailyCashFlow} />
        <MonthlyComparisonChart data={monthlyComparison} />
      </div>

      {/* Daily Spending Calendar Heatmap & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailySpendingHeatmap data={dailyCashFlow} />
        </div>
        <div className="lg:col-span-1">
          <SpendingDonutChart categories={categorySpending} />
        </div>
      </div>

      {/* Payee Velocity & Largest Outflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchant Velocity Chart */}
        <MerchantVelocityChart />

        {/* Largest Outflow Ticket Items */}
        <div className="p-5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-rose-400" />
                  <span>Largest Individual Ticket Items</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Highest value single debits in active window</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Current Window</span>
            </div>

            <div className="space-y-2">
              {largestTxs.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs">
                  No individual outflow entries found in this period.
                </div>
              ) : (
                largestTxs.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      setSearchQuery(tx.title);
                      setActiveTab('transactions');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                        {tx.title}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: tx.categoryColor }}
                        />
                        <span>{tx.categoryName}</span>
                        <span>·</span>
                        <span className="font-mono">{tx.date}</span>
                        <span>·</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-numeric tabular-nums font-bold text-xs text-rose-300">
                      -{formatCurrency(tx.amount, preferences.currency)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Click any item to inspect its transaction details in the ledger.</span>
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
