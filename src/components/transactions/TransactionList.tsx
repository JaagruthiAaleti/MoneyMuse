import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Upload,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import { exportTransactionsToCSV, formatCurrency } from '../../utils/finance';
import { CategoryIcon } from '../common/CategoryIcon';
import { TransactionModal } from './TransactionModal';
import { CsvImportModal } from './CsvImportModal';

export const TransactionList: React.FC = () => {
  const {
    transactions,
    categories,
    deleteTransaction,
    preferences,
    searchQuery,
    setSearchQuery,
  } = useFinance();

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modals
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  // Filter Logic
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
      if (selectedPaymentMethod !== 'all' && t.paymentMethod !== selectedPaymentMethod) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesCategory = t.categoryName.toLowerCase().includes(q);
        const matchesNotes = t.notes?.toLowerCase().includes(q) || false;
        const matchesTags = t.tags?.some((tag) => tag.toLowerCase().includes(q)) || false;
        if (!matchesTitle && !matchesCategory && !matchesNotes && !matchesTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, typeFilter, selectedCategory, selectedPaymentMethod, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedTransactions = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeFiltersCount =
    (typeFilter !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedPaymentMethod !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetFilters = () => {
    setTypeFilter('all');
    setSelectedCategory('all');
    setSelectedPaymentMethod('all');
    setSearchQuery('');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const csvContent = exportTransactionsToCSV(filtered);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `moneymuse_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by merchant, note, or category..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* CSV Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCsvModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-violet-400" />
              <span>Import</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/50 text-xs">
          {/* Segmented Type Filter */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('expense');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-slate-800 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('income');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-slate-800 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Incomes
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method Dropdown */}
          <select
            value={selectedPaymentMethod}
            onChange={(e) => {
              setSelectedPaymentMethod(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">All Accounts / Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>

          {/* Reset Filters action */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-violet-300 hover:text-white transition-colors cursor-pointer text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset ({activeFiltersCount})</span>
            </button>
          )}

          <div className="ml-auto text-slate-500 text-[11px] font-mono">
            {filtered.length} entries
          </div>
        </div>
      </div>

      {/* High-Density Ledger Table */}
      <div className="rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-2.5">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">No Entries Match Criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
              Try adjusting your query, selected category, or date range.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
            >
              Clear Active Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Payee / Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-3 text-center w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {paginatedTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTxDetail(tx)}
                        className="hover:bg-slate-800/35 transition-colors group cursor-pointer"
                      >
                        {/* Title & Unboxed Metadata */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-slate-200"
                              style={{
                                backgroundColor: `${tx.categoryColor}18`,
                                border: `1px solid ${tx.categoryColor}30`,
                              }}
                            >
                              {tx.title.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                                {tx.title}
                              </div>
                              {tx.notes && (
                                <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                  {tx.notes}
                                </div>
                              )}
                              {tx.tags && tx.tags.length > 0 && (
                                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                  {tx.tags.map((t) => `#${t}`).join(' · ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                            <CategoryIcon
                              name={categories.find((c) => c.id === tx.categoryId)?.icon || 'Tag'}
                              className="w-3.5 h-3.5"
                              color={tx.categoryColor}
                            />
                            <span>{tx.categoryName}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 tabular-nums">
                          {tx.date}
                        </td>

                        {/* Method */}
                        <td className="py-2.5 px-4 text-slate-400 text-xs">
                          {tx.paymentMethod}
                        </td>

                        {/* Amount */}
                        <td className="py-2.5 px-4 text-right font-numeric tabular-nums font-semibold text-xs">
                          <span className={isIncome ? 'text-emerald-400' : 'text-slate-100'}>
                            {isIncome ? '+' : '-'}
                            {formatCurrency(tx.amount, preferences.currency)}
                          </span>
                        </td>

                        {/* Inline Actions */}
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTransaction(tx);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit record"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="font-mono text-[11px]">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transaction Details Drawer / Modal */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#0f1626] border border-slate-800 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-semibold text-slate-400">Transaction Record</span>
              <button
                type="button"
                onClick={() => setSelectedTxDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                {selectedTxDetail.title}
              </div>
              <div
                className={`text-2xl font-bold font-numeric tabular-nums mt-1 ${
                  selectedTxDetail.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {selectedTxDetail.type === 'income' ? '+' : '-'}
                {formatCurrency(selectedTxDetail.amount, preferences.currency)}
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Category:</span>
                <span className="text-slate-200 font-medium">{selectedTxDetail.categoryName}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-200 font-mono text-[11px]">{selectedTxDetail.date}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Method:</span>
                <span className="text-slate-200">{selectedTxDetail.paymentMethod}</span>
              </div>
              {selectedTxDetail.tags && selectedTxDetail.tags.length > 0 && (
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Tags:</span>
                  <span className="text-slate-400 text-[11px]">
                    {selectedTxDetail.tags.map((t) => `#${t}`).join(' ')}
                  </span>
                </div>
              )}
              {selectedTxDetail.notes && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Notes:</span>
                  <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed text-[11px]">
                    {selectedTxDetail.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingTransaction(selectedTxDetail);
                  setSelectedTxDetail(null);
                  setIsEditModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
              >
                Edit Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <TransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        transactionToEdit={editingTransaction}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
    </div>
  );
};
