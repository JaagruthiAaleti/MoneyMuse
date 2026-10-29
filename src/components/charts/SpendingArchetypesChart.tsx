import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { Zap, Building2, ShieldCheck, AlertCircle, ArrowUpRight, Scale } from 'lucide-react';

export const SpendingArchetypesChart: React.FC = () => {
  const { fiftyThirtyTwenty, spendingArchetypes, preferences } = useFinance();

  const { needs, wants, savings, healthStatus, headline, advice } = fiftyThirtyTwenty;
  const total = spendingArchetypes.total || 1;
  const fixedPct = Math.round((spendingArchetypes.fixed / total) * 100);
  const variablePct = Math.round((spendingArchetypes.variable / total) * 100);

  return (
    <div className="p-5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-violet-400" />
              <span>Capital Structure & 50/30/20 Alignment</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Macro evaluation of essential needs, discretionary lifestyle, and wealth retention
          </p>
        </div>

        {/* Health status badge */}
        <div
          className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 shrink-0 ${
            healthStatus === 'healthy'
              ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300'
              : healthStatus === 'caution'
              ? 'bg-amber-950/40 border border-amber-800/50 text-amber-300'
              : 'bg-rose-950/40 border border-rose-800/50 text-rose-300'
          }`}
        >
          {healthStatus === 'healthy' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{headline}</span>
        </div>
      </div>

      {/* 50/30/20 Distribution Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Needs (50%) */}
        <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Needs (Essentials)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Target: 50%</span>
          </div>

          <div className="flex items-baseline justify-between font-numeric tabular-nums pt-1">
            <span className="text-base font-bold text-white">
              {formatCurrency(needs.actual, preferences.currency)}
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              {needs.actualPct}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, needs.actualPct)}%` }}
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Target: {formatCurrency(needs.targetAmount, preferences.currency)}</span>
            <span className={needs.delta >= 0 ? 'text-emerald-400' : 'text-rose-400 font-medium'}>
              {needs.delta >= 0 ? 'Within budget' : `${formatCurrency(Math.abs(needs.delta), preferences.currency)} excess`}
            </span>
          </div>
        </div>

        {/* Wants (30%) */}
        <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Wants (Lifestyle)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Target: 30%</span>
          </div>

          <div className="flex items-baseline justify-between font-numeric tabular-nums pt-1">
            <span className="text-base font-bold text-white">
              {formatCurrency(wants.actual, preferences.currency)}
            </span>
            <span className="text-xs font-semibold text-violet-400">
              {wants.actualPct}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, wants.actualPct)}%` }}
              className="h-full bg-violet-400 rounded-full transition-all duration-300"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Target: {formatCurrency(wants.targetAmount, preferences.currency)}</span>
            <span className={wants.delta >= 0 ? 'text-emerald-400' : 'text-amber-400 font-medium'}>
              {wants.delta >= 0 ? 'Controlled' : `${formatCurrency(Math.abs(wants.delta), preferences.currency)} over`}
            </span>
          </div>
        </div>

        {/* Savings (20%) */}
        <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Savings & Investing</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Target: 20%</span>
          </div>

          <div className="flex items-baseline justify-between font-numeric tabular-nums pt-1">
            <span className="text-base font-bold text-white">
              {formatCurrency(savings.actual, preferences.currency)}
            </span>
            <span className="text-xs font-semibold text-cyan-400">
              {savings.actualPct}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, savings.actualPct)}%` }}
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Target: {formatCurrency(savings.targetAmount, preferences.currency)}</span>
            <span className={savings.delta >= 0 ? 'text-emerald-400 font-medium' : 'text-rose-400'}>
              {savings.delta >= 0 ? `+${formatCurrency(savings.delta, preferences.currency)} surplus` : 'Lagging target'}
            </span>
          </div>
        </div>
      </div>

      {/* Structural Cost Elasticity & Recommendation Bar */}
      <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 font-numeric tabular-nums shrink-0">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Fixed Obligations:</span>
            <span className="font-semibold text-white">
              {formatCurrency(spendingArchetypes.fixed, preferences.currency)} ({fixedPct}%)
            </span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Elastic Variable:</span>
            <span className="font-semibold text-amber-300">
              {formatCurrency(spendingArchetypes.variable, preferences.currency)} ({variablePct}%)
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
          {advice}
        </p>
      </div>
    </div>
  );
};
