import React, { useState, useMemo } from 'react';
import { MonthlyCashFlow } from '../../types';
import { formatCompactCurrency, formatCurrency, generateMonthlyComparison } from '../../utils/finance';
import { useFinance } from '../../context/FinanceContext';
import { TrendingUp, TrendingDown, Sparkles, BarChart3, Waves, Calendar } from 'lucide-react';

interface MonthlyComparisonChartProps {
  data?: MonthlyCashFlow[];
}

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ data: propData }) => {
  const { preferences, transactions } = useFinance();

  // Mode: 'clustered' (inflow/outflow/savings) or 'surplus' (net retained surplus)
  const [viewMode, setViewMode] = useState<'clustered' | 'surplus'>('clustered');
  const [horizonMonths, setHorizonMonths] = useState<6 | 12>(6);
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyCashFlow | null>(null);

  // Generate monthly cashflow data directly from shared transactions
  const monthlyData = useMemo(() => {
    return generateMonthlyComparison(transactions, horizonMonths, '2026-10-28');
  }, [transactions, horizonMonths]);

  // Max value for scaling
  const maxVal = useMemo(() => {
    if (monthlyData.length === 0) return 1000;
    const max = Math.max(
      ...monthlyData.map((d) => Math.max(d.income, d.expense, d.savings)),
      1000
    );
    return Math.ceil(max * 1.15);
  }, [monthlyData]);

  // Aggregate highlights
  const metrics = useMemo(() => {
    if (monthlyData.length === 0) {
      return { totalSavings: 0, avgExpense: 0, bestMonth: null };
    }
    const totalSavings = monthlyData.reduce((s, m) => s + m.savings, 0);
    const totalExpense = monthlyData.reduce((s, m) => s + m.expense, 0);
    const avgExpense = Math.round(totalExpense / monthlyData.length);
    const bestMonth = [...monthlyData].sort((a, b) => b.savings - a.savings)[0] || null;

    return { totalSavings, avgExpense, bestMonth };
  }, [monthlyData]);

  return (
    <div className="p-5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Period Trajectory & MoM Comparison
            </h2>
            <span className="text-slate-500 font-normal">·</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {horizonMonths} Months
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Gross inflows, outflows, and capital retention velocity
          </p>
        </div>

        {/* View Mode & Horizon Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 6M vs 12M */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setHorizonMonths(6)}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                horizonMonths === 6
                  ? 'bg-slate-700/80 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              6M
            </button>
            <button
              type="button"
              onClick={() => setHorizonMonths(12)}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                horizonMonths === 12
                  ? 'bg-slate-700/80 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              12M
            </button>
          </div>

          {/* Clustered vs Surplus Waterfall */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode('clustered')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                viewMode === 'clustered'
                  ? 'bg-slate-700/80 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3 h-3 text-cyan-400" />
              <span>Clustered</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('surplus')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                viewMode === 'surplus'
                  ? 'bg-slate-700/80 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Waves className="w-3 h-3 text-emerald-400" />
              <span>Net Surplus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Summary Metrics Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-800/60 text-xs">
        {/* Legend */}
        {viewMode === 'clustered' ? (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400" />
              <span>Inflows</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-violet-500" />
              <span>Outflows</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
              <span>Retained</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
              <span>Net Surplus</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
              <span>Net Deficit</span>
            </div>
          </div>
        )}

        {/* Aggregate Insights Pill */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-numeric tabular-nums">
          {metrics.bestMonth && (
            <span>
              Best Month: <strong className="text-emerald-400 font-semibold">{metrics.bestMonth.label}</strong> (
              {formatCompactCurrency(metrics.bestMonth.savings, preferences.currency)})
            </span>
          )}
          <span>·</span>
          <span>
            Avg Burn: <strong className="text-slate-200">{formatCompactCurrency(metrics.avgExpense, preferences.currency)}/mo</strong>
          </span>
        </div>
      </div>

      {/* Visual Chart Bars */}
      <div className="relative pt-2 pb-1">
        <div
          className={`grid gap-2 sm:gap-3.5 h-56 items-end ${
            horizonMonths === 6 ? 'grid-cols-6' : 'grid-cols-6 sm:grid-cols-12'
          }`}
        >
          {monthlyData.map((month, idx) => {
            const isHovered = hoveredMonth?.monthKey === month.monthKey;
            const netSurplus = month.income - month.expense;
            const isDeficit = netSurplus < 0;

            // Heights as percentages of maxVal
            const incomeHeight = `${Math.min(100, Math.round((month.income / maxVal) * 100))}%`;
            const expenseHeight = `${Math.min(100, Math.round((month.expense / maxVal) * 100))}%`;
            const savingsHeight = `${Math.min(100, Math.round((Math.max(0, month.savings) / maxVal) * 100))}%`;
            const surplusHeight = `${Math.min(100, Math.round((Math.abs(netSurplus) / maxVal) * 100))}%`;

            // Month-over-month expense change calculation
            const prevMonth = idx > 0 ? monthlyData[idx - 1] : null;
            const momExpensePct = prevMonth && prevMonth.expense > 0
              ? Math.round(((month.expense - prevMonth.expense) / prevMonth.expense) * 100)
              : null;

            return (
              <div
                key={month.monthKey}
                onMouseEnter={() => setHoveredMonth(month)}
                onMouseLeave={() => setHoveredMonth(null)}
                className={`flex flex-col items-center h-full justify-end p-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  isHovered ? 'bg-slate-800/70 ring-1 ring-slate-700' : 'hover:bg-slate-800/30'
                }`}
              >
                {/* Visual Bars Container */}
                {viewMode === 'clustered' ? (
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-40 mb-2">
                    {/* Inflow Bar */}
                    <div className="flex-1 max-w-[14px] h-full flex items-end">
                      <div
                        style={{ height: incomeHeight }}
                        className="w-full rounded-t-xs bg-cyan-400 shadow-xs transition-all duration-300 hover:brightness-110"
                      />
                    </div>

                    {/* Outflow Bar */}
                    <div className="flex-1 max-w-[14px] h-full flex items-end">
                      <div
                        style={{ height: expenseHeight }}
                        className="w-full rounded-t-xs bg-violet-500 shadow-xs transition-all duration-300 hover:brightness-110"
                      />
                    </div>

                    {/* Retained Savings Bar */}
                    <div className="flex-1 max-w-[14px] h-full flex items-end">
                      <div
                        style={{ height: savingsHeight }}
                        className="w-full rounded-t-xs bg-emerald-400 shadow-xs transition-all duration-300 hover:brightness-110"
                      />
                    </div>
                  </div>
                ) : (
                  /* Net Retained Surplus Waterfall View */
                  <div className="w-full flex items-end justify-center h-40 mb-2">
                    <div className="w-full max-w-[28px] h-full flex items-end">
                      <div
                        style={{ height: surplusHeight }}
                        className={`w-full rounded-t-xs shadow-xs transition-all duration-300 ${
                          isDeficit ? 'bg-rose-500' : 'bg-emerald-400'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Month Label & MoM Delta Tag */}
                <span className="text-[11px] font-medium text-slate-300 font-mono tracking-tight mt-0.5">
                  {month.label}
                </span>

                <div className="flex items-center gap-1 mt-0.5 font-numeric tabular-nums text-[10px]">
                  <span
                    className={
                      month.savingsRate >= 20
                        ? 'text-emerald-400 font-medium'
                        : month.savingsRate > 0
                        ? 'text-cyan-400 font-medium'
                        : 'text-rose-400 font-medium'
                    }
                  >
                    {month.savingsRate}%
                  </span>

                  {momExpensePct !== null && (
                    <span
                      className={`text-[9px] ${
                        momExpensePct <= 0 ? 'text-emerald-400/90' : 'text-slate-500'
                      }`}
                      title={`${momExpensePct >= 0 ? '+' : ''}${momExpensePct}% expenses vs previous month`}
                    >
                      {momExpensePct <= 0 ? '↓' : '↑'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Inspector Strip */}
        {hoveredMonth ? (
          <div className="mt-3.5 p-3 rounded-lg bg-slate-900 border border-slate-700/80 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-white font-mono">
                {hoveredMonth.label} Breakdown:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 font-numeric tabular-nums text-xs">
              <span className="text-cyan-400">
                Inflow: <strong>{formatCurrency(hoveredMonth.income, preferences.currency)}</strong>
              </span>
              <span className="text-violet-400">
                Outflow: <strong>{formatCurrency(hoveredMonth.expense, preferences.currency)}</strong>
              </span>
              <span className="text-emerald-400">
                Retained: <strong>{formatCurrency(hoveredMonth.savings, preferences.currency)}</strong> ({hoveredMonth.savingsRate}%)
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-center text-[11px] text-slate-500 min-h-[22px]">
            Hover over any monthly column to inspect exact inflows, outflows, and capital retention rate.
          </div>
        )}
      </div>
    </div>
  );
};
