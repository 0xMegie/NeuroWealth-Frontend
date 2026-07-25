import { BaseAdapter } from "./base-adapter";
import { ServiceResponse, PaginatedResponse, PaginationParams } from "./types";
import { random } from "../seeded-rng";

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalValueChange24h: number;
  totalValueChange24hPercent: number;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  value: number;
  valueChange24h: number;
  valueChange24hPercent: number;
}

export interface PortfolioHistory {
  date: string;
  value: number;
}

export class PortfolioService extends BaseAdapter {
  private mockPortfolios: Map<string, Portfolio> = new Map();
  private mockHistory: Map<string, PortfolioHistory[]> = new Map();

  constructor() {
    super();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockPortfolio: Portfolio = {
      id: "portfolio_1",
      userId: "user_1",
      totalValue: 15000.50,
      totalValueChange24h: 250.75,
      totalValueChange24hPercent: 1.7,
      assets: [
        {
          id: "asset_1",
          symbol: "USDC",
          name: "USD Coin",
          balance: 10000,
          value: 10000,
          valueChange24h: 0,
          valueChange24hPercent: 0,
        },
        {
          id: "asset_2",
          symbol: "XLM",
          name: "Stellar",
          balance: 2500,
          value: 5000.50,
          valueChange24h: 250.75,
          valueChange24hPercent: 5.3,
        },
      ],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.mockPortfolios.set("user_1", mockPortfolio);

    // Generate mock history data
    const history: PortfolioHistory[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const value = 10000 + random() * 5000;
      history.push({
        date: date.toISOString(),
        value,
      });
    }
    this.mockHistory.set("portfolio_1", history);
  }

  async getPortfolio(userId: string): Promise<ServiceResponse<Portfolio>> {
    return this.executeWithRetry(async () => {
      const portfolio = this.mockPortfolios.get(userId);

      if (!portfolio) {
        throw new Error("Portfolio not found");
      }

      return this.createResponse(portfolio);
    }, "PortfolioService.getPortfolio");
  }

  async getPortfolioHistory(
    userId: string,
    params: PaginationParams
  ): Promise<ServiceResponse<PaginatedResponse<PortfolioHistory>>> {
    return this.executeWithRetry(async () => {
      const history = this.mockHistory.get(`portfolio_${userId.replace("user_", "")}`);

      if (!history) {
        throw new Error("Portfolio history not found");
      }

      const startIndex = (params.page - 1) * params.limit;
      const endIndex = startIndex + params.limit;
      const paginatedItems = history.slice(startIndex, endIndex);

      return this.createResponse({
        items: paginatedItems,
        total: history.length,
        page: params.page,
        limit: params.limit,
        hasMore: endIndex < history.length,
      });
    }, "PortfolioService.getPortfolioHistory");
  }

  async updatePortfolio(userId: string): Promise<ServiceResponse<Portfolio>> {
    return this.executeWithRetry(async () => {
      const portfolio = this.mockPortfolios.get(userId);

      if (!portfolio) {
        throw new Error("Portfolio not found");
      }

      // Simulate value changes
      portfolio.totalValue = portfolio.totalValue * (1 + (random() - 0.5) * 0.02);
      portfolio.totalValueChange24h = portfolio.totalValue * (random() - 0.5) * 0.05;
      portfolio.totalValueChange24hPercent = (portfolio.totalValueChange24h / portfolio.totalValue) * 100;
      portfolio.updatedAt = new Date().toISOString();

      // Update asset values
      portfolio.assets = portfolio.assets.map((asset) => ({
        ...asset,
        value: asset.value * (1 + (random() - 0.5) * 0.03),
        valueChange24h: asset.value * (random() - 0.5) * 0.05,
        valueChange24hPercent: (asset.valueChange24h / asset.value) * 100,
      }));

      this.mockPortfolios.set(userId, portfolio);

      return this.createResponse(portfolio);
    }, "PortfolioService.updatePortfolio");
  }

  async addAsset(
    userId: string,
    asset: Omit<Asset, "id" | "value" | "valueChange24h" | "valueChange24hPercent">
  ): Promise<ServiceResponse<Portfolio>> {
    return this.executeWithRetry(async () => {
      const portfolio = this.mockPortfolios.get(userId);

      if (!portfolio) {
        throw new Error("Portfolio not found");
      }

      const newAsset: Asset = {
        ...asset,
        id: `asset_${Date.now()}`,
        value: asset.balance * 1, // Simplified valuation
        valueChange24h: 0,
        valueChange24hPercent: 0,
      };

      portfolio.assets.push(newAsset);
      portfolio.totalValue = portfolio.assets.reduce((sum, a) => sum + a.value, 0);
      portfolio.updatedAt = new Date().toISOString();

      this.mockPortfolios.set(userId, portfolio);

      return this.createResponse(portfolio);
    }, "PortfolioService.addAsset");
  }

  async removeAsset(userId: string, assetId: string): Promise<ServiceResponse<Portfolio>> {
    return this.executeWithRetry(async () => {
      const portfolio = this.mockPortfolios.get(userId);

      if (!portfolio) {
        throw new Error("Portfolio not found");
      }

      const assetIndex = portfolio.assets.findIndex((a) => a.id === assetId);

      if (assetIndex === -1) {
        throw new Error("Asset not found");
      }

      portfolio.assets.splice(assetIndex, 1);
      portfolio.totalValue = portfolio.assets.reduce((sum, a) => sum + a.value, 0);
      portfolio.updatedAt = new Date().toISOString();

      this.mockPortfolios.set(userId, portfolio);

      return this.createResponse(portfolio);
    }, "PortfolioService.removeAsset");
  }
}

// Singleton instance
export const portfolioService = new PortfolioService();
