import type { Holding } from "../../types";
import StatCard from "../dashboard/StatCard";
import HoldingsTable from "../dashboard/HoldingsTable";
import AllocationBreakdown from "../dashboard/AllocationBreakdown";
import Card from "../ui/Card";
import Button from "../ui/Button";
import IconButton from "../ui/icon-button";
import ProgressBar from "../ProgressBar";

interface PortfolioDashboardScreenProps {
  holdings: Holding[];
  investorName: string;
  onAddNew: () => void;
  onDelete: (id: string) => Promise<void>;
}

export default function PortfolioDashboardScreen({ holdings, investorName, onAddNew, onDelete }: PortfolioDashboardScreenProps) {
  const totalInvested = holdings.reduce((sum, h) => sum + h.units * h.purchasePrice, 0);
  const largestHolding = holdings.reduce(
    (max, h) => (h.units * h.purchasePrice > max.value ? { ticker: h.ticker, value: h.units * h.purchasePrice } : max),
    { ticker: "—", value: 0 }
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full pt-12 pb-8 px-4">
        <div className="mb-6">
          <ProgressBar currentStep={5} totalSteps={5} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {investorName ? `${investorName}'s Portfolio` : "Your Portfolio"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {holdings.length} ETF holding{holdings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <IconButton onClick={onAddNew}>
            + Add New ETF
          </IconButton>
        </div>

        {/* Empty state for users with no holdings */}
        {holdings.length === 0 && (
          <Card className="mb-6 text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No Holdings Yet</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Your portfolio is empty. Start by adding your first ETF holding to begin tracking your investments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={onAddNew} className="px-6 py-3">Add Your First ETF</Button>
            </div>
          </Card>
        )}

        {/* Stat cards */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Invested" value={`A$${totalInvested.toFixed(2)}`} />
            <StatCard label="Holdings" value={String(holdings.length)} subtext="ETF positions" />
            <StatCard
              label="Largest Holding"
              value={largestHolding.ticker}
              subtext={largestHolding.value > 0 ? `A$${largestHolding.value.toFixed(2)}` : undefined}
            />
          </div>
        )}

        {/* Holdings table */}
        <Card className="mb-6">
          <HoldingsTable holdings={holdings} onDelete={onDelete} />
        </Card>

        {/* Allocation bar */}
        {holdings.length > 0 && (
          <Card>
            <AllocationBreakdown holdings={holdings} />
          </Card>
        )}
      </div>
    </div>
  );
}