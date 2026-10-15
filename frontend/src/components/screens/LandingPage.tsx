import { BarChart3, FileText, PieChart, ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

const FEATURES = [
  { icon: <BarChart3 className="w-6 h-6" />, title: "Portfolio Tracking", description: "Monitor all your ETF holdings in one clean dashboard with real-time portfolio summaries." },
  { icon: <FileText className="w-6 h-6" />, title: "Investment Records", description: "Log purchase details including units, prices, and dates for accurate record-keeping." },
  { icon: <PieChart className="w-6 h-6" />, title: "Portfolio Summaries", description: "See allocation breakdowns, total invested amounts, and identify your largest holdings at a glance." },
];

const STEPS = [
  { number: "1", title: "Create Account", description: "Sign up with your email to get started in seconds." },
  { number: "2", title: "Set Up Profile", description: "Tell us about your investment goals and risk preferences." },
  { number: "3", title: "Track Holdings", description: "Add your ETF purchases and watch your portfolio grow." },
];

export default function LandingPage({ onSignUp, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Navigation Bar ─────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-bold text-slate-900">MyETFHub</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onSignIn} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Sign In</button>
            <Button onClick={onSignUp} fullWidth={false} className="px-4 py-2 text-sm">Sign Up</Button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="bg-ice py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="text-slate-900">Track Your ETF Portfolio</span>
            <br />
            <span className="text-navy">With Confidence</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
            MyETFHub helps you record and monitor your ETF holdings in one organised dashboard.
            Stay on top of your investments, understand your allocation, and keep clean records.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={onSignUp} className="px-8 py-3">Get Started — Sign Up Free</Button>
            <Button variant="secondary" onClick={onSignIn} className="px-8 py-3">Sign In</Button>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">Everything You Need to Track Your ETFs</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Simple tools to keep your investment records organised and accessible.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* ── How It Works Section ────────────────────────────── */}
      <section className="bg-ice py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">How It Works</h2>
            <p className="text-slate-500">Get started in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.number} className="text-center relative">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.description}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 -right-4 text-slate-300">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────── */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-500">Disclaimer:</strong> MyETFHub is a portfolio tracking tool
              designed for personal record-keeping purposes only. It does not provide financial advice, and
              no data should be construed as a recommendation to buy, sell, or hold any investment.
              Always consult a licensed financial adviser before making investment decisions.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="text-center py-6 text-sm text-slate-400 border-t border-slate-100">
        © {new Date().getFullYear()} MyETFHub. Track. Understand. Grow.
      </footer>
    </div>
  );
}