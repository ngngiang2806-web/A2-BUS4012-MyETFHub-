import type { Holding } from "../../types";

interface AllocationBreakdownProps {
  holdings: Holding[];
}

const COLORS = ["bg-blue-600", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];

export default function AllocationBreakdown({ holdings }: AllocationBreakdownProps) {
  if (holdings.length === 0) return null;

  const totalValue = holdings.reduce((sum, h) => sum + h.units * h.purchasePrice, 0);

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Portfolio Allocation
      </h3>

      {/* Horizontal stacked bar */}
      <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100">
        {holdings.map((h, i) => {
          const pct = totalValue > 0 ? (h.units * h.purchasePrice / totalValue) * 100 : 0;
          return (
            <div
              key={h.id}
              className={`${COLORS[i % COLORS.length]} transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${h.ticker}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3">
        {holdings.map((h, i) => {
          const pct = totalValue > 0 ? (h.units * h.purchasePrice / totalValue) * 100 : 0;
          return (
            <div key={h.id} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${COLORS[i % COLORS.length]}`} />
              <span className="text-xs text-slate-600">
                {h.ticker} <span className="text-slate-400">({pct.toFixed(1)}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}