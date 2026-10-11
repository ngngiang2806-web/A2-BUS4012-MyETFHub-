interface HeaderProps {
  currentStep: string;
  onLogout: () => void;
}

const stepLabels: Record<string, string> = {
  landing: "",
  signup: "Sign Up",
  login: "Sign In",
  profile: "Investor Profile",
  "add-etf": "Add ETF",
  success: "Confirmation",
  dashboard: "Portfolio Dashboard",
};

export default function Header({ currentStep, onLogout }: HeaderProps) {
  if (currentStep === "landing" || currentStep === "signup" || currentStep === "login") return null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-lg font-bold text-slate-900">MyETFHub</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{stepLabels[currentStep]}</span>
          <button
            onClick={onLogout}
            className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}