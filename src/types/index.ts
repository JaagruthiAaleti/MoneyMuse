export type TransactionType = 'expense' | 'income' | 'transfer';

export type PaymentMethod =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Cash'
  | 'Net Banking'
  | 'Wallet';

export interface Transaction {
  id: string;
  title: string;
  amount: number; // in standard currency units (e.g. INR or USD)
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  accountId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string;
  type: 'expense' | 'income';
  isEssential?: boolean; // Essential (Needs) vs Discretionary (Wants)
  isFixed?: boolean; // Fixed (Rent, Subscriptions) vs Variable (Dining, Shopping)
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  limit: number;
  period: 'monthly' | 'weekly';
  alertThreshold: number; // e.g. 80 for 80%
  isActive: boolean;
}

export interface GoalContribution {
  id: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdrawal';
  note?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  categoryIcon: string;
  color: string;
  contributions: GoalContribution[];
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'credit' | 'wallet' | 'cash';
  balance: number;
  accountNumber?: string;
  color: string;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'SGD';

export interface UserPreferences {
  displayName: string;
  currency: CurrencyCode;
  currencySymbol: string;
  theme: 'dark' | 'light';
  monthStartDay: number; // 1-28
  isDemoMode: boolean;
  monthlyIncomeTarget?: number;
}

export type DatePeriod =
  | 'this-week'
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'this-year'
  | 'all-time'
  | 'custom';

export interface DateFilterRange {
  period: DatePeriod;
  startDate?: string;
  endDate?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // Percentage 0-100
  prevPeriod: {
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
    incomeChangePercent: number;
    expenseChangePercent: number;
    savingsRateChangePercent: number;
  };
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  isEssential?: boolean;
  isFixed?: boolean;
}

export interface DailyCashFlow {
  date: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  cumulativeNet?: number;
  transactionCount?: number;
}

export interface MonthlyCashFlow {
  monthKey: string; // YYYY-MM
  label: string;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
}

export interface FiftyThirtyTwentyResult {
  totalIncome: number;
  totalExpense: number;
  needs: {
    actual: number;
    actualPct: number;
    targetPct: 50;
    targetAmount: number;
    delta: number;
  };
  wants: {
    actual: number;
    actualPct: number;
    targetPct: 30;
    targetAmount: number;
    delta: number;
  };
  savings: {
    actual: number;
    actualPct: number;
    targetPct: 20;
    targetAmount: number;
    delta: number;
  };
  healthStatus: 'healthy' | 'caution' | 'alert';
  headline: string;
  advice: string;
}

export interface MerchantAnalytics {
  name: string;
  amount: number;
  count: number;
  averageTicket: number;
  percentageOfSpend: number;
  categoryName: string;
  categoryColor: string;
  latestDate: string;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini-3.8-flash' | 'deterministic-rules';
  suggestedPrompts?: string[];
}
