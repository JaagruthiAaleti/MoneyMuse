import {
  Account,
  Budget,
  Category,
  CategorySpending,
  CurrencyCode,
  DailyCashFlow,
  DateFilterRange,
  DatePeriod,
  FiftyThirtyTwentyResult,
  FinancialSummary,
  MerchantAnalytics,
  MonthlyCashFlow,
  SavingsGoal,
  Transaction,
} from '../types';

/**
 * Format currency with appropriate locale rules.
 * Uses Indian numbering format (e.g., ₹1,25,000) for INR and standard grouping for others.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  hideDecimals = true
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = '';
  if (currency === 'INR') {
    // Format with Indian numbering system (Lakhs / Crores)
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: hideDecimals ? 0 : 2,
      minimumFractionDigits: hideDecimals ? 0 : 2,
    };
    formatted = new Intl.NumberFormat('en-IN', options).format(absAmount);
  } else {
    const localeMap: Record<CurrencyCode, string> = {
      INR: 'en-IN',
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      AED: 'en-AE',
      CAD: 'en-CA',
      AUD: 'en-AU',
      SGD: 'en-SG',
    };
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      maximumFractionDigits: hideDecimals ? 0 : 2,
      minimumFractionDigits: hideDecimals ? 0 : 2,
    };
    formatted = new Intl.NumberFormat(localeMap[currency] || 'en-US', options).format(absAmount);
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Compact currency for charts or tiny tags (e.g., ₹1.4L or $14.5k)
 */
export function formatCompactCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const symbol = getCurrencySymbol(currency);

  if (currency === 'INR') {
    if (abs >= 10000000) {
      return `${isNegative ? '-' : ''}${symbol}${(abs / 10000000).toFixed(1)}Cr`;
    }
    if (abs >= 100000) {
      return `${isNegative ? '-' : ''}${symbol}${(abs / 100000).toFixed(1)}L`;
    }
    if (abs >= 1000) {
      return `${isNegative ? '-' : ''}${symbol}${(abs / 1000).toFixed(0)}k`;
    }
    return `${isNegative ? '-' : ''}${symbol}${abs}`;
  }

  if (abs >= 1000000) {
    return `${isNegative ? '-' : ''}${symbol}${(abs / 1000000).toFixed(1)}M`;
  }
  if (abs >= 1000) {
    return `${isNegative ? '-' : ''}${symbol}${(abs / 1000).toFixed(0)}k`;
  }
  return `${isNegative ? '-' : ''}${symbol}${abs}`;
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  const map: Record<CurrencyCode, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED ',
    CAD: 'CA$',
    AUD: 'A$',
    SGD: 'S$',
  };
  return map[currency] || '₹';
}

/**
 * Calculate Start and End ISO strings for a given DatePeriod.
 * In our environment, reference date is October 2026.
 */
export function getDateRangeFromPeriod(
  filter: DateFilterRange,
  referenceDateStr = '2026-10-28'
): { start: string; end: string } {
  if (filter.period === 'custom' && filter.startDate && filter.endDate) {
    return { start: filter.startDate, end: filter.endDate };
  }

  const ref = new Date(referenceDateStr);
  const year = ref.getFullYear();
  const month = ref.getMonth(); // 0-indexed (9 for Oct)
  const day = ref.getDate();

  switch (filter.period) {
    case 'this-week': {
      const dayOfWeek = ref.getDay(); // 0 is Sun
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(year, month, day + diffToMonday);
      const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
      return {
        start: monday.toISOString().slice(0, 10),
        end: sunday.toISOString().slice(0, 10),
      };
    }
    case 'this-month': {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      };
    }
    case 'last-month': {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      };
    }
    case 'last-3-months': {
      const start = new Date(year, month - 2, 1);
      const end = new Date(year, month + 1, 0);
      return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      };
    }
    case 'this-year': {
      return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
      };
    }
    case 'all-time':
    default: {
      return {
        start: '2020-01-01',
        end: '2030-12-31',
      };
    }
  }
}

/**
 * Calculate the previous comparative period of identical length for trend comparisons.
 */
export function getPreviousEquivalentPeriod(
  period: DatePeriod,
  referenceDateStr = '2026-10-28'
): { start: string; end: string } {
  const ref = new Date(referenceDateStr);
  const year = ref.getFullYear();
  const month = ref.getMonth();

  if (period === 'this-month') {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }

  if (period === 'last-month') {
    const start = new Date(year, month - 2, 1);
    const end = new Date(year, month - 1, 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }

  if (period === 'last-3-months') {
    const start = new Date(year, month - 5, 1);
    const end = new Date(year, month - 2, 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }

  if (period === 'this-year') {
    return { start: `${year - 1}-01-01`, end: `${year - 1}-12-31` };
  }

  // Fallback: previous 30 days
  const prevEnd = new Date(ref.getTime() - 30 * 24 * 60 * 60 * 1000);
  const prevStart = new Date(prevEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    start: prevStart.toISOString().slice(0, 10),
    end: prevEnd.toISOString().slice(0, 10),
  };
}

/**
 * Filter transactions by date interval [start, end]
 */
export function filterTransactionsByDate(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] {
  return transactions.filter((t) => t.date >= startDate && t.date <= endDate);
}

/**
 * Calculate Financial Summary (Income, Expenses, Savings Rate, and Previous Period delta)
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  currentPeriodRange: { start: string; end: string },
  prevPeriodRange: { start: string; end: string },
  accounts?: Account[],
  openingCashBalance = 450000
): FinancialSummary {
  const currentTxs = filterTransactionsByDate(transactions, currentPeriodRange.start, currentPeriodRange.end);
  const prevTxs = filterTransactionsByDate(transactions, prevPeriodRange.start, prevPeriodRange.end);

  const totalIncome = currentTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((Math.max(0, netSavings) / totalIncome) * 100) : 0;

  // Previous period metrics
  const prevIncome = prevTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const prevExpenses = prevTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const prevSavings = prevIncome - prevExpenses;
  const prevSavingsRate = prevIncome > 0 ? Math.round((Math.max(0, prevSavings) / prevIncome) * 100) : 0;

  const incomeChangePercent = prevIncome > 0
    ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100)
    : 0;

  const expenseChangePercent = prevExpenses > 0
    ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100)
    : 0;

  const savingsRateChangePercent = savingsRate - prevSavingsRate;

  // Reconcile total liquid reserves with verified accounts
  let totalBalance = 0;
  if (accounts && accounts.length > 0) {
    totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  } else {
    const allTimeIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const allTimeExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    totalBalance = openingCashBalance + allTimeIncome - allTimeExpenses;
  }

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    prevPeriod: {
      totalIncome: prevIncome,
      totalExpenses: prevExpenses,
      savingsRate: prevSavingsRate,
      incomeChangePercent,
      expenseChangePercent,
      savingsRateChangePercent,
    },
  };
}

/**
 * Calculate category spending breakdown with percentage and transaction counts
 */
export function calculateCategorySpending(
  transactions: Transaction[],
  categories: Category[]
): CategorySpending[] {
  const expenseTxs = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  const catMap = new Map<string, { amount: number; count: number }>();
  for (const t of expenseTxs) {
    const existing = catMap.get(t.categoryId) || { amount: 0, count: 0 };
    catMap.set(t.categoryId, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    });
  }

  const results: CategorySpending[] = [];
  catMap.forEach((val, catId) => {
    const cat = categories.find((c) => c.id === catId);
    if (val.amount > 0) {
      results.push({
        categoryId: catId,
        categoryName: cat?.name || 'Other',
        categoryColor: cat?.color || '#94A3B8',
        categoryIcon: cat?.icon || 'Tag',
        amount: val.amount,
        percentage: totalExpense > 0 ? Math.round((val.amount / totalExpense) * 100) : 0,
        transactionCount: val.count,
        isEssential: cat?.isEssential,
        isFixed: cat?.isFixed,
      });
    }
  });

  return results.sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate income category breakdown with percentage and transaction counts
 */
export function calculateIncomeCategorySpending(
  transactions: Transaction[],
  categories: Category[]
): CategorySpending[] {
  const incomeTxs = transactions.filter((t) => t.type === 'income');
  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);

  const catMap = new Map<string, { amount: number; count: number }>();
  for (const t of incomeTxs) {
    const existing = catMap.get(t.categoryId) || { amount: 0, count: 0 };
    catMap.set(t.categoryId, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    });
  }

  const results: CategorySpending[] = [];
  catMap.forEach((val, catId) => {
    const cat = categories.find((c) => c.id === catId);
    if (val.amount > 0) {
      results.push({
        categoryId: catId,
        categoryName: cat?.name || tTitleFallback(catId),
        categoryColor: cat?.color || '#22d3ee',
        categoryIcon: cat?.icon || 'TrendingUp',
        amount: val.amount,
        percentage: totalIncome > 0 ? Math.round((val.amount / totalIncome) * 100) : 0,
        transactionCount: val.count,
        isEssential: true,
        isFixed: true,
      });
    }
  });

  return results.sort((a, b) => b.amount - a.amount);
}

function tTitleFallback(id: string): string {
  if (id.includes('salary')) return 'Tech Salary';
  if (id.includes('freelance')) return 'Freelance / Consulting';
  if (id.includes('invest') || id.includes('dividend')) return 'Dividends & Returns';
  if (id.includes('refund')) return 'Reimbursements';
  return 'Income Source';
}

/**
 * Calculate Fixed vs Variable and Essential vs Discretionary splits
 */
export function calculateSpendingArchetypes(
  categorySpending: CategorySpending[]
): {
  essential: number;
  discretionary: number;
  fixed: number;
  variable: number;
  total: number;
} {
  let essential = 0;
  let discretionary = 0;
  let fixed = 0;
  let variable = 0;
  let total = 0;

  for (const item of categorySpending) {
    total += item.amount;
    if (item.isEssential) {
      essential += item.amount;
    } else {
      discretionary += item.amount;
    }

    if (item.isFixed) {
      fixed += item.amount;
    } else {
      variable += item.amount;
    }
  }

  return { essential, discretionary, fixed, variable, total };
}

/**
 * Generate Cash Flow series for area charts (grouped by day within the period)
 */
export function generateDailyCashFlow(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): DailyCashFlow[] {
  const dayMap = new Map<string, { income: number; expense: number; count: number }>();

  // Initialize all dates in range to avoid broken lines
  const start = new Date(startDate);
  const end = new Date(endDate);
  const curr = new Date(start);

  while (curr <= end) {
    const dateKey = curr.toISOString().slice(0, 10);
    dayMap.set(dateKey, { income: 0, expense: 0, count: 0 });
    curr.setDate(curr.getDate() + 1);
  }

  // Populate from transactions
  for (const t of transactions) {
    if (dayMap.has(t.date)) {
      const entry = dayMap.get(t.date)!;
      if (t.type === 'income') entry.income += t.amount;
      if (t.type === 'expense') entry.expense += t.amount;
      entry.count += 1;
    }
  }

  const sortedDates = Array.from(dayMap.keys()).sort();
  let runningNet = 0;
  const results: DailyCashFlow[] = [];

  for (const date of sortedDates) {
    const val = dayMap.get(date)!;
    const net = val.income - val.expense;
    runningNet += net;
    const d = new Date(date);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    results.push({
      date,
      label,
      income: val.income,
      expense: val.expense,
      net,
      cumulativeNet: runningNet,
      transactionCount: val.count,
    });
  }

  return results;
}

export interface AdaptiveCashFlowResult {
  points: DailyCashFlow[];
  granularity: 'daily' | 'weekly' | 'monthly';
  totalIncome: number;
  totalExpense: number;
  netSurplus: number;
  peakExpensePoint: DailyCashFlow | null;
  peakIncomePoint: DailyCashFlow | null;
  averageBucketExpense: number;
}

/**
 * Generate adaptive Cash Flow series with automatic or user-selected bucketing
 * (Daily for < 35 days, Weekly for 36-120 days, Monthly for > 120 days)
 */
export function generateAdaptiveCashFlow(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
  forcedGranularity?: 'auto' | 'daily' | 'weekly' | 'monthly'
): AdaptiveCashFlowResult {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daySpan = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  let granularity: 'daily' | 'weekly' | 'monthly' = 'daily';
  if (forcedGranularity && forcedGranularity !== 'auto') {
    granularity = forcedGranularity;
  } else {
    if (daySpan > 120) granularity = 'monthly';
    else if (daySpan > 35) granularity = 'weekly';
    else granularity = 'daily';
  }

  // Filter in range
  const rangeTxs = transactions.filter((t) => t.date >= startDate && t.date <= endDate);

  if (granularity === 'daily') {
    const dailyPoints = generateDailyCashFlow(rangeTxs, startDate, endDate);
    const totalIncome = dailyPoints.reduce((sum, p) => sum + p.income, 0);
    const totalExpense = dailyPoints.reduce((sum, p) => sum + p.expense, 0);
    const peakExpensePoint = [...dailyPoints].sort((a, b) => b.expense - a.expense)[0] || null;
    const peakIncomePoint = [...dailyPoints].sort((a, b) => b.income - a.income)[0] || null;

    return {
      points: dailyPoints,
      granularity: 'daily',
      totalIncome,
      totalExpense,
      netSurplus: totalIncome - totalExpense,
      peakExpensePoint: peakExpensePoint && peakExpensePoint.expense > 0 ? peakExpensePoint : null,
      peakIncomePoint: peakIncomePoint && peakIncomePoint.income > 0 ? peakIncomePoint : null,
      averageBucketExpense: dailyPoints.length > 0 ? Math.round(totalExpense / dailyPoints.length) : 0,
    };
  }

  if (granularity === 'monthly') {
    // Group by YYYY-MM
    const monthMap = new Map<string, { income: number; expense: number; count: number }>();
    const curr = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (curr <= lastMonth) {
      const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, { income: 0, expense: 0, count: 0 });
      curr.setMonth(curr.getMonth() + 1);
    }

    for (const t of rangeTxs) {
      const key = t.date.slice(0, 7);
      if (monthMap.has(key)) {
        const item = monthMap.get(key)!;
        if (t.type === 'income') item.income += t.amount;
        if (t.type === 'expense') item.expense += t.amount;
        item.count += 1;
      }
    }

    const sortedKeys = Array.from(monthMap.keys()).sort();
    let runningNet = 0;
    const points: DailyCashFlow[] = [];

    for (const key of sortedKeys) {
      const val = monthMap.get(key)!;
      const net = val.income - val.expense;
      runningNet += net;
      const [year, month] = key.split('-');
      const d = new Date(Number(year), Number(month) - 1, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      points.push({
        date: `${key}-01`,
        label,
        income: val.income,
        expense: val.expense,
        net,
        cumulativeNet: runningNet,
        transactionCount: val.count,
      });
    }

    const totalIncome = points.reduce((sum, p) => sum + p.income, 0);
    const totalExpense = points.reduce((sum, p) => sum + p.expense, 0);
    const peakExpensePoint = [...points].sort((a, b) => b.expense - a.expense)[0] || null;
    const peakIncomePoint = [...points].sort((a, b) => b.income - a.income)[0] || null;

    return {
      points,
      granularity: 'monthly',
      totalIncome,
      totalExpense,
      netSurplus: totalIncome - totalExpense,
      peakExpensePoint: peakExpensePoint && peakExpensePoint.expense > 0 ? peakExpensePoint : null,
      peakIncomePoint: peakIncomePoint && peakIncomePoint.income > 0 ? peakIncomePoint : null,
      averageBucketExpense: points.length > 0 ? Math.round(totalExpense / points.length) : 0,
    };
  }

  // Weekly bucketing (7-day buckets)
  const points: DailyCashFlow[] = [];
  const curr = new Date(start);
  let runningNet = 0;

  while (curr <= end) {
    const bucketStart = new Date(curr);
    const bucketEnd = new Date(curr.getTime() + 6 * 24 * 60 * 60 * 1000);
    const effectiveEnd = bucketEnd > end ? end : bucketEnd;

    const startStr = bucketStart.toISOString().slice(0, 10);
    const endStr = effectiveEnd.toISOString().slice(0, 10);

    const bucketTxs = rangeTxs.filter((t) => t.date >= startStr && t.date <= endStr);
    const income = bucketTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = bucketTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const net = income - expense;
    runningNet += net;

    const label = `${bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    points.push({
      date: startStr,
      label,
      income,
      expense,
      net,
      cumulativeNet: runningNet,
      transactionCount: bucketTxs.length,
    });

    curr.setDate(curr.getDate() + 7);
  }

  const totalIncome = points.reduce((sum, p) => sum + p.income, 0);
  const totalExpense = points.reduce((sum, p) => sum + p.expense, 0);
  const peakExpensePoint = [...points].sort((a, b) => b.expense - a.expense)[0] || null;
  const peakIncomePoint = [...points].sort((a, b) => b.income - a.income)[0] || null;

  return {
    points,
    granularity: 'weekly',
    totalIncome,
    totalExpense,
    netSurplus: totalIncome - totalExpense,
    peakExpensePoint: peakExpensePoint && peakExpensePoint.expense > 0 ? peakExpensePoint : null,
    peakIncomePoint: peakIncomePoint && peakIncomePoint.income > 0 ? peakIncomePoint : null,
    averageBucketExpense: points.length > 0 ? Math.round(totalExpense / points.length) : 0,
  };
}

/**
 * Generate monthly bar comparison data for 6 or 12 months
 */
export function generateMonthlyComparison(
  transactions: Transaction[],
  monthsCount = 6,
  referenceDateStr = '2026-10-28'
): MonthlyCashFlow[] {
  const ref = new Date(referenceDateStr);
  const months: string[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(key);
  }

  return months.map((monthKey) => {
    const monthTxs = transactions.filter((t) => t.date.startsWith(monthKey));
    const income = monthTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const savings = Math.max(0, income - expense);
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

    const [year, month] = monthKey.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, 1);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    return {
      monthKey,
      label,
      income,
      expense,
      savings,
      savingsRate,
    };
  });
}

export interface CalendarDayCell {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  expense: number;
  income: number;
  transactionCount: number;
  isWeekend: boolean;
  isInRange: boolean;
}

export interface CalendarHeatmapResult {
  weeks: CalendarDayCell[][];
  maxDailyExpense: number;
  totalExpense: number;
  weekendExpense: number;
  weekdayExpense: number;
  weekendAverage: number;
  weekdayAverage: number;
  zeroSpendDays: number;
  totalDays: number;
}

/**
 * Computes calendar-aligned day matrix (Mon-Sun columns) with weekday vs weekend insights
 */
export function calculateCalendarHeatmap(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): CalendarHeatmapResult {
  const rangeTxs = transactions.filter((t) => t.date >= startDate && t.date <= endDate);

  const dayMap = new Map<string, { income: number; expense: number; count: number }>();
  for (const t of rangeTxs) {
    const existing = dayMap.get(t.date) || { income: 0, expense: 0, count: 0 };
    if (t.type === 'income') existing.income += t.amount;
    if (t.type === 'expense') existing.expense += t.amount;
    existing.count += 1;
    dayMap.set(t.date, existing);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Align start to the preceding Monday
  const startDayOfWeek = start.getDay(); // 0 is Sun
  const diffToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek;
  const calendarStart = new Date(start);
  calendarStart.setDate(start.getDate() + diffToMonday);

  // Align end to following Sunday
  const endDayOfWeek = end.getDay();
  const diffToSunday = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
  const calendarEnd = new Date(end);
  calendarEnd.setDate(end.getDate() + diffToSunday);

  const weeks: CalendarDayCell[][] = [];
  let currentWeek: CalendarDayCell[] = [];
  const curr = new Date(calendarStart);

  let maxDailyExpense = 0;
  let totalExpense = 0;
  let weekendExpense = 0;
  let weekdayExpense = 0;
  let weekendDays = 0;
  let weekdayDays = 0;
  let zeroSpendDays = 0;
  let totalRangeDays = 0;

  while (curr <= calendarEnd) {
    const dateStr = curr.toISOString().slice(0, 10);
    const isInRange = dateStr >= startDate && dateStr <= endDate;
    const dayOfWeek = curr.getDay(); // 0 is Sun, 6 is Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const data = dayMap.get(dateStr) || { income: 0, expense: 0, count: 0 };

    if (isInRange) {
      totalRangeDays += 1;
      totalExpense += data.expense;
      if (data.expense > maxDailyExpense) maxDailyExpense = data.expense;
      if (data.expense === 0) zeroSpendDays += 1;

      if (isWeekend) {
        weekendExpense += data.expense;
        weekendDays += 1;
      } else {
        weekdayExpense += data.expense;
        weekdayDays += 1;
      }
    }

    currentWeek.push({
      date: dateStr,
      dayOfMonth: curr.getDate(),
      dayOfWeek,
      expense: data.expense,
      income: data.income,
      transactionCount: data.count,
      isWeekend,
      isInRange,
    });

    // If Sunday, push week and start next
    if (dayOfWeek === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    curr.setDate(curr.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return {
    weeks,
    maxDailyExpense: maxDailyExpense || 1,
    totalExpense,
    weekendExpense,
    weekdayExpense,
    weekendAverage: weekendDays > 0 ? Math.round(weekendExpense / weekendDays) : 0,
    weekdayAverage: weekdayDays > 0 ? Math.round(weekdayExpense / weekdayDays) : 0,
    zeroSpendDays,
    totalDays: totalRangeDays,
  };
}

/**
 * Calculate 50/30/20 Rule compliance and structural recommendations
 */
export function calculate50_30_20Analysis(
  totalIncome: number,
  spendingArchetypes: {
    essential: number;
    discretionary: number;
    fixed: number;
    variable: number;
    total: number;
  }
): FiftyThirtyTwentyResult {
  const baseIncome = Math.max(totalIncome, spendingArchetypes.total);
  const actualNeeds = spendingArchetypes.essential;
  const actualWants = spendingArchetypes.discretionary;
  const actualSavings = Math.max(0, totalIncome - spendingArchetypes.total);

  const targetNeeds = Math.round(baseIncome * 0.5);
  const targetWants = Math.round(baseIncome * 0.3);
  const targetSavings = Math.round(baseIncome * 0.2);

  const needsPct = baseIncome > 0 ? Math.round((actualNeeds / baseIncome) * 100) : 0;
  const wantsPct = baseIncome > 0 ? Math.round((actualWants / baseIncome) * 100) : 0;
  const savingsPct = baseIncome > 0 ? Math.round((actualSavings / baseIncome) * 100) : 0;

  let healthStatus: 'healthy' | 'caution' | 'alert' = 'healthy';
  let headline = 'Balanced Financial Allocation';
  let advice =
    'Your capital allocation closely mirrors the gold-standard 50/30/20 framework. Essential obligations remain controlled, leaving adequate margin for wealth accumulation.';

  if (needsPct > 60) {
    healthStatus = 'alert';
    headline = 'Elevated Essential Commitments';
    advice = `Your non-negotiable living expenses account for ${needsPct}% of income (target ≤ 50%). Consider renegotiating fixed contracts or auditing recurring bills.`;
  } else if (wantsPct > 35) {
    healthStatus = 'caution';
    headline = 'Discretionary Outflow Expansion';
    advice = `Discretionary lifestyle spending is running at ${wantsPct}% (target ≤ 30%). Trimming dining out or impulse online purchases can redirect surplus to savings.`;
  } else if (savingsPct < 15) {
    healthStatus = 'caution';
    headline = 'Below Benchmark Savings Retention';
    advice = `Your current retained savings velocity is ${savingsPct}% (target ≥ 20%). Automate recurring deposits on salary day to prioritize capital preservation.`;
  }

  return {
    totalIncome: baseIncome,
    totalExpense: spendingArchetypes.total,
    needs: {
      actual: actualNeeds,
      actualPct: needsPct,
      targetPct: 50,
      targetAmount: targetNeeds,
      delta: targetNeeds - actualNeeds,
    },
    wants: {
      actual: actualWants,
      actualPct: wantsPct,
      targetPct: 30,
      targetAmount: targetWants,
      delta: targetWants - actualWants,
    },
    savings: {
      actual: actualSavings,
      actualPct: savingsPct,
      targetPct: 20,
      targetAmount: targetSavings,
      delta: actualSavings - targetSavings,
    },
    healthStatus,
    headline,
    advice,
  };
}

/**
 * Calculate ranked payee / merchant analytics
 */
export function calculateMerchantAnalytics(
  transactions: Transaction[],
  limit = 8
): MerchantAnalytics[] {
  const expenseTxs = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  const map = new Map<
    string,
    {
      amount: number;
      count: number;
      categoryName: string;
      categoryColor: string;
      latestDate: string;
    }
  >();

  for (const t of expenseTxs) {
    const existing = map.get(t.title) || {
      amount: 0,
      count: 0,
      categoryName: t.categoryName,
      categoryColor: t.categoryColor,
      latestDate: t.date,
    };

    existing.amount += t.amount;
    existing.count += 1;
    if (t.date > existing.latestDate) {
      existing.latestDate = t.date;
    }
    map.set(t.title, existing);
  }

  const results: MerchantAnalytics[] = [];
  map.forEach((data, name) => {
    results.push({
      name,
      amount: data.amount,
      count: data.count,
      averageTicket: Math.round(data.amount / data.count),
      percentageOfSpend: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
      categoryName: data.categoryName,
      categoryColor: data.categoryColor,
      latestDate: data.latestDate,
    });
  });

  return results.sort((a, b) => b.amount - a.amount).slice(0, limit);
}

/**
 * Generate SVG Sparkline polyline coordinates for a numeric series
 */
export function generateSparklinePoints(
  values: number[],
  width = 80,
  height = 24
): string {
  if (values.length < 2) return `0,${height / 2} ${width},${height / 2}`;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((val, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/**
 * Generate 4-6 high quality, data-derived observations based on actual numbers
 */
export function deriveFinancialInsights(
  summary: FinancialSummary,
  categorySpending: CategorySpending[],
  budgets: Budget[],
  currency: CurrencyCode
): Array<{
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
}> {
  const insights: Array<{
    id: string;
    type: 'positive' | 'warning' | 'info';
    title: string;
    description: string;
    metric?: string;
  }> = [];

  // 1. Savings Rate Insight
  if (summary.savingsRate >= 30) {
    insights.push({
      id: 'ins-savings-strong',
      type: 'positive',
      title: 'Remarkable Savings Velocity',
      description: `You are saving ${summary.savingsRate}% of your total earnings this period. This comfortably exceeds the standard 20% benchmark.`,
      metric: `${summary.savingsRate}% Saved`,
    });
  } else if (summary.savingsRate > 0) {
    insights.push({
      id: 'ins-savings-moderate',
      type: 'info',
      title: 'Positive Net Savings',
      description: `You saved ${formatCurrency(summary.netSavings, currency)} this period (${summary.savingsRate}% savings rate).`,
      metric: `${summary.savingsRate}%`,
    });
  } else {
    insights.push({
      id: 'ins-savings-deficit',
      type: 'warning',
      title: 'Net Outflow Alert',
      description: `Your expenses exceeded recorded income by ${formatCurrency(Math.abs(summary.netSavings), currency)} this period.`,
      metric: 'Negative Cash Flow',
    });
  }

  // 2. Spending Comparison vs Previous Period
  if (summary.prevPeriod.expenseChangePercent < -5) {
    insights.push({
      id: 'ins-expense-reduced',
      type: 'positive',
      title: 'Spending Discipline',
      description: `Your total spending is ${Math.abs(summary.prevPeriod.expenseChangePercent)}% lower compared to the previous period.`,
      metric: `${summary.prevPeriod.expenseChangePercent}% Outflow`,
    });
  } else if (summary.prevPeriod.expenseChangePercent > 10) {
    insights.push({
      id: 'ins-expense-jumped',
      type: 'warning',
      title: 'Spending Surge',
      description: `Expenses increased by ${summary.prevPeriod.expenseChangePercent}% compared to last period (${formatCurrency(summary.totalExpenses, currency)} vs ${formatCurrency(summary.prevPeriod.totalExpenses, currency)}).`,
      metric: `+${summary.prevPeriod.expenseChangePercent}%`,
    });
  }

  // 3. Category Concentration
  if (categorySpending.length > 0) {
    const topCat = categorySpending[0];
    if (topCat.percentage >= 30) {
      insights.push({
        id: 'ins-top-category',
        type: 'info',
        title: `Dominant Category: ${topCat.categoryName}`,
        description: `${topCat.categoryName} accounts for ${topCat.percentage}% of all your expenses (${formatCurrency(topCat.amount, currency)}).`,
        metric: `${topCat.percentage}%`,
      });
    }
  }

  // 4. Budget Overrun Check
  const overBudgetItems: string[] = [];
  for (const b of budgets) {
    if (!b.isActive) continue;
    const catSpend = categorySpending.find((c) => c.categoryId === b.categoryId)?.amount || 0;
    const percentUsed = Math.round((catSpend / b.limit) * 100);
    if (percentUsed >= b.alertThreshold) {
      overBudgetItems.push(`${b.categoryName} (${percentUsed}% used)`);
    }
  }

  if (overBudgetItems.length > 0) {
    insights.push({
      id: 'ins-budget-alert',
      type: 'warning',
      title: 'Budget Threshold Triggered',
      description: `Attention needed: ${overBudgetItems.slice(0, 2).join(' and ')} ${overBudgetItems.length > 2 ? `and ${overBudgetItems.length - 2} more` : ''} approaching cap.`,
      metric: 'Threshold Warning',
    });
  } else if (budgets.length > 0) {
    insights.push({
      id: 'ins-budget-optimal',
      type: 'positive',
      title: 'All Budgets Well Controlled',
      description: 'None of your active category budgets have breached their safety limits this period.',
      metric: '100% On Track',
    });
  }

  // 5. Daily Safe-to-Spend Projection (if in current month)
  const today = new Date('2026-10-28');
  const daysInMonth = 31;
  const daysRemaining = Math.max(1, daysInMonth - today.getDate());
  if (summary.netSavings > 0) {
    const safeDaily = Math.round(summary.netSavings / daysRemaining);
    insights.push({
      id: 'ins-safe-spend',
      type: 'info',
      title: 'Remaining Safe Daily Spend',
      description: `At your current savings surplus, you can safely spend up to ${formatCurrency(safeDaily, currency)}/day for the remaining ${daysRemaining} days of this month.`,
      metric: `${formatCurrency(safeDaily, currency)}/day`,
    });
  }

  return insights.slice(0, 5);
}

/**
 * Export transactions to CSV string
 */
export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = [
    'Date',
    'Title / Merchant',
    'Type',
    'Category',
    'Amount',
    'Payment Method',
    'Tags',
    'Notes',
  ];

  const rows = transactions.map((t) => [
    t.date,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.type,
    `"${(t.categoryName || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    t.paymentMethod || 'UPI',
    `"${(t.tags || []).join(';')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Parse CSV text into validated transactions
 */
export function parseTransactionsCSV(
  csvContent: string,
  existingCategories: Category[]
): {
  success: Transaction[];
  errors: Array<{ row: number; error: string; raw: string }>;
} {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return { success: [], errors: [{ row: 0, error: 'CSV file is empty or missing data rows', raw: '' }] };
  }

  const success: Transaction[] = [];
  const errors: Array<{ row: number; error: string; raw: string }> = [];

  // Find header indices
  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('merchant') || h.includes('description'));
  const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('cost') || h.includes('price'));
  const typeIdx = headers.findIndex((h) => h.includes('type'));
  const catIdx = headers.findIndex((h) => h.includes('category'));
  const methodIdx = headers.findIndex((h) => h.includes('method') || h.includes('account'));

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Simple CSV row parser handling quotes
    const cells: string[] = [];
    let insideQuote = false;
    let currentCell = '';
    for (let charIndex = 0; charIndex < rawLine.length; charIndex++) {
      const char = rawLine[charIndex];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        cells.push(currentCell.trim().replace(/^"|"$/g, ''));
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim().replace(/^"|"$/g, ''));

    const dateVal = dateIdx >= 0 ? cells[dateIdx] : cells[0];
    const titleVal = titleIdx >= 0 ? cells[titleIdx] : cells[1];
    const amountVal = amountIdx >= 0 ? cells[amountIdx] : cells[4];
    const typeVal = typeIdx >= 0 ? cells[typeIdx]?.toLowerCase() : 'expense';
    const catVal = catIdx >= 0 ? cells[catIdx] : 'Other';

    // Validation
    const cleanAmount = parseFloat((amountVal || '').replace(/[^0-9.-]/g, ''));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      errors.push({ row: i + 1, error: `Invalid amount: "${amountVal}"`, raw: rawLine });
      continue;
    }

    if (!titleVal) {
      errors.push({ row: i + 1, error: 'Merchant / Title is required', raw: rawLine });
      continue;
    }

    // Match or fallback category
    const matchedCategory =
      existingCategories.find(
        (c) => c.name.toLowerCase() === (catVal || '').toLowerCase()
      ) || existingCategories[0];

    const type: 'income' | 'expense' =
      typeVal.includes('inc') || typeVal === 'credit' ? 'income' : 'expense';

    success.push({
      id: `csv-${Date.now()}-${i}`,
      title: titleVal,
      amount: cleanAmount,
      type,
      categoryId: matchedCategory.id,
      categoryName: matchedCategory.name,
      categoryColor: matchedCategory.color,
      date: dateVal && /^\d{4}-\d{2}-\d{2}$/.test(dateVal) ? dateVal : '2026-10-28',
      paymentMethod: (methodIdx >= 0 && cells[methodIdx] ? (cells[methodIdx] as any) : 'UPI'),
      tags: ['imported-csv'],
    });
  }

  return { success, errors };
}
