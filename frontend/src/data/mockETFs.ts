import type { MockETF } from "../types";

export const MOCK_ETF_CATALOG: MockETF[] = [
  {
    ticker: "VAS",
    name: "Vanguard Australian Shares Index ETF",
    sector: "Australian Equities",
    defaultPrice: 109.33,
  },
  {
    ticker: "VGS",
    name: "Vanguard MSCI International Shares ETF",
    sector: "International Equities",
    defaultPrice: 160.03,
  },
  {
    ticker: "A200",
    name: "BetaShares Australia 200 ETF",
    sector: "Australian Equities",
    defaultPrice: 147.5,
  },
  {
    ticker: "IOZ",
    name: "iShares Core S&P/ASX 200 ETF",
    sector: "Australian Equities",
    defaultPrice: 36.8,
  },
  {
    ticker: "NDQ",
    name: "BetaShares NASDAQ 100 ETF",
    sector: "International Equities",
    defaultPrice: 54.2,
  },
];