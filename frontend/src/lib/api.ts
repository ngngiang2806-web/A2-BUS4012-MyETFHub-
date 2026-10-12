import type { Session } from "@supabase/supabase-js";
import { MOCK_ETF_CATALOG } from "../data/mockETFs";
import type { Holding, InvestorProfile } from "../types";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!configuredApiBaseUrl) {
  throw new Error("API is not configured. Set VITE_API_BASE_URL in .env.");
}

// API paths below always start with "/". Normalising the configured base URL
// prevents a trailing slash in a deployment variable from producing a redirect
// during the browser's CORS preflight request.
const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiProfile {
  id: string;
  user_id: string;
  email_address: string;
  full_name: string;
  investment_goal: InvestorProfile["investmentGoal"];
  risk_preference: InvestorProfile["riskPreference"];
  investment_timeframe: InvestorProfile["investmentTimeframe"];
  created_at: string;
  updated_at: string;
}

interface ApiHolding {
  holding_id: string;
  user_id: string;
  ticker: string;
  units: string | number;
  purchase_price: string | number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

function profileFromApi(profile: ApiProfile): InvestorProfile {
  return {
    fullName: profile.full_name,
    investmentGoal: profile.investment_goal,
    riskPreference: profile.risk_preference,
    investmentTimeframe: profile.investment_timeframe,
  };
}

function holdingFromApi(holding: ApiHolding): Holding {
  const catalogueEntry = MOCK_ETF_CATALOG.find((etf) => etf.ticker === holding.ticker);
  return {
    id: holding.holding_id,
    ticker: holding.ticker,
    name: catalogueEntry?.name ?? holding.ticker,
    units: Number(holding.units),
    purchasePrice: Number(holding.purchase_price),
    purchaseDate: holding.purchase_date,
    addedAt: holding.created_at,
  };
}

async function request<T>(session: Session, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    let message = "The request could not be completed. Please try again.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      // Keep the safe fallback message if the error response is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export async function getInvestorProfile(session: Session): Promise<InvestorProfile> {
  return profileFromApi(await request<ApiProfile>(session, "/investor-profile"));
}

export async function saveInvestorProfile(session: Session, profile: InvestorProfile): Promise<InvestorProfile> {
  const saved = await request<ApiProfile>(session, "/investor-profile", {
    method: "POST",
    body: JSON.stringify({
      email_address: session.user.email,
      full_name: profile.fullName,
      investment_goal: profile.investmentGoal,
      risk_preference: profile.riskPreference,
      investment_timeframe: profile.investmentTimeframe,
    }),
  });
  return profileFromApi(saved);
}

export async function getHoldings(session: Session): Promise<Holding[]> {
  const holdings = await request<ApiHolding[]>(session, "/etf-holdings");
  return holdings.map(holdingFromApi);
}

export async function createHolding(
  session: Session,
  holding: Pick<Holding, "ticker" | "units" | "purchasePrice" | "purchaseDate">
): Promise<Holding> {
  const saved = await request<ApiHolding>(session, "/etf-holdings", {
    method: "POST",
    body: JSON.stringify({
      ticker: holding.ticker,
      units: holding.units,
      purchase_price: holding.purchasePrice,
      purchase_date: holding.purchaseDate,
    }),
  });
  return holdingFromApi(saved);
}

export async function deleteHolding(session: Session, holdingId: string): Promise<void> {
  await request<{ message: string }>(session, `/etf-holdings/${holdingId}`, { method: "DELETE" });
}