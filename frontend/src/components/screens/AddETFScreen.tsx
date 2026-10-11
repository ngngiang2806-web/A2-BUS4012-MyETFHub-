import { useState, useEffect } from "react";
import type { Holding } from "../../types";
import { MOCK_ETF_CATALOG } from "../../data/mockETFs";
import Input from "../ui/Input";
import Select from "../ui/Select";
import IconButton from "../ui/icon-button";
import FormSection from "../ui/FormSection";
import ProgressBar from "../ProgressBar";

interface AddETFScreenProps {
  onAdd: (holding: Omit<Holding, "id" | "addedAt">) => Promise<void>;
}

const ETF_OPTIONS = MOCK_ETF_CATALOG.map((etf) => ({
  value: etf.ticker,
  label: `${etf.ticker} — ${etf.name}`,
}));

export default function AddETFScreen({ onAdd }: AddETFScreenProps) {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [units, setUnits] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live calculation
  const totalValue = units && purchasePrice ? Number(units) * Number(purchasePrice) : 0;

  // Auto-fill name & price when ticker changes
  useEffect(() => {
    if (!ticker) {
      setName("");
      setPurchasePrice("");
      return;
    }
    const etf = MOCK_ETF_CATALOG.find((e) => e.ticker === ticker);
    if (etf) {
      setName(etf.name);
      setPurchasePrice(etf.defaultPrice.toFixed(2));
    }
  }, [ticker]);

  // Clear field-level error on edit
  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!ticker) newErrors.ticker = "Select an ETF";
    if (!units || !/^\d+$/.test(units) || Number(units) < 1) newErrors.units = "Enter a valid whole number of units";
    if (!purchasePrice || Number(purchasePrice) <= 0) newErrors.purchasePrice = "Enter a valid price";
    if (!purchaseDate) newErrors.purchaseDate = "Select a purchase date";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitError(undefined);
    setIsSubmitting(true);
    try {
      await onAdd({
        ticker,
        name,
        units: Number(units),
        purchasePrice: Number(purchasePrice),
        purchaseDate,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your ETF holding could not be saved. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-start justify-center pt-12 pb-8 px-4">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <ProgressBar currentStep={3} totalSteps={5} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Add ETF Holding</h1>
          <p className="text-sm text-slate-500 mb-6">Enter the details of your ETF purchase</p>

          <FormSection title="Investment Details" subtitle="ETF selection and purchase information">
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}
              <Select
                label="ETF Ticker"
                options={ETF_OPTIONS}
                placeholder="Select an ETF"
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value);
                  clearError("ticker");
                }}
                error={errors.ticker}
              />

              <Input
                label="ETF Name"
                value={name}
                readOnly
                placeholder="Auto-filled after selection"
              />

              <Input
                label="Number of Units"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 50"
                value={units}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setUnits(val);
                  clearError("units");
                }}
                error={errors.units}
              />

              <Input
                label="Purchase Price (AUD)"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 109.33"
                value={purchasePrice}
                onChange={(e) => {
                  setPurchasePrice(e.target.value);
                  clearError("purchasePrice");
                }}
                error={errors.purchasePrice}
              />

              <Input
                label="Total Invested (AUD)"
                value={totalValue > 0 ? `A$${totalValue.toFixed(2)}` : ""}
                readOnly
                placeholder="Auto-calculated"
              />

              <Input
                label="Purchase Date"
                type="date"
                value={purchaseDate}
                onChange={(e) => {
                  setPurchaseDate(e.target.value);
                  clearError("purchaseDate");
                }}
                error={errors.purchaseDate}
              />

              <IconButton type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Add to Portfolio"}</IconButton>
            </form>
          </FormSection>
        </div>
      </div>
    </div>
  );
}