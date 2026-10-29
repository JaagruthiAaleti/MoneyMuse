import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X, RotateCcw } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 dark:bg-slate-900/95 border-emerald-500/30 text-slate-100'
                : toast.type === 'error'
                ? 'bg-slate-900/95 dark:bg-slate-900/95 border-rose-500/30 text-slate-100'
                : 'bg-slate-900/95 dark:bg-slate-900/95 border-violet-500/30 text-slate-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-violet-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{toast.title}</div>
              {toast.message && (
                <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</div>
              )}
              {toast.onUndo && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onUndo?.();
                    removeToast(toast.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  {toast.undoLabel || 'Undo action'}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
