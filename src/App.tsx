/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { TransactionModal } from './components/transactions/TransactionModal';
import { OverviewView } from './components/views/OverviewView';
import { TransactionsView } from './components/views/TransactionsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { BudgetsView } from './components/views/BudgetsView';
import { SavingsGoalsView } from './components/views/SavingsGoalsView';
import { MoneyCoachView } from './components/coach/MoneyCoachView';
import { SettingsView } from './components/views/SettingsView';
import { Plus } from 'lucide-react';

function AppContent() {
  const { activeTab, preferences } = useFinance();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d16] dark:bg-[#090d16] text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
        />

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {activeTab === 'overview' && (
            <OverviewView onOpenAddTransaction={() => setIsAddTransactionOpen(true)} />
          )}
          {activeTab === 'transactions' && (
            <TransactionsView onOpenAddTransaction={() => setIsAddTransactionOpen(true)} />
          )}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'budgets' && <BudgetsView />}
          {activeTab === 'goals' && <SavingsGoalsView />}
          {activeTab === 'coach' && <MoneyCoachView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 lg:hidden z-30">
        <button
          type="button"
          onClick={() => setIsAddTransactionOpen(true)}
          className="w-13 h-13 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-600/40 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          aria-label="Add transaction"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Global Add/Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
