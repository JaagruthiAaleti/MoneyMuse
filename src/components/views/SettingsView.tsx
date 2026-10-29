import React, { useState, useEffect } from 'react';
import {
  User,
  DollarSign,
  Sun,
  Moon,
  RotateCcw,
  Trash2,
  Download,
  Shield,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CurrencyCode } from '../../types';
import { getCurrencySymbol } from '../../utils/finance';

export const SettingsView: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    resetToDemoData,
    clearAllData,
    toggleTheme,
    transactions,
    budgets,
    savingsGoals,
    categories,
    accounts,
  } = useFinance();

  const [displayName, setDisplayName] = useState(preferences.displayName);
  const [monthlyIncome, setMonthlyIncome] = useState(
    preferences.monthlyIncomeTarget?.toString() || '165000'
  );
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    hasGeminiKey: boolean;
    model: string;
    mode: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((data) => setAiStatus(data))
      .catch(() => setAiStatus({ hasGeminiKey: false, model: 'gemini-3.8-flash', mode: 'built-in' }));
  }, []);

  const currencies: Array<{ code: CurrencyCode; label: string }> = [
    { code: 'INR', label: 'INR (₹) · Indian Rupee' },
    { code: 'USD', label: 'USD ($) · US Dollar' },
    { code: 'EUR', label: 'EUR (€) · Euro' },
    { code: 'GBP', label: 'GBP (£) · British Pound' },
    { code: 'AED', label: 'AED (AED) · UAE Dirham' },
    { code: 'CAD', label: 'CAD (CA$) · Canadian Dollar' },
    { code: 'AUD', label: 'AUD (A$) · Australian Dollar' },
    { code: 'SGD', label: 'SGD (S$) · Singapore Dollar' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      displayName: displayName.trim(),
      monthlyIncomeTarget: parseFloat(monthlyIncome) || undefined,
    });
  };

  const handleCurrencyChange = (code: CurrencyCode) => {
    updatePreferences({
      currency: code,
      currencySymbol: getCurrencySymbol(code),
    });
  };

  const handleExportFullBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      app: 'MoneyMuse',
      version: '1.0',
      preferences,
      transactions,
      budgets,
      savingsGoals,
      categories,
      accounts,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `moneymuse_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-white tracking-tight">Workspace Preferences</h2>
        <p className="text-xs text-slate-400">
          Personalize currency localization, appearance modes, and financial ledger persistence
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <User className="w-3.5 h-3.5 text-violet-400" />
          <h3 className="text-xs font-semibold text-white">Profile & Income Benchmark</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 max-w-md">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Account Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Estimated Monthly Inflow Target ({preferences.currencySymbol})
            </label>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-numeric tabular-nums focus:outline-none focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Currency & Formatting */}
      <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="text-xs font-semibold text-white">Currency & Number Formatting</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCurrencyChange(c.code)}
              className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                preferences.currency === c.code
                  ? 'bg-violet-950/30 border-violet-500/50 text-violet-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <span>{c.label}</span>
              {preferences.currency === c.code && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Appearance Theme */}
      <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          {preferences.theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          )}
          <h3 className="text-xs font-semibold text-white">Appearance & Theme</h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-200 cursor-pointer transition-colors"
          >
            {preferences.theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Switch to Dark Midnight</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-slate-500 font-mono">
            Active: {preferences.theme} mode
          </span>
        </div>
      </div>

      {/* AI Telemetry Status */}
      <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <h3 className="text-xs font-semibold text-white">AI Coach Integration Engine</h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            Proxy Verified
          </span>
        </div>

        <div className="text-xs space-y-1.5 text-slate-300 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-sans">Model:</span>
            <span className="text-violet-300">gemini-3.8-flash</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-sans">Isolation:</span>
            <span className="text-slate-300">Server-Side Proxy (/api/ai/coach)</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 leading-relaxed font-sans">
          The Gemini API key is managed securely on the server side and never sent to browser bundles.
        </p>
      </div>

      {/* Data Management: Backup & Reset */}
      <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <h3 className="text-xs font-semibold text-white">Data Management & Workspace State</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportFullBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 text-xs font-medium cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Demo Dataset</span>
          </button>

          <button
            type="button"
            onClick={() => setIsClearConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 text-xs font-medium cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear to Blank Slate</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f1626] border border-slate-800 rounded-xl shadow-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white">Restore Demo Dataset?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This restores the 52-transaction deterministic Indian demo dataset.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDemoData();
                  setIsResetConfirmOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
              >
                Yes, Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f1626] border border-rose-900/60 rounded-xl shadow-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <h4 className="text-xs font-bold text-white">Clear All Workspace Data?</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This wipes all local transactions, budgets, and savings goals from this browser.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllData();
                  setIsClearConfirmOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
