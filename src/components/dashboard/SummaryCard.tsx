import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: string;
  icon: React.ReactNode;
  deltaText: string;
  deltaType: 'positive' | 'negative' | 'neutral';
  tooltip?: string;
  sparklinePoints?: string;
  sparklineColor?: string;
  subtitle?: string;
  isPrimary?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  icon,
  deltaText,
  deltaType,
  tooltip,
  sparklinePoints,
  sparklineColor = '#8B5CF6',
  subtitle,
  isPrimary = false,
}) => {
  return (
    <div
      className={`relative p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
        isPrimary
          ? 'bg-gradient-to-br from-[#121a30] to-[#0d1424] border-violet-500/30 shadow-md'
          : 'bg-[#0f1626] dark:bg-[#0f1626] border-slate-800/80 hover:border-slate-700/80 shadow-xs'
      }`}
    >
      <div>
        {/* Top row: Label + Icon */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <span>{title}</span>
            {tooltip && (
              <div className="relative group/tooltip cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/tooltip:block w-48 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 shadow-xl z-30 pointer-events-none">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <div className="p-2 rounded-lg bg-slate-800/40 text-slate-300 border border-slate-700/30">
            {icon}
          </div>
        </div>

        {/* Main Metric Figure */}
        <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-numeric tabular-nums my-1">
          {amount}
        </div>
      </div>

      {/* Bottom row: Clean unboxed delta + Sparkline */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800/50">
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-medium font-numeric ${
              deltaType === 'positive'
                ? 'text-emerald-400'
                : deltaType === 'negative'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {deltaType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {deltaType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {deltaType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            {deltaText}
          </span>
          {subtitle && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-500">{subtitle}</span>
            </>
          )}
        </div>

        {/* Mini Sparkline SVG */}
        {sparklinePoints && (
          <div className="w-16 h-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke={sparklineColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklinePoints}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
