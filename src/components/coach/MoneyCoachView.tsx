import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  TrendingUp,
  PieChart,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/finance';

export const MoneyCoachView: React.FC = () => {
  const {
    coachMessages,
    isCoachTyping,
    sendCoachMessage,
    financialSummary,
    categorySpending,
    budgets,
    preferences,
  } = useFinance();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptCategories = [
    { label: 'Outflow Analysis', query: 'Where did most of my money go this month?' },
    { label: 'Savings Velocity', query: 'How can I boost my savings rate to 40%?' },
    { label: 'Budget Pacing', query: 'Are any of my active budgets in danger of overspending?' },
    { label: 'Action Plan', query: 'Give me a 3-step action plan to optimize expenses next month' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [coachMessages, isCoachTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isCoachTyping) return;
    sendCoachMessage(text.trim());
    if (!textToSend) setInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-125px)] min-h-[580px]">
      {/* Main Chat Column */}
      <div className="lg:col-span-2 flex flex-col bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 rounded-xl shadow-xs overflow-hidden">
        {/* Chat Header */}
        <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">MoneyMuse Financial Coach</h2>
                <span className="text-[10px] text-emerald-400 font-mono">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Data-grounded financial advice calculated from your ledger
              </p>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {coachMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold ${
                    isUser
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-800 text-violet-400 border border-slate-700/60'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {msg.suggestedPrompts && (
                    <div className="mt-3.5 pt-3 border-t border-slate-800/70 space-y-1.5">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Quick Questions:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(prompt)}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors text-left cursor-pointer"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-2 font-mono ${
                      isUser ? 'text-violet-200' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isCoachTyping && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-violet-400">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                <span>Coach is analyzing cash flow and metrics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts Bar */}
        <div className="px-3 pt-2 pb-1 border-t border-slate-800/60 bg-slate-900/30 flex items-center gap-1.5 overflow-x-auto">
          {promptCategories.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p.query)}
              className="text-[11px] px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/40 whitespace-nowrap transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0c1220]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask coach about cash flow, pacing, or savings..."
              className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isCoachTyping}
              className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Financial Data Given to AI */}
      <div className="space-y-4 overflow-y-auto">
        <div className="p-4 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Grounded Telemetry
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Server Proxy</span>
          </div>

          <div className="space-y-2 text-xs font-numeric tabular-nums">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 font-sans">Gross Inflows:</span>
              <span className="font-semibold text-emerald-400">
                {formatCurrency(financialSummary.totalIncome, preferences.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 font-sans">Gross Outflows:</span>
              <span className="font-semibold text-slate-200">
                {formatCurrency(financialSummary.totalExpenses, preferences.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 font-sans">Savings Margin:</span>
              <span className="font-semibold text-cyan-400">
                {financialSummary.savingsRate}%
              </span>
            </div>
          </div>

          {/* Top Outflows in Context */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Top Outflow Categories
            </div>
            {categorySpending.slice(0, 3).map((cat) => (
              <div
                key={cat.categoryId}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <span className="truncate text-slate-300 text-xs">{cat.categoryName}</span>
                <span className="font-numeric tabular-nums font-semibold text-white shrink-0">
                  {formatCurrency(cat.amount, preferences.currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Budgets in Context */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Cap Limits
            </div>
            {budgets.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between text-xs py-0.5 font-numeric tabular-nums"
              >
                <span className="text-slate-300 truncate font-sans text-xs">{b.categoryName}</span>
                <span className="text-slate-400 text-xs">
                  {formatCurrency(b.limit, preferences.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 leading-relaxed">
            All AI responses are generated via our secure server endpoint with strict data validation. No bank credentials or authentication secrets are ever stored.
          </div>
        </div>
      </div>
    </div>
  );
};
