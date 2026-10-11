export interface InvestorProfile {
  fullName: string;
  investmentGoal: "capital-growth" | "income-generation" | "capital-preservation" | "";
  riskPreference: "conservative" | "moderate" | "aggressive" | "";
  investmentTimeframe: "short-term" | "medium-term" | "long-term" | "";
}

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  units: number;
  purchasePrice: number;
  purchaseDate: string;
  addedAt: string;
}

export interface MockETF {
  ticker: string;
  name: string;
  sector: string;
  defaultPrice: number;
}

export type AppStep =
  | "landing"
  | "signup"
  | "login"
  | "profile"
  | "add-etf"
  | "success"
  | "dashboard";