import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { AppStep, Holding, InvestorProfile } from "./types";
import { ApiError, createHolding, deleteHolding, getHoldings, getInvestorProfile, saveInvestorProfile } from "./lib/api";
import { supabase } from "./lib/supabase";
import { clearLegacyDemoData } from "./utils/localStorage";

import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./components/screens/LandingPage";
import SignUpScreen from "./components/screens/SignUpScreen";
import LoginScreen from "./components/screens/LoginScreen";
import InvestorProfileScreen from "./components/screens/InvestorProfileScreen";
import AddETFScreen from "./components/screens/AddETFScreen";
import SuccessScreen from "./components/screens/SuccessScreen";
import PortfolioDashboardScreen from "./components/screens/PortfolioDashboardScreen";

const EMPTY_PROFILE: InvestorProfile = {
  fullName: "",
  investmentGoal: "",
  riskPreference: "",
  investmentTimeframe: "",
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function App() {
  const [step, setStep] = useState<AppStep>("landing");
  const [profile, setProfile] = useState<InvestorProfile>(EMPTY_PROFILE);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [lastAdded, setLastAdded] = useState<Holding | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loginError, setLoginError] = useState<string | undefined>();
  const [appError, setAppError] = useState<string | undefined>();
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadAccountData = useCallback(async (activeSession: Session) => {
    setIsLoadingData(true);
    setAppError(undefined);

    try {
      const [profileResult, holdingsResult] = await Promise.allSettled([
        getInvestorProfile(activeSession),
        getHoldings(activeSession),
      ]);

      if (holdingsResult.status === "fulfilled") {
        setHoldings(holdingsResult.value);
      } else {
        setHoldings([]);
        setAppError(errorMessage(holdingsResult.reason, "Your holdings could not be loaded."));
      }

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
        setStep("dashboard");
      } else if (profileResult.reason instanceof ApiError && profileResult.reason.status === 404) {
        setProfile(EMPTY_PROFILE);
        setStep("profile");
      } else {
        setProfile(EMPTY_PROFILE);
        setStep("profile");
        setAppError(errorMessage(profileResult.reason, "Your profile could not be loaded."));
      }
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    clearLegacyDemoData();

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        void loadAccountData(data.session);
      } else {
        setIsLoadingData(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        void loadAccountData(nextSession);
      } else {
        setProfile(EMPTY_PROFILE);
        setHoldings([]);
        setLastAdded(null);
        setAppError(undefined);
        setIsLoadingData(false);
        setStep("landing");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [loadAccountData]);

  const handleNavigateToSignUp = useCallback(() => {
    setLoginError(undefined);
    setAppError(undefined);
    setStep("signup");
  }, []);

  const handleNavigateToSignIn = useCallback(() => {
    setLoginError(undefined);
    setAppError(undefined);
    setStep("login");
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string): Promise<string | undefined> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data.session ? undefined : "Check your email to confirm your account, then sign in.";
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setLoginError(undefined);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      throw error;
    }
  }, []);

  const handleSaveProfile = useCallback(async (submittedProfile: InvestorProfile) => {
    if (!session) throw new Error("Your session has expired. Please sign in again.");
    const savedProfile = await saveInvestorProfile(session, submittedProfile);
    setProfile(savedProfile);
    setAppError(undefined);
    setStep("add-etf");
  }, [session]);

  const handleAddHolding = useCallback(async (holding: Omit<Holding, "id" | "addedAt">) => {
    if (!session) throw new Error("Your session has expired. Please sign in again.");
    const savedHolding = await createHolding(session, holding);
    setHoldings((previous) => [...previous, savedHolding]);
    setLastAdded(savedHolding);
    setAppError(undefined);
    setStep("success");
  }, [session]);

  const handleDeleteHolding = useCallback(async (id: string) => {
    if (!session) throw new Error("Your session has expired. Please sign in again.");
    await deleteHolding(session, id);
    setHoldings((previous) => previous.filter((holding) => holding.id !== id));
    setAppError(undefined);
  }, [session]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <p className="text-sm text-slate-500">Loading your MyETFHub account…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentStep={step} onLogout={() => void handleLogout()} />
      <main className="flex-1">
        {appError && session && (
          <div className="max-w-4xl mx-auto px-4 pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600">{appError}</p>
            </div>
          </div>
        )}

        {step === "landing" && <LandingPage onSignUp={handleNavigateToSignUp} onSignIn={handleNavigateToSignIn} />}
        {step === "signup" && <SignUpScreen onSignUp={handleSignUp} onNavigateToSignIn={handleNavigateToSignIn} />}
        {step === "login" && <LoginScreen onLogin={handleLogin} onNavigateToSignUp={handleNavigateToSignUp} loginError={loginError} />}
        {step === "profile" && <InvestorProfileScreen initialData={profile} onSave={handleSaveProfile} />}
        {step === "add-etf" && <AddETFScreen onAdd={handleAddHolding} onViewPortfolio={() => setStep("dashboard")} />}
        {step === "success" && lastAdded && <SuccessScreen holding={lastAdded} onViewPortfolio={() => setStep("dashboard")} onAddAnother={() => setStep("add-etf")} />}
        {step === "dashboard" && <PortfolioDashboardScreen holdings={holdings} investorName={profile.fullName} onAddNew={() => setStep("add-etf")} onDelete={handleDeleteHolding} />}
      </main>
      <Footer />
    </div>
  );
}