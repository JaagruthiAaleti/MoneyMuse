import React, { useState } from 'react';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Plus,
  Calendar,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { DatePeriod } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenAddTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenAddTransaction,
}) => {
  const {
    activeTab,
    setActiveTab,
    dateFilter,
    setDatePeriod,
    searchQuery,
    setSearchQuery,
    preferences,
    toggleTheme,
  } = useFinance();

  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const periodOptions: Array<{ id: DatePeriod; label: string }> = [
    { id: 'this-week', label: 'This Week' },
    { id: 'this-month', label: 'This Month' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'last-3-months', label: 'Last 3 Months' },
    { id: 'this-year', label: 'This Year' },
    { id: 'all-time', label: 'All Time' },
  ];

  const currentPeriodLabel =
    periodOptions.find((p) => p.id === dateFilter.period)?.label || 'Date Range';

  const tabBreadcrumbs: Record<string, string> = {
    overview: 'Financial Overview',
    transactions: 'Ledger & Transactions',
    analytics: 'Analytics & Archetypes',
    budgets: 'Budgets & Pacing',
    goals: 'Savings Goals & Milestones',
    coach: 'AI Money Coach',
    settings: 'Settings & Workspace',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090d16]/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/70 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle & Breadcrumb Trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
          <span className="text-slate-400 hidden sm:inline">MoneyMuse</span>
          <span className="text-slate-500 hidden sm:inline">/</span>
          <h1 className="font-semibold text-white text-sm sm:text-base tracking-tight truncate">
            {tabBreadcrumbs[activeTab] || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Zone 2 & 3: Controls & Primary Action */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search Input */}
        <div className="relative hidden md:block w-44 lg:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/70 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Date Filter Segmented Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800/80 text-slate-200 border border-slate-800 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-violet-400" />
            <span className="whitespace-nowrap">{currentPeriodLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isDateDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsDateDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
                {periodOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDatePeriod(opt.id);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                      dateFilter.period === opt.id
                        ? 'text-violet-400 font-semibold bg-violet-950/20'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {dateFilter.period === opt.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 hover:bg-slate-800/80 transition-colors cursor-pointer"
          title={`Switch to ${preferences.theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle visual theme"
        >
          {preferences.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-violet-400" />
          )}
        </button>

        {/* AI Quick Shortcut */}
        <button
          type="button"
          onClick={() => setActiveTab('coach')}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-violet-300 bg-violet-950/40 hover:bg-violet-900/50 border border-violet-700/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Open AI Money Coach"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden sm:inline">Coach</span>
        </button>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};
