import { BaseAdapter } from "./base-adapter";
import { ServiceResponse, PaginatedResponse, PaginationParams } from "./types";
import { random } from "../seeded-rng";

export interface Strategy {
  id: string;
  name: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  expectedApy: number;
  minDeposit: number;
  maxDeposit: number;
  lockPeriod: number; // in days
  isActive: boolean;
  createdAt: string;
}

export interface StrategyAllocation {
  id: string;
  userId: string;
  strategyId: string;
  amount: number;
  status: "active" | "pending" | "completed" | "cancelled";
  startedAt: string;
  endsAt?: string;
  expectedReturn: number;
  actualReturn?: number;
}

export interface StrategyPerformance {
  strategyId: string;
  date: string;
  apy: number;
  totalValue: number;
}

export class StrategyService extends BaseAdapter {
  private mockStrategies: Map<string, Strategy> = new Map();
  private mockAllocations: Map<string, StrategyAllocation[]> = new Map();
  private mockPerformance: Map<string, StrategyPerformance[]> = new Map();

  constructor() {
    super();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const strategies: Strategy[] = [
      {
        id: "strategy_1",
        name: "Conservative Yield",
        description: "Low-risk strategy focusing on stable returns",
        riskLevel: "low",
        expectedApy: 5.5,
        minDeposit: 100,
        maxDeposit: 50000,
        lockPeriod: 30,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "strategy_2",
        name: "Balanced Growth",
        description: "Moderate risk with balanced growth potential",
        riskLevel: "medium",
        expectedApy: 12.5,
        minDeposit: 500,
        maxDeposit: 100000,
        lockPeriod: 90,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "strategy_3",
        name: "Aggressive Yield",
        description: "High-risk strategy for maximum returns",
        riskLevel: "high",
        expectedApy: 25.0,
        minDeposit: 1000,
        maxDeposit: 500000,
        lockPeriod: 180,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    strategies.forEach((strategy) => this.mockStrategies.set(strategy.id, strategy));

    // Mock allocations for user_1
    const allocations: StrategyAllocation[] = [
      {
        id: "alloc_1",
        userId: "user_1",
        strategyId: "strategy_1",
        amount: 5000,
        status: "active",
        startedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        expectedReturn: 5000 * 0.055 * (30 / 365),
        actualReturn: 5000 * 0.055 * (15 / 365),
      },
    ];

    this.mockAllocations.set("user_1", allocations);

    // Generate mock performance data
    strategies.forEach((strategy) => {
      const performance: StrategyPerformance[] = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const apy = strategy.expectedApy * (1 + (random() - 0.5) * 0.2);
        const totalValue = 10000 * (1 + apy / 100 * (30 - i) / 365);
        performance.push({
          strategyId: strategy.id,
          date: date.toISOString(),
          apy,
          totalValue,
        });
      }
      this.mockPerformance.set(strategy.id, performance);
    });
  }

  async getStrategies(): Promise<ServiceResponse<Strategy[]>> {
    return this.executeWithRetry(async () => {
      const strategies = Array.from(this.mockStrategies.values()).filter(
        (s) => s.isActive
      );
      return this.createResponse(strategies);
    }, "StrategyService.getStrategies");
  }

  async getStrategy(strategyId: string): Promise<ServiceResponse<Strategy>> {
    return this.executeWithRetry(async () => {
      const strategy = this.mockStrategies.get(strategyId);

      if (!strategy) {
        throw new Error("Strategy not found");
      }

      return this.createResponse(strategy);
    }, "StrategyService.getStrategy");
  }

  async getUserAllocations(
    userId: string,
    params: PaginationParams
  ): Promise<ServiceResponse<PaginatedResponse<StrategyAllocation>>> {
    return this.executeWithRetry(async () => {
      const allocations = this.mockAllocations.get(userId) || [];

      const startIndex = (params.page - 1) * params.limit;
      const endIndex = startIndex + params.limit;
      const paginatedItems = allocations.slice(startIndex, endIndex);

      return this.createResponse({
        items: paginatedItems,
        total: allocations.length,
        page: params.page,
        limit: params.limit,
        hasMore: endIndex < allocations.length,
      });
    }, "StrategyService.getUserAllocations");
  }

  async createAllocation(
    userId: string,
    strategyId: string,
    amount: number
  ): Promise<ServiceResponse<StrategyAllocation>> {
    return this.executeWithRetry(async () => {
      const strategy = this.mockStrategies.get(strategyId);

      if (!strategy) {
        throw new Error("Strategy not found");
      }

      if (amount < strategy.minDeposit) {
        throw new Error(`Minimum deposit is ${strategy.minDeposit}`);
      }

      if (amount > strategy.maxDeposit) {
        throw new Error(`Maximum deposit is ${strategy.maxDeposit}`);
      }

      const allocation: StrategyAllocation = {
        id: `alloc_${Date.now()}`,
        userId,
        strategyId,
        amount,
        status: "pending",
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + strategy.lockPeriod * 24 * 60 * 60 * 1000).toISOString(),
        expectedReturn: amount * (strategy.expectedApy / 100) * (strategy.lockPeriod / 365),
      };

      const userAllocations = this.mockAllocations.get(userId) || [];
      userAllocations.push(allocation);
      this.mockAllocations.set(userId, userAllocations);

      // Simulate activation after a delay
      setTimeout(() => {
        allocation.status = "active";
        this.mockAllocations.set(userId, userAllocations);
      }, 2000);

      return this.createResponse(allocation);
    }, "StrategyService.createAllocation");
  }

  async cancelAllocation(
    userId: string,
    allocationId: string
  ): Promise<ServiceResponse<StrategyAllocation>> {
    return this.executeWithRetry(async () => {
      const allocations = this.mockAllocations.get(userId) || [];
      const allocation = allocations.find((a) => a.id === allocationId);

      if (!allocation) {
        throw new Error("Allocation not found");
      }

      if (allocation.status !== "pending" && allocation.status !== "active") {
        throw new Error("Cannot cancel allocation in current state");
      }

      allocation.status = "cancelled";
      this.mockAllocations.set(userId, allocations);

      return this.createResponse(allocation);
    }, "StrategyService.cancelAllocation");
  }

  async getStrategyPerformance(
    strategyId: string,
    params: PaginationParams
  ): Promise<ServiceResponse<PaginatedResponse<StrategyPerformance>>> {
    return this.executeWithRetry(async () => {
      const performance = this.mockPerformance.get(strategyId);

      if (!performance) {
        throw new Error("Performance data not found");
      }

      const startIndex = (params.page - 1) * params.limit;
      const endIndex = startIndex + params.limit;
      const paginatedItems = performance.slice(startIndex, endIndex);

      return this.createResponse({
        items: paginatedItems,
        total: performance.length,
        page: params.page,
        limit: params.limit,
        hasMore: endIndex < performance.length,
      });
    }, "StrategyService.getStrategyPerformance");
  }
}

// Singleton instance
export const strategyService = new StrategyService();
