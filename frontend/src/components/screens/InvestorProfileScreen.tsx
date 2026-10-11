import { useState } from "react";
import type { InvestorProfile } from "../../types";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import FormSection from "../ui/FormSection";
import ProgressBar from "../ProgressBar";

interface InvestorProfileScreenProps {
  initialData: InvestorProfile;
  onSave: (profile: InvestorProfile) => Promise<void>;
}

const GOAL_OPTIONS = [
  { value: "capital-growth", label: "Capital Growth" },
  { value: "income-generation", label: "Income Generation" },
  { value: "capital-preservation", label: "Capital Preservation" },
];

const RISK_OPTIONS = [
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" },
];

const TIMEFRAME_OPTIONS = [
  { value: "short-term", label: "Short Term (0–3 years)" },
  { value: "medium-term", label: "Medium Term (3–5 years)" },
  { value: "long-term", label: "Long Term (5+ years)" },
];

export default function InvestorProfileScreen({ initialData, onSave }: InvestorProfileScreenProps) {
  const [form, setForm] = useState<InvestorProfile>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof InvestorProfile, string>>>({});
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof InvestorProfile>(key: K, value: InvestorProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.investmentGoal) newErrors.investmentGoal = "Select an investment goal";
    if (!form.riskPreference) newErrors.riskPreference = "Select a risk preference";
    if (!form.investmentTimeframe) newErrors.investmentTimeframe = "Select a timeframe";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitError(undefined);
    setIsSubmitting(true);
    try {
      await onSave(form);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your profile could not be saved. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-start justify-center pt-12 pb-8 px-4">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <ProgressBar currentStep={2} totalSteps={5} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Investor Profile</h1>
          <p className="text-sm text-slate-500 mb-6">Tell us about your investment preferences</p>

          <FormSection title="Personal Information" subtitle="Your investment preferences and goals">
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                error={errors.fullName}
              />

              <Select
                label="Investment Goal"
                options={GOAL_OPTIONS}
                placeholder="Select your goal"
                value={form.investmentGoal}
                onChange={(e) => update("investmentGoal", e.target.value as InvestorProfile["investmentGoal"])}
                error={errors.investmentGoal}
              />

              <Select
                label="Risk Preference"
                options={RISK_OPTIONS}
                placeholder="Select risk level"
                value={form.riskPreference}
                onChange={(e) => update("riskPreference", e.target.value as InvestorProfile["riskPreference"])}
                error={errors.riskPreference}
              />

              <Select
                label="Investment Timeframe"
                options={TIMEFRAME_OPTIONS}
                placeholder="Select timeframe"
                value={form.investmentTimeframe}
                onChange={(e) => update("investmentTimeframe", e.target.value as InvestorProfile["investmentTimeframe"])}
                error={errors.investmentTimeframe}
              />

              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Continue"}</Button>
            </form>
          </FormSection>
        </div>
      </div>
    </div>
  );
}