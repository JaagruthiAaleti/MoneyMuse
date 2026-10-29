import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_BUDGETS,
  DEFAULT_CATEGORIES,
  DEFAULT_PREFERENCES,
  DEFAULT_SAVINGS_GOALS,
  DEMO_TRANSACTIONS,
} from '../data/demoData';
import {
  Account,
  Budget,
  Category,
  CategorySpending,
  CoachMessage,
  DailyCashFlow,
  DateFilterRange,
  DatePeriod,
  FiftyThirtyTwentyResult,
  FinancialSummary,
  MerchantAnalytics,
  MonthlyCashFlow,
  SavingsGoal,
  Transaction,
  UserPreferences,
} from '../types';
import {
  calculate50_30_20Analysis,
  calculateCalendarHeatmap,
  calculateCategorySpending,
  calculateFinancialSummary,
  calculateIncomeCategorySpending,
  calculateMerchantAnalytics,
  calculateSpendingArchetypes,
  deriveFinancialInsights,
  generateDailyCashFlow,
  generateMonthlyComparison,
  getDateRangeFromPeriod,
  getPreviousEquivalentPeriod,
} from '../utils/finance';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info';
  onUndo?: () => void;
  undoLabel?: string;
}

interface FinanceContextType {
  // State
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  accounts: Account[];
  preferences: UserPreferences;
  dateFilter: DateFilterRange;
  searchQuery: string;
  activeTab: string;
  coachMessages: CoachMessage[];
  isCoachTyping: boolean;
  toasts: ToastItem[];

  // Computed
  currentDateRange: { start: string; end: string };
  prevDateRange: { start: string; end: string };
  financialSummary: FinancialSummary;
  categorySpending: CategorySpending[];
  incomeCategorySpending: CategorySpending[];
  spendingArchetypes: ReturnType<typeof calculateSpendingArchetypes>;
  dailyCashFlow: DailyCashFlow[];
  monthlyComparison: MonthlyCashFlow[];
  calendarHeatmap: ReturnType<typeof calculateCalendarHeatmap>;
  fiftyThirtyTwenty: FiftyThirtyTwentyResult;
  merchantAnalytics: MerchantAnalytics[];
  insights: ReturnType<typeof deriveFinancialInsights>;
  filteredTransactions: Transaction[];

  // Actions
  setActiveTab: (tab: string) => void;
  setDatePeriod: (period: DatePeriod, startDate?: string, endDate?: string) => void;
  setSearchQuery: (query: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  undoLastDelete: () => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'contributions'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, type: 'deposit' | 'withdrawal', note?: string) => void;
  importTransactions: (newTxs: Transaction[]) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  toggleTheme: () => void;
  sendCoachMessage: (text: string) => Promise<void>;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'moneymuse_financial_store_v1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage or defaults
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_prefs`);
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_txs`);
      return saved ? JSON.parse(saved) : DEMO_TRANSACTIONS;
    } catch {
      return DEMO_TRANSACTIONS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cats`);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_budgets`);
      return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
    } catch {
      return DEFAULT_BUDGETS;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_goals`);
      return saved ? JSON.parse(saved) : DEFAULT_SAVINGS_GOALS;
    } catch {
      return DEFAULT_SAVINGS_GOALS;
    }
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
      return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  });

  const [dateFilter, setDateFilter] = useState<DateFilterRange>({
    period: 'this-month',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [lastDeletedTx, setLastDeletedTx] = useState<Transaction | null>(null);

  // Coach Chat State
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([
    {
      id: 'welcome-coach',
      role: 'assistant',
      content: `Welcome to **MoneyMuse AI Money Coach**! I am here to analyze your finances, examine your cash flow, identify spending patterns, and help you reach your savings targets faster.\n\nAsk me anything or pick a quick prompt below:`,
      timestamp: '10:00 AM',
      suggestedPrompts: [
        'Where did most of my money go this month?',
        'How can I boost my savings rate?',
        'Are any of my budgets nearing their limit?',
        'Give me a 3-step action plan to optimize expenses',
      ],
    },
  ]);
  const [isCoachTyping, setIsCoachTyping] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_prefs`, JSON.stringify(preferences));
      localStorage.setItem(`${STORAGE_KEY}_txs`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_cats`, JSON.stringify(categories));
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
      localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(savingsGoals));
      localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [preferences, transactions, categories, budgets, savingsGoals, accounts]);

  // Sync Dark/Light theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [preferences.theme]);

  // Toast Helpers
  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Date range computations (reference: October 28, 2026)
  const currentDateRange = useMemo(
    () => getDateRangeFromPeriod(dateFilter, '2026-10-28'),
    [dateFilter]
  );

  const prevDateRange = useMemo(
    () => getPreviousEquivalentPeriod(dateFilter.period, '2026-10-28'),
    [dateFilter.period]
  );

  // Filtered transactions for current view & search query
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Period filter
      if (t.date < currentDateRange.start || t.date > currentDateRange.end) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesCategory = t.categoryName.toLowerCase().includes(query);
        const matchesNotes = t.notes?.toLowerCase().includes(query) || false;
        const matchesTags = t.tags?.some((tag) => tag.toLowerCase().includes(query)) || false;
        if (!matchesTitle && !matchesCategory && !matchesNotes && !matchesTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, currentDateRange, searchQuery]);

  // Derived Analytics (deterministic)
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(transactions, currentDateRange, prevDateRange);
  }, [transactions, currentDateRange, prevDateRange]);

  const categorySpending = useMemo(() => {
    const periodTxs = transactions.filter(
      (t) => t.date >= currentDateRange.start && t.date <= currentDateRange.end
    );
    return calculateCategorySpending(periodTxs, categories);
  }, [transactions, currentDateRange, categories]);

  const incomeCategorySpending = useMemo(() => {
    const periodTxs = transactions.filter(
      (t) => t.date >= currentDateRange.start && t.date <= currentDateRange.end
    );
    return calculateIncomeCategorySpending(periodTxs, categories);
  }, [transactions, currentDateRange, categories]);

  const spendingArchetypes = useMemo(() => {
    return calculateSpendingArchetypes(categorySpending);
  }, [categorySpending]);

  const dailyCashFlow = useMemo(() => {
    return generateDailyCashFlow(transactions, currentDateRange.start, currentDateRange.end);
  }, [transactions, currentDateRange]);

  const monthlyComparison = useMemo(() => {
    return generateMonthlyComparison(transactions, 6, '2026-10-28');
  }, [transactions]);

  const calendarHeatmap = useMemo(() => {
    return calculateCalendarHeatmap(transactions, currentDateRange.start, currentDateRange.end);
  }, [transactions, currentDateRange]);

  const fiftyThirtyTwenty = useMemo(() => {
    return calculate50_30_20Analysis(financialSummary.totalIncome, spendingArchetypes);
  }, [financialSummary.totalIncome, spendingArchetypes]);

  const merchantAnalytics = useMemo(() => {
    const periodTxs = transactions.filter(
      (t) => t.date >= currentDateRange.start && t.date <= currentDateRange.end
    );
    return calculateMerchantAnalytics(periodTxs, 8);
  }, [transactions, currentDateRange]);

  const insights = useMemo(() => {
    return deriveFinancialInsights(financialSummary, categorySpending, budgets, preferences.currency);
  }, [financialSummary, categorySpending, budgets, preferences.currency]);

  // Actions
  const setDatePeriod = (period: DatePeriod, startDate?: string, endDate?: string) => {
    setDateFilter({ period, startDate, endDate });
  };

  const addTransaction = (txData: Omit<Transaction, 'id'>): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // If associated with an account, adjust account balance
    if (newTx.accountId) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === newTx.accountId) {
            const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
            return { ...acc, balance: acc.balance + delta };
          }
          return acc;
        })
      );
    }

    addToast({
      title: 'Transaction added successfully',
      message: `${newTx.title} - ${preferences.currencySymbol}${newTx.amount.toLocaleString()}`,
      type: 'success',
    });

    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    addToast({
      title: 'Transaction updated',
      type: 'success',
    });
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    setLastDeletedTx(target);
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    addToast({
      title: 'Transaction deleted',
      message: `${target.title} removed`,
      type: 'info',
      undoLabel: 'Undo',
      onUndo: () => {
        undoLastDelete();
      },
    });
  };

  const undoLastDelete = () => {
    if (lastDeletedTx) {
      setTransactions((prev) => [lastDeletedTx, ...prev]);
      addToast({
        title: 'Transaction restored',
        message: `${lastDeletedTx.title} has been restored`,
        type: 'success',
      });
      setLastDeletedTx(null);
    }
  };

  const addBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `b-${Date.now()}`,
    };
    setBudgets((prev) => [...prev, newBudget]);
    addToast({
      title: 'Budget created',
      message: `${newBudget.categoryName} budget set to ${preferences.currencySymbol}${newBudget.limit.toLocaleString()}`,
      type: 'success',
    });
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    addToast({
      title: 'Budget updated',
      type: 'success',
    });
  };

  const deleteBudget = (id: string) => {
    const b = budgets.find((item) => item.id === id);
    setBudgets((prev) => prev.filter((item) => item.id !== id));
    addToast({
      title: 'Budget removed',
      message: b ? `${b.categoryName} budget deleted` : undefined,
      type: 'info',
    });
  };

  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id' | 'currentAmount' | 'contributions'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
      contributions: [],
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    addToast({
      title: 'Goal created',
      message: `"${newGoal.name}" target set to ${preferences.currencySymbol}${newGoal.targetAmount.toLocaleString()}`,
      type: 'success',
    });
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    addToast({
      title: 'Savings goal updated',
      type: 'success',
    });
  };

  const deleteSavingsGoal = (id: string) => {
    const g = savingsGoals.find((goal) => goal.id === id);
    setSavingsGoals((prev) => prev.filter((goal) => goal.id !== id));
    addToast({
      title: 'Savings goal removed',
      message: g ? `Goal "${g.name}" deleted` : undefined,
      type: 'info',
    });
  };

  const contributeToGoal = (
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdrawal',
    note?: string
  ) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const delta = type === 'deposit' ? amount : -amount;
    const newCurrent = Math.max(0, goal.currentAmount + delta);

    const contribution = {
      id: `gc-${Date.now()}`,
      amount,
      date: new Date().toISOString().slice(0, 10),
      type,
      note,
    };

    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: newCurrent,
              contributions: [contribution, ...g.contributions],
            }
          : g
      )
    );

    addToast({
      title: type === 'deposit' ? 'Savings Contribution Recorded' : 'Goal Withdrawal Recorded',
      message: `${preferences.currencySymbol}${amount.toLocaleString()} ${type === 'deposit' ? 'added to' : 'withdrawn from'} ${goal.name}`,
      type: 'success',
    });
  };

  const importTransactions = (newTxs: Transaction[]) => {
    setTransactions((prev) => [...newTxs, ...prev]);
    addToast({
      title: 'Import Successful',
      message: `Added ${newTxs.length} transactions to your workspace.`,
      type: 'success',
    });
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
    addToast({
      title: 'Preferences saved',
      type: 'success',
    });
  };

  const toggleTheme = () => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const resetToDemoData = () => {
    setTransactions(DEMO_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets(DEFAULT_BUDGETS);
    setSavingsGoals(DEFAULT_SAVINGS_GOALS);
    setAccounts(DEFAULT_ACCOUNTS);
    setPreferences(DEFAULT_PREFERENCES);
    addToast({
      title: 'Demo workspace reset',
      message: 'Restored realistic 52-transaction dataset and baseline budgets.',
      type: 'info',
    });
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setPreferences((prev) => ({ ...prev, isDemoMode: false }));
    addToast({
      title: 'Workspace cleared',
      message: 'All transactions, budgets, and goals have been reset to a fresh blank slate.',
      type: 'info',
    });
  };

  // Conversational AI Coach interaction (Server-Side Proxy)
  const sendCoachMessage = async (text: string) => {
    const userMsg: CoachMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCoachMessages((prev) => [...prev, userMsg]);
    setIsCoachTyping(true);

    // Prepare structured, privacy-conscious summary to send to server endpoint
    const financialContext = {
      currency: preferences.currency,
      currencySymbol: preferences.currencySymbol,
      totalIncome: financialSummary.totalIncome,
      totalExpenses: financialSummary.totalExpenses,
      netSavings: financialSummary.netSavings,
      savingsRate: financialSummary.savingsRate,
      topCategories: categorySpending.slice(0, 5).map((c) => ({
        name: c.categoryName,
        amount: c.amount,
        percentage: c.percentage,
      })),
      overBudgetCategories: budgets
        .map((b) => {
          const spend = categorySpending.find((c) => c.categoryId === b.categoryId)?.amount || 0;
          return {
            name: b.categoryName,
            spent: spend,
            limit: b.limit,
            percentUsed: Math.round((spend / b.limit) * 100),
          };
        })
        .filter((b) => b.percentUsed >= 80),
      savingsGoals: savingsGoals.map((g) => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
      })),
      recentTransactions: transactions.slice(0, 8).map((t) => ({
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.categoryName,
        date: t.date,
      })),
    };

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: coachMessages,
          financialContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: CoachMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setCoachMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error calling /api/ai/coach:', err);
      // Fallback response
      const fallbackMsg: CoachMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `I've analyzed your local data! Your savings rate for this period is **${financialSummary.savingsRate}%** with total expenses of **${preferences.currencySymbol}${financialSummary.totalExpenses.toLocaleString()}**. Keep up the steady contributions to your **${savingsGoals[0]?.name || 'savings goals'}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'deterministic-rules',
      };
      setCoachMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsCoachTyping(false);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        savingsGoals,
        accounts,
        preferences,
        dateFilter,
        searchQuery,
        activeTab,
        coachMessages,
        isCoachTyping,
        toasts,
        currentDateRange,
        prevDateRange,
        financialSummary,
        categorySpending,
        incomeCategorySpending,
        spendingArchetypes,
        dailyCashFlow,
        monthlyComparison,
        calendarHeatmap,
        fiftyThirtyTwenty,
        merchantAnalytics,
        insights,
        filteredTransactions,
        setActiveTab,
        setDatePeriod,
        setSearchQuery,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        undoLastDelete,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        importTransactions,
        updatePreferences,
        resetToDemoData,
        clearAllData,
        toggleTheme,
        sendCoachMessage,
        addToast,
        removeToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
