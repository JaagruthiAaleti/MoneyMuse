import React, { useState, useMemo } from 'react';
import { DailyCashFlow } from '../../types';
import {
  formatCompactCurrency,
  formatCurrency,
  generateAdaptiveCashFlow,
} from '../../utils/finance';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

interface CashFlowChartProps {
  data?: DailyCashFlow[];
  title?: string;
  subtitle?: string;
  allowGranularityToggle?: boolean;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  title = 'Cash Flow Dynamics',
  subtitle = 'Trajectory of gross inflows, outflows, and cumulative retained surplus',
  allowGranularityToggle = true,
}) => {
  const { preferences, transactions, currentDateRange } = useFinance();

  // Active series toggles
  const [showIncome, setShowIncome] = useState(true);
  const [showExpense, setShowExpense] = useState(true);
  const [showCumulative, setShowCumulative] = useState(false);

  // Granularity state: 'auto' | 'daily' | 'weekly' | 'monthly'
  const [granularity, setGranularity] = useState<'auto' | 'daily' | 'weekly' | 'monthly'>('auto');

  // Hover state for interactive inspection
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute adaptive cash flow series directly from shared transactions in currentDateRange
  const adaptiveResult = useMemo(() => {
    return generateAdaptiveCashFlow(
      transactions,
      currentDateRange.start,
      currentDateRange.end,
      granularity
    );
  }, [transactions, currentDateRange, granularity]);

  const chartData = adaptiveResult.points;

  // Maximum value for scaling (handles income, expense, and cumulative if active)
  const maxVal = useMemo(() => {
    if (chartData.length === 0) return 1000;
    const candidates: number[] = [1000];

    chartData.forEach((d) => {
      if (showIncome) candidates.push(d.income);
      if (showExpense) candidates.push(d.expense);
      if (showCumulative && d.cumulativeNet !== undefined) {
        candidates.push(Math.abs(d.cumulativeNet));
      }
    });

    const max = Math.max(...candidates);
    return Math.ceil(max * 1.15);
  }, [chartData, showIncome, showExpense, showCumulative]);

  // SVG dimensions & margins
  const svgWidth = 800;
  const svgHeight = 270;
  const padLeft = 56;
  const padRight = 20;
  const padTop = 22;
  const padBottom = 34;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Coordinate mapping
  const points = useMemo(() => {
    if (chartData.length === 0) return { income: [], expense: [], cumulative: [] };
    const step = chartData.length > 1 ? plotWidth / (chartData.length - 1) : plotWidth;

    const incomeCoords = chartData.map((d, i) => {
      const x = padLeft + i * step;
      const y = padTop + plotHeight - (d.income / maxVal) * plotHeight;
      return { x, y, data: d };
    });

    const expenseCoords = chartData.map((d, i) => {
      const x = padLeft + i * step;
      const y = padTop + plotHeight - (d.expense / maxVal) * plotHeight;
      return { x, y, data: d };
    });

    const cumulativeCoords = chartData.map((d, i) => {
      const val = d.cumulativeNet || 0;
      // Clamp between 0 and maxVal for visualization
      const normalized = Math.max(0, val);
      const x = padLeft + i * step;
      const y = padTop + plotHeight - (normalized / maxVal) * plotHeight;
      return { x, y, data: d };
    });

    return { income: incomeCoords, expense: expenseCoords, cumulative: cumulativeCoords };
  }, [chartData, maxVal, plotWidth, plotHeight, padLeft, padTop]);

  // Cubic Bezier path generator
  const generateBezierPath = (coords: Array<{ x: number; y: number }>) => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const incomeLine = useMemo(() => generateBezierPath(points.income), [points.income]);
  const expenseLine = useMemo(() => generateBezierPath(points.expense), [points.expense]);
  const cumulativeLine = useMemo(() => generateBezierPath(points.cumulative), [points.cumulative]);

  const baseline = padTop + plotHeight;

  const incomeArea = useMemo(() => {
    if (points.income.length < 2) return '';
    const firstX = points.income[0].x;
    const lastX = points.income[points.income.length - 1].x;
    return `${incomeLine} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  }, [incomeLine, points.income, baseline]);

  const expenseArea = useMemo(() => {
    if (points.expense.length < 2) return '';
    const firstX = points.expense[0].x;
    const lastX = points.expense[points.expense.length - 1].x;
    return `${expenseLine} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  }, [expenseLine, points.expense, baseline]);

  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  // Pick balanced X-axis tick indices
  const xAxisIndices = useMemo(() => {
    const len = chartData.length;
    if (len <= 7) return chartData.map((_, i) => i);
    const step = Math.max(1, Math.floor(len / 6));
    const indices: number[] = [];
    for (let i = 0; i < len; i += step) {
      indices.push(i);
    }
    if (indices[indices.length - 1] !== len - 1) {
      indices.push(len - 1);
    }
    return indices;
  }, [chartData]);

  const activePoint = hoveredIndex !== null && chartData[hoveredIndex] ? chartData[hoveredIndex] : null;

  return (
    <div className="p-5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs flex flex-col justify-between">
      {/* Top Controls & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              {title}
            </h2>
            <span className="text-slate-500 font-normal">·</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {adaptiveResult.granularity.toUpperCase()} ({chartData.length} buckets)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Action Controls: Granularity & Series Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {allowGranularityToggle && (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
              {(['auto', 'daily', 'weekly', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGranularity(mode)}
                  className={`px-2 py-0.5 rounded capitalize font-medium transition-colors cursor-pointer ${
                    granularity === mode
                      ? 'bg-slate-700/80 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}

          {/* Series Toggles */}
          <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setShowIncome(!showIncome)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                showIncome
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Inflows</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExpense(!showExpense)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                showExpense
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span>Outflows</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCumulative(!showCumulative)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                showCumulative
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Net Runway</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Metric Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs">
        <div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-cyan-400" />
            <span>Total Inflows</span>
          </div>
          <div className="text-xs font-semibold text-white font-numeric tabular-nums mt-0.5">
            {formatCurrency(adaptiveResult.totalIncome, preferences.currency)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-violet-400" />
            <span>Total Outflows</span>
          </div>
          <div className="text-xs font-semibold text-white font-numeric tabular-nums mt-0.5">
            {formatCurrency(adaptiveResult.totalExpense, preferences.currency)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Net Surplus</span>
          </div>
          <div
            className={`text-xs font-semibold font-numeric tabular-nums mt-0.5 ${
              adaptiveResult.netSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {adaptiveResult.netSurplus >= 0 ? '+' : ''}
            {formatCurrency(adaptiveResult.netSurplus, preferences.currency)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>Avg {adaptiveResult.granularity} Burn</span>
          </div>
          <div className="text-xs font-semibold text-slate-300 font-numeric tabular-nums mt-0.5">
            {formatCurrency(adaptiveResult.averageBucketExpense, preferences.currency)}
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        {chartData.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
            <Info className="w-8 h-8 text-slate-600" />
            <p>No transaction records found for the selected period.</p>
            <p className="text-[11px] text-slate-600">
              Try extending your date filter or recording a new transaction.
            </p>
          </div>
        ) : (
          <div className="w-full aspect-[800/270] min-h-[220px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible select-none"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="cfIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="cfExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="cfCumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines & Y-Axis Labels */}
              {gridTicks.map((tick) => {
                const y = padTop + plotHeight - tick * plotHeight;
                const value = tick * maxVal;
                return (
                  <g key={tick}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeDasharray="2 4"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      className="fill-slate-500 text-[10px] font-mono tabular-nums"
                    >
                      {formatCompactCurrency(value, preferences.currency)}
                    </text>
                  </g>
                );
              })}

              {/* Inflows Area & Line */}
              {showIncome && (
                <>
                  <path d={incomeArea} fill="url(#cfIncomeGrad)" />
                  <path
                    d={incomeLine}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Outflows Area & Line */}
              {showExpense && (
                <>
                  <path d={expenseArea} fill="url(#cfExpenseGrad)" />
                  <path
                    d={expenseLine}
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Cumulative Net Curve */}
              {showCumulative && (
                <path
                  d={cumulativeLine}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.2"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* X-Axis Tick Labels */}
              {xAxisIndices.map((idx) => {
                const pt = points.income[idx];
                if (!pt) return null;
                return (
                  <text
                    key={idx}
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="fill-slate-400 text-[10px] font-medium font-mono"
                  >
                    {pt.data.label}
                  </text>
                );
              })}

              {/* Interactive Crosshair & Highlight Dots */}
              {hoveredIndex !== null && points.income[hoveredIndex] && (
                <g>
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={points.income[hoveredIndex].x}
                    y1={padTop}
                    x2={points.income[hoveredIndex].x}
                    y2={baseline}
                    stroke="#64748b"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />

                  {showIncome && (
                    <circle
                      cx={points.income[hoveredIndex].x}
                      cy={points.income[hoveredIndex].y}
                      r="4.5"
                      fill="#22d3ee"
                      stroke="#0a0f1d"
                      strokeWidth="2.5"
                    />
                  )}

                  {showExpense && (
                    <circle
                      cx={points.expense[hoveredIndex].x}
                      cy={points.expense[hoveredIndex].y}
                      r="4.5"
                      fill="#a78bfa"
                      stroke="#0a0f1d"
                      strokeWidth="2.5"
                    />
                  )}

                  {showCumulative && points.cumulative[hoveredIndex] && (
                    <circle
                      cx={points.cumulative[hoveredIndex].x}
                      cy={points.cumulative[hoveredIndex].y}
                      r="4.5"
                      fill="#34d399"
                      stroke="#0a0f1d"
                      strokeWidth="2.5"
                    />
                  )}
                </g>
              )}

              {/* Transparent Hit Slices for Seamless Scrubbing */}
              {chartData.map((_, idx) => {
                const step = chartData.length > 1 ? plotWidth / (chartData.length - 1) : plotWidth;
                const sliceX = padLeft + idx * step - step / 2;
                return (
                  <rect
                    key={idx}
                    x={Math.max(0, sliceX)}
                    y={padTop}
                    width={step}
                    height={plotHeight}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoveredIndex(idx)}
                  />
                );
              })}
            </svg>
          </div>
        )}

        {/* Hover Inspector Card */}
        {activePoint && hoveredIndex !== null && points.income[hoveredIndex] && (
          <div
            className="absolute top-2 z-20 pointer-events-none p-3 rounded-lg bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs text-slate-200 transition-all duration-75 min-w-[200px]"
            style={{
              left: `${Math.min(
                Math.max(8, (points.income[hoveredIndex].x / svgWidth) * 100),
                74
              )}%`,
            }}
          >
            <div className="font-semibold text-slate-100 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between gap-3">
              <span className="font-sans text-xs">{activePoint.label}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {activePoint.transactionCount || 0} {activePoint.transactionCount === 1 ? 'tx' : 'txs'}
              </span>
            </div>

            <div className="space-y-1.5 font-numeric tabular-nums">
              {showIncome && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-cyan-400 font-sans text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Inflow:
                  </span>
                  <span className="font-bold text-white text-xs">
                    {formatCurrency(activePoint.income, preferences.currency)}
                  </span>
                </div>
              )}

              {showExpense && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-violet-400 font-sans text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    Outflow:
                  </span>
                  <span className="font-bold text-white text-xs">
                    {formatCurrency(activePoint.expense, preferences.currency)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400 font-sans">Period Margin:</span>
                <span
                  className={`font-semibold ${
                    activePoint.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {activePoint.net >= 0 ? '+' : ''}
                  {formatCurrency(activePoint.net, preferences.currency)}
                </span>
              </div>

              {activePoint.cumulativeNet !== undefined && (
                <div className="flex items-center justify-between gap-4 text-[11px]">
                  <span className="text-emerald-400 font-sans">Cumulative:</span>
                  <span className="font-semibold text-emerald-300">
                    {activePoint.cumulativeNet >= 0 ? '+' : ''}
                    {formatCurrency(activePoint.cumulativeNet, preferences.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Insight Pill */}
      {adaptiveResult.peakExpensePoint && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>
              Peak Outflow:{' '}
              <strong className="text-slate-200 font-medium">
                {adaptiveResult.peakExpensePoint.label}
              </strong>{' '}
              ({formatCurrency(adaptiveResult.peakExpensePoint.expense, preferences.currency)})
            </span>
          </span>
          {adaptiveResult.peakIncomePoint && (
            <span className="text-slate-500 font-mono">
              Peak Inflow: {adaptiveResult.peakIncomePoint.label} (
              {formatCompactCurrency(adaptiveResult.peakIncomePoint.income, preferences.currency)})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
