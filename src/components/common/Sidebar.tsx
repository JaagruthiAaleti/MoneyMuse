import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  LineChart,
  PieChart,
  Target,
  Sparkles,
  Settings,
  ShieldCheck,
  X,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAddTransaction: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  onOpenAddTransaction,
}) => {
  const { activeTab, setActiveTab, financialSummary, preferences } = useFinance();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'coach', label: 'AI Money Coach', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a0f1d] dark:bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col transition-transform duration-250 ease-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 p-[1px] shadow-sm">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[7px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-violet-400 to-indigo-300 text-sm">
                  M
                </span>
              </div>
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">
                Money<span className="text-violet-400">Muse</span>
              </span>
              <div className="text-[10px] text-slate-400 font-medium">Financial Intelligence</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Liquid Balance Snapshot Card */}
        <div className="p-3.5 mx-3.5 my-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>Liquid Reserves</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white tracking-tight font-numeric">
            {formatCurrency(financialSummary.totalBalance, preferences.currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Savings Pace</span>
            <span className="font-semibold text-emerald-400 font-numeric">
              {financialSummary.savingsRate}% retained
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 font-semibold border-l-2 border-violet-500 rounded-l-none'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-violet-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800/60 space-y-2">
          <button
            type="button"
            onClick={() => {
              onOpenAddTransaction();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-sm transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>

          {/* Unboxed workspace metadata */}
          <div className="flex items-center justify-between px-2 text-[10px] text-slate-400 pt-1">
            <span>{preferences.isDemoMode ? 'Demo Workspace' : 'Personal Workspace'}</span>
            <span className="font-numeric">52 Entries</span>
          </div>
        </div>
      </aside>
    </>
  );
};
