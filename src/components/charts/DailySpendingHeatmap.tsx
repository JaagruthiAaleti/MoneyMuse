import React, { useState, useMemo } from 'react';
import { DailyCashFlow } from '../../types';
import { formatCurrency, calculateCalendarHeatmap, CalendarDayCell } from '../../utils/finance';
import { useFinance } from '../../context/FinanceContext';
import { Calendar, ArrowRight, Sparkles, Coffee } from 'lucide-react';

interface DailySpendingHeatmapProps {
  data?: DailyCashFlow[];
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DailySpendingHeatmap: React.FC<DailySpendingHeatmapProps> = () => {
  const { preferences, transactions, currentDateRange, setActiveTab, setSearchQuery } = useFinance();
  const [hoveredCell, setHoveredCell] = useState<CalendarDayCell | null>(null);

  // Compute calendar-aligned week matrix directly from shared transactions in range
  const heatmapData = useMemo(() => {
    return calculateCalendarHeatmap(transactions, currentDateRange.start, currentDateRange.end);
  }, [transactions, currentDateRange]);

  const {
    weeks,
    maxDailyExpense,
    weekendAverage,
    weekdayAverage,
    zeroSpendDays,
    totalDays,
  } = heatmapData;

  const getIntensityColor = (amount: number, isInRange: boolean) => {
    if (!isInRange) {
      return 'bg-slate-900/20 border-slate-800/20 text-slate-700 opacity-30 cursor-default';
    }
    if (amount === 0) {
      return 'bg-slate-900/60 border-slate-800/60 text-slate-500 hover:border-slate-600';
    }
    const ratio = amount / maxDailyExpense;
    if (ratio < 0.2) {
      return 'bg-violet-950/70 border-violet-900/50 text-violet-300 hover:border-violet-700';
    }
    if (ratio < 0.5) {
      return 'bg-violet-800/80 border-violet-700/70 text-white hover:border-violet-500';
    }
    if (ratio < 0.8) {
      return 'bg-violet-600 border-violet-500 text-white shadow-xs hover:border-violet-400';
    }
    return 'bg-violet-400 border-violet-300 text-slate-950 font-bold shadow-md hover:border-white';
  };

  const handleCellClick = (cell: CalendarDayCell) => {
    if (!cell.isInRange || cell.transactionCount === 0) return;
    setSearchQuery(cell.date);
    setActiveTab('transactions');
  };

  return (
    <div className="p-5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Daily Spending Matrix
            </h2>
            <span className="text-slate-500 font-normal">·</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {totalDays} days tracked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Calendar-aligned day intensity across weekdays and weekends
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Quiet</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-900/60 border border-slate-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-violet-950/70" />
          <span className="w-2.5 h-2.5 rounded-xs bg-violet-800/80" />
          <span className="w-2.5 h-2.5 rounded-xs bg-violet-600" />
          <span className="w-2.5 h-2.5 rounded-xs bg-violet-400" />
          <span>Intense</span>
        </div>
      </div>

      {/* Weekday vs Weekend Analytical Insight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs font-numeric tabular-nums">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-slate-400 font-sans text-[11px]">Weekday Avg:</span>
          <span className="font-semibold text-slate-200">
            {formatCurrency(weekdayAverage, preferences.currency)}/day
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-slate-400 font-sans text-[11px]">Weekend Avg:</span>
          <span className="font-semibold text-violet-300">
            {formatCurrency(weekendAverage, preferences.currency)}/day
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-slate-400 font-sans text-[11px]">Zero-Spend Days:</span>
          <span className="font-semibold text-emerald-400">
            {zeroSpendDays} days ({totalDays > 0 ? Math.round((zeroSpendDays / totalDays) * 100) : 0}%)
          </span>
        </div>
      </div>

      {/* Matrix Visualization: 7 Rows (Mon-Sun) x N Weeks Columns */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[480px]">
          {/* Weekday rows */}
          <div className="grid grid-rows-7 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 0].map((dayIdx, rowIdx) => {
              const label = WEEKDAY_LABELS[rowIdx];
              const isWeekendRow = rowIdx >= 5;

              return (
                <div key={dayIdx} className="flex items-center gap-1.5">
                  {/* Row Label */}
                  <span
                    className={`w-7 text-[10px] font-mono shrink-0 text-right pr-1 ${
                      isWeekendRow ? 'text-violet-400 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>

                  {/* Day cells for each week in this row */}
                  <div className="flex-1 flex items-center gap-1.5">
                    {weeks.map((week, weekIdx) => {
                      const cell = week.find((c) => c.dayOfWeek === dayIdx);
                      if (!cell) {
                        return <div key={weekIdx} className="w-7 h-7 shrink-0" />;
                      }

                      const isHovered = hoveredCell?.date === cell.date;

                      return (
                        <div
                          key={cell.date}
                          onMouseEnter={() => cell.isInRange && setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => handleCellClick(cell)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md border flex flex-col items-center justify-center text-[10px] font-mono transition-all duration-100 shrink-0 ${getIntensityColor(
                            cell.expense,
                            cell.isInRange
                          )} ${
                            isHovered
                              ? 'ring-2 ring-white scale-110 z-20 shadow-lg'
                              : cell.isInRange
                              ? 'cursor-pointer'
                              : ''
                          }`}
                        >
                          <span className={cell.isInRange ? 'opacity-90' : 'opacity-20'}>
                            {cell.dayOfMonth}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Inspector Bar */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 min-h-[30px]">
        {hoveredCell ? (
          <>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white font-mono">
                {new Date(hoveredCell.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                · {hoveredCell.transactionCount} {hoveredCell.transactionCount === 1 ? 'tx' : 'txs'}
              </span>
            </div>

            <div className="flex items-center gap-4 font-numeric tabular-nums">
              <span className="text-violet-400 font-semibold">
                Outflow: {formatCurrency(hoveredCell.expense, preferences.currency)}
              </span>
              {hoveredCell.income > 0 && (
                <span className="text-cyan-400 font-semibold">
                  Inflow: {formatCurrency(hoveredCell.income, preferences.currency)}
                </span>
              )}
              {hoveredCell.transactionCount > 0 && (
                <button
                  type="button"
                  onClick={() => handleCellClick(hoveredCell)}
                  className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <span>View in Ledger</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </>
        ) : (
          <span className="text-slate-500 text-[11px]">
            Hover over any day tile to inspect exact cash movements and ticket frequency.
          </span>
        )}
      </div>
    </div>
  );
};
