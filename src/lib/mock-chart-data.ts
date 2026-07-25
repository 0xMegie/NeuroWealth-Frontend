import { randomInt } from "./seeded-rng";
import type { ChartTone } from "./portfolio";

// Chart input types modelled on real domain concepts rather than a loose
// `{ name; value; [key: string]: any }` shape. Each chart consumes the
// specific datum type it actually renders.

/** Base datum for single-series charts: a label and a numeric value. */
export interface ChartDatum {
  name: string;
  value: number;
}

/** Portfolio value at a point in time, plus the yield earned that period. */
export interface PortfolioValuePoint extends ChartDatum {
  /** Yield earned during the period, in the portfolio's base currency. */
  yield: number;
}

/** A slice of the asset-allocation donut, themed by tone. */
export interface AssetAllocationSlice extends ChartDatum {
  tone?: ChartTone;
}

/** Portfolio value vs. a benchmark for a given period (multi-series line). */
export interface BenchmarkComparisonPoint {
  name: string;
  portfolio: number;
  benchmark: number;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Line/Area chart data: Portfolio value over time
export const portfolioValueData: PortfolioValuePoint[] = months.map((month, i) => {
  const baseValue = 10000 + (i * 450);
  const noise = randomInt(-300, 300);
  return {
    name: month,
    value: baseValue + noise,
    yield: randomInt(80, 450),
  };
});

// Bar chart data: Monthly yield
export const monthlyYieldData: ChartDatum[] = portfolioValueData.map((p) => ({
  name: p.name,
  value: p.yield,
}));

// Donut chart data: Asset allocation
export const assetAllocationData: AssetAllocationSlice[] = [
  { name: "USDC", value: randomInt(35, 50), tone: "primary" },
  { name: "USDT", value: randomInt(20, 30), tone: "accent" },
  { name: "XLM", value: randomInt(15, 25), tone: "warning" },
  { name: "Other", value: randomInt(5, 15), tone: "neutral-strong" },
];

// Time series data for multiple lines
export const multiLineData: BenchmarkComparisonPoint[] = months.map((month, i) => {
  const portfolio = portfolioValueData[i].value;
  const benchmarkBase = 9800 + (i * 400);
  return {
    name: month,
    portfolio,
    benchmark: benchmarkBase + randomInt(-200, 200),
  };
});

// Categorical bar data
export const categoricalBarData: ChartDatum[] = [
  { name: "Deposits", value: randomInt(12000, 18000) },
  { name: "Withdrawals", value: randomInt(2000, 5000) },
  { name: "Yield", value: randomInt(2000, 3500) },
  { name: "Fees", value: randomInt(100, 300) },
];
