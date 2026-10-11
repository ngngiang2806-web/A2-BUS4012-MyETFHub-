import { useState } from "react";
import type { Holding } from "../../types";

interface HoldingsTableProps {
  holdings: Holding[];
  onDelete: (id: string) => Promise<void>;
}

export default function HoldingsTable({ holdings, onDelete }: HoldingsTableProps) {
  const [deletingId, setDeletingId] = useState<string>();
  const [deleteError, setDeleteError] = useState<string>();

  async function handleDelete(id: string) {
    setDeleteError(undefined);
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "The holding could not be deleted. Please try again.");
    } finally {
      setDeletingId(undefined);
    }
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <p className="text-sm">No holdings yet. Add your first ETF to get started.</p>
      </div>
    );
  }

  const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.units * h.purchasePrice, 0);

  return (
    <div className="overflow-x-auto">
      {deleteError && <p className="mb-3 text-sm text-red-600">{deleteError}</p>}
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticker</th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Units</th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Price</th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Invested</th>
            <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Allocation</th>
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const value = h.units * h.purchasePrice;
            const pct = totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0;
            return (
              <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-3.5 text-sm font-semibold text-slate-900">{h.ticker}</td>
                <td className="py-3.5 text-sm text-slate-600 max-w-[200px] truncate">{h.name}</td>
                <td className="py-3.5 text-sm text-slate-700 text-right">{h.units.toLocaleString()}</td>
                <td className="py-3.5 text-sm text-slate-700 text-right">A${h.purchasePrice.toFixed(2)}</td>
                <td className="py-3.5 text-sm font-medium text-slate-900 text-right">A${value.toFixed(2)}</td>
                <td className="py-3.5 text-right">
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {pct.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => void handleDelete(h.id)}
                    disabled={deletingId === h.id}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title={deletingId === h.id ? "Deleting holding" : "Delete holding"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}