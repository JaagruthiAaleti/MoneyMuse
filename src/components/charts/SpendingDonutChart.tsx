import React, { useState, useMemo } from 'react';
import { CategorySpending } from '../../types';
import { formatCurrency } from '../../utils/finance';
import { useFinance } from '../../context/FinanceContext';
import { PieChart, ArrowRight, ArrowDownRight, ArrowUpRight, Check, Filter } from 'lucide-react';

interface SpendingDonutChartProps {
  categories?: CategorySpending[];
  onSelectCategory?: (categoryId: string) => void;
  showModeToggle?: boolean;
}

export const SpendingDonutChart: React.FC<SpendingDonutChartProps> = ({
  categories: propCategories,
  onSelectCategory,
  showModeToggle = true,
}) => {
  const {
    preferences,
    setActiveTab,
    setSearchQuery,
    categorySpending: contextExpenses,
    incomeCategorySpending: contextIncomes,
  } = useFinance();

  // Mode: 'expense' (outflows) or 'income' (inflows)
  const [mode, setMode] = useState<'expense' | 'income'>('expense');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Active category list based on mode or props
  const activeCategories: CategorySpending[] = useMemo(() => {
    if (propCategories && !showModeToggle) {
      return propCategories;
    }
    return mode === 'expense' ? contextExpenses : contextIncomes;
  }, [propCategories, showModeToggle, mode, contextExpenses, contextIncomes]);

  const totalAmount = useMemo(() => {
    return activeCategories.reduce((sum, c) => sum + c.amount, 0);
  }, [activeCategories]);

  // SVG Geometry
  const size = 230;
  const center = size / 2;
  const radius = 90;
  const innerRadius = 62;

  let cumulativeAngle = -Math.PI / 2;

  const slices = activeCategories.map((cat, idx) => {
    const fraction = totalAmount > 0 ? cat.amount / totalAmount : 0;
    const sliceAngle = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    const isHovered = hoveredIndex === idx;
    const isSelected = selectedIndex === idx;
    const currentRadius = isHovered || isSelected ? radius + 5 : radius;
    const currentInner = isHovered || isSelected ? innerRadius - 2 : innerRadius;

    const x1 = center + currentRadius * Math.cos(startAngle);
    const y1 = center + currentRadius * Math.sin(startAngle);
    const x2 = center + currentRadius * Math.cos(endAngle);
    const y2 = center + currentRadius * Math.sin(endAngle);

    const ix1 = center + currentInner * Math.cos(endAngle);
    const iy1 = center + currentInner * Math.sin(endAngle);
    const ix2 = center + currentInner * Math.cos(startAngle);
    const iy2 = center + currentInner * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${currentRadius} ${currentRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix1} ${iy1}
      A ${currentInner} ${currentInner} 0 ${largeArc} 0 ${ix2} ${iy2}
      Z
    `;

    return {
      cat,
      index: idx,
      pathData,
      isHovered,
      isSelected,
    };
  });

  // Effective highlighted category
  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const activeCategory = activeIndex !== null && activeCategories[activeIndex] ? activeCategories[activeIndex] : null;

  const handleCategoryRowClick = (cat: CategorySpending, idx: number) => {
    if (selectedIndex === idx) {
      setSelectedIndex(null);
    } else {
      setSelectedIndex(idx);
    }
  };

  const handleInspectTransactions = (catName: string) => {
    setSearchQuery(catName);
    setActiveTab('transactions');
  };

  const displayedCategories = showAllCategories ? activeCategories : activeCategories.slice(0, 5);

  return (
    <div className="p-5 rounded-xl bg-[#0f1626] dark:bg-[#0f1626] border border-slate-800/80 shadow-xs flex flex-col justify-between">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
            <span>Capital Distribution</span>
            <span className="text-slate-500 font-normal">·</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {activeCategories.length} categories
            </span>
          </h2>
          <p className="text-xs text-slate-400">Proportional allocation of capital flows</p>
        </div>

        {/* Toggle between Outflows & Inflows */}
        {showModeToggle && (
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('expense');
                setHoveredIndex(null);
                setSelectedIndex(null);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                mode === 'expense'
                  ? 'bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-3 h-3 text-violet-400" />
              <span>Outflows</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('income');
                setHoveredIndex(null);
                setSelectedIndex(null);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                mode === 'income'
                  ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3 h-3 text-cyan-400" />
              <span>Inflows</span>
            </button>
          </div>
        )}
      </div>

      {activeCategories.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
          <PieChart className="w-8 h-8 text-slate-600 mb-1" />
          <span>No recorded {mode === 'expense' ? 'expenses' : 'income entries'} in this period.</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-5">
          {/* Donut Canvas */}
          <div className="relative shrink-0 flex items-center justify-center my-2">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="overflow-visible select-none"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {slices.map((slice) => {
                const isHighlighted = slice.isHovered || slice.isSelected;
                return (
                  <path
                    key={slice.cat.categoryId}
                    d={slice.pathData}
                    fill={slice.cat.categoryColor}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      opacity: activeIndex === null || isHighlighted ? 1 : 0.45,
                      filter: isHighlighted
                        ? 'drop-shadow(0px 0px 8px rgba(255,255,255,0.25))'
                        : 'none',
                      transformOrigin: `${center}px ${center}px`,
                    }}
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(slice.cat.categoryId);
                      } else {
                        handleCategoryRowClick(slice.cat, slice.index);
                      }
                    }}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeCategory ? (
                <>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
                    {activeCategory.categoryName}
                  </div>
                  <div className="text-base font-bold text-white tracking-tight font-numeric tabular-nums">
                    {formatCurrency(activeCategory.amount, preferences.currency)}
                  </div>
                  <div className="text-[11px] font-semibold text-violet-400 font-numeric">
                    {activeCategory.percentage}% of total
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {activeCategory.transactionCount} {activeCategory.transactionCount === 1 ? 'tx' : 'txs'} ·{' '}
                    {formatCurrency(
                      Math.round(activeCategory.amount / Math.max(1, activeCategory.transactionCount)),
                      preferences.currency
                    )}{' '}
                    avg
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total {mode === 'expense' ? 'Outflows' : 'Inflows'}
                  </div>
                  <div className="text-lg font-bold text-white tracking-tight font-numeric tabular-nums">
                    {formatCurrency(totalAmount, preferences.currency)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {activeCategories.length} categories logged
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Category Distribution Rows */}
          <div className="w-full space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {displayedCategories.map((cat, idx) => {
              const isSelected = selectedIndex === idx;
              const isHovered = hoveredIndex === idx;
              const isItemActive = isSelected || isHovered;

              return (
                <div
                  key={cat.categoryId}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleCategoryRowClick(cat, idx)}
                  className={`p-2 rounded-lg transition-all cursor-pointer border ${
                    isItemActive
                      ? 'bg-slate-800/80 border-slate-700 shadow-xs'
                      : 'border-transparent hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-mono text-slate-500 w-3.5 shrink-0">
                        #{idx + 1}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.categoryColor }}
                      />
                      <span className="font-medium text-slate-200 truncate">
                        {cat.categoryName}
                      </span>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2 font-numeric tabular-nums">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {cat.percentage}%
                      </span>
                      <span className="font-semibold text-white">
                        {formatCurrency(cat.amount, preferences.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="h-1.5 w-full bg-slate-800/90 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.categoryColor,
                      }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>

                  {/* Quick Action when selected */}
                  {isSelected && (
                    <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {cat.transactionCount} transactions logged
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspectTransactions(cat.categoryName);
                        }}
                        className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                      >
                        <span>Filter Ledger</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {activeCategories.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="w-full py-1 text-center text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer"
              >
                {showAllCategories ? 'Show Top 5 Only' : `View All ${activeCategories.length} Categories`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
