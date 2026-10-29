import React, { useState } from 'react';
import { X, Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { parseTransactionsCSV, formatCurrency } from '../../utils/finance';
import { Transaction } from '../../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { categories, transactions, importTransactions, preferences } = useFinance();

  const [rawCsv, setRawCsv] = useState('');
  const [parsedData, setParsedData] = useState<{
    success: Transaction[];
    errors: Array<{ row: number; error: string; raw: string }>;
  } | null>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const sampleHeaders = 'Date,Title / Merchant,Type,Category,Amount,Payment Method,Tags,Notes\n';
    const sampleRows = [
      '2026-10-25,Blinkit Express Groceries,expense,Groceries,1450,UPI,groceries;kitchen,Weekly fruits and snacks',
      '2026-10-20,Quarterly Performance Bonus,income,Primary Salary,25000,Bank Transfer,bonus,Q3 tech reward',
      '2026-10-18,Cult.fit Fitness Membership,expense,Health & Wellness,2490,Credit Card,fitness,Monthly gym pass',
      '2026-10-14,Uber Premier Office Commute,expense,Transportation,480,UPI,commute,Client workshop roundtrip',
    ].join('\n');

    const blob = new Blob([sampleHeaders + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'moneymuse_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawCsv(text);
      const result = parseTransactionsCSV(text, categories);
      setParsedData(result);
    };
    reader.readAsText(file);
  };

  const handleCommit = () => {
    if (!parsedData || parsedData.success.length === 0) return;
    importTransactions(parsedData.success);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="relative w-full max-w-2xl bg-[#0f1626] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-600/15 text-violet-400 border border-violet-500/25">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Import Transactions via CSV</h2>
              <p className="text-[11px] text-slate-400">
                Batch import bank statements or expense sheets with field validation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Sample template & instructions */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Need the standard spreadsheet format?
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Download our formatted CSV template with pre-mapped columns.
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-violet-400" />
              <span>Download Template</span>
            </button>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select CSV File from Device
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-violet-500 rounded-2xl p-6 text-center transition-colors">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-200">
                Click to browse or drop your .csv file here
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Supports dates (YYYY-MM-DD), categories, amounts, and notes
              </div>
            </div>
          </div>

          {/* Preview & Validation Report */}
          {parsedData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {parsedData.success.length} Rows Validated
                </span>
                {parsedData.errors.length > 0 && (
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    {parsedData.errors.length} Rows with Issues (Skipped)
                  </span>
                )}
              </div>

              {/* Table Preview */}
              {parsedData.success.length > 0 && (
                <div className="border border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {parsedData.success.slice(0, 10).map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono text-[11px] text-slate-400">{t.date}</td>
                          <td className="p-2.5 font-medium text-white">{t.title}</td>
                          <td className="p-2.5">{t.categoryName}</td>
                          <td
                            className={`p-2.5 text-right font-numeric font-semibold ${
                              t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                            }`}
                          >
                            {t.type === 'income' ? '+' : '-'}
                            {formatCurrency(t.amount, preferences.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Errors List if any */}
              {parsedData.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1">
                  <div className="font-semibold text-rose-300">Validation Notice:</div>
                  {parsedData.errors.slice(0, 3).map((err, i) => (
                    <div key={i} className="text-slate-400 text-[11px]">
                      Row {err.row}: {err.error}
                    </div>
                  ))}
                  {parsedData.errors.length > 3 && (
                    <div className="text-slate-500 text-[10px]">
                      + {parsedData.errors.length - 3} more rows rejected due to invalid formatting
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parsedData || parsedData.success.length === 0}
            onClick={handleCommit}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>
              Import {parsedData ? `${parsedData.success.length} Transactions` : 'Records'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
