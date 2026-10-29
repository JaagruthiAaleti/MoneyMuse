import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';
import { Building2, ArrowRight, Store } from 'lucide-react';

export const MerchantVelocityChart: React.FC = () => {
  const { merchantAnalytics, preferences, setActiveTab, setSearchQuery } = useFinance();

  const handleMerchantClick = (name: string) => {
    setSearchQuery(name);
    setActiveTab('transactions');
  };

  return (
    <div className="p-5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
              <Store className="w-4 h-4 text-violet-400" />
              <span>Merchant Velocity & Payee Share</span>
            </h2>
            <span className="text-slate-500 font-normal">·</span>
            <span className="text-[11px] text-slate-400 font-mono">
              Top {merchantAnalytics.length} Payees
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Top expenditure recipients, ticket frequency, and concentration
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 cursor-pointer"
        >
          <span>Ledger</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Payee Bars */}
      {merchantAnalytics.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-xs">
          No merchant activity recorded in this period.
        </div>
      ) : (
        <div className="space-y-3">
          {merchantAnalytics.map((m, idx) => (
            <div
              key={m.name}
              onClick={() => handleMerchantClick(m.name)}
              className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-slate-500 w-4 shrink-0">
                    #{idx + 1}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: m.categoryColor }}
                  />
                  <span className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                    {m.name}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    ({m.categoryName})
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-numeric tabular-nums text-xs">
                  <span className="text-[11px] text-slate-400">
                    {m.count} {m.count === 1 ? 'tx' : 'txs'} · {formatCurrency(m.averageTicket, preferences.currency)} avg
                  </span>
                  <span className="font-bold text-white">
                    {formatCurrency(m.amount, preferences.currency)}
                  </span>
                  <span className="text-[10px] font-mono text-violet-400 w-8 text-right">
                    {m.percentageOfSpend}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${m.percentageOfSpend}%`,
                    backgroundColor: m.categoryColor,
                  }}
                  className="h-full rounded-full transition-all duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-3.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Click any payee to view and filter matching transactions in the ledger.</span>
        <span className="font-mono">Real-time reconciliation</span>
      </div>
    </div>
  );
};
