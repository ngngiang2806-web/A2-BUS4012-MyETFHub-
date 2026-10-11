import type { Holding } from "../../types";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ProgressBar from "../ProgressBar";

interface SuccessScreenProps {
  holding: Holding;
  onViewPortfolio: () => void;
  onAddAnother: () => void;
}

export default function SuccessScreen({ holding, onViewPortfolio, onAddAnother }: SuccessScreenProps) {
  const totalValue = holding.units * holding.purchasePrice;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-start justify-center pt-12 pb-8 px-4">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <ProgressBar currentStep={4} totalSteps={5} />
          </div>

          {/* Success icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">
            ETF Added Successfully!
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            Your holding has been added to your portfolio
          </p>

          <Card>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Holding Summary
            </h2>
            <div className="space-y-3">
              <SummaryRow label="ETF Ticker" value={holding.ticker} />
              <SummaryRow label="ETF Name" value={holding.name} />
              <SummaryRow label="Units" value={holding.units.toLocaleString()} />
              <SummaryRow label="Purchase Price" value={`A$${holding.purchasePrice.toFixed(2)}`} />
              <SummaryRow label="Purchase Date" value={new Date(holding.purchaseDate).toLocaleDateString("en-AU")} />
              <div className="border-t border-slate-200 pt-3 mt-3">
                <SummaryRow label="Total Value" value={`A$${totalValue.toFixed(2)}`} highlight />
              </div>
            </div>
          </Card>

          <div className="mt-6 space-y-3">
            <Button onClick={onViewPortfolio}>View Portfolio</Button>
            <Button variant="secondary" onClick={onAddAnother}>
              Add Another ETF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm ${highlight ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
        {value}
      </span>
    </div>
  );
}