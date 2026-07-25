import { BaseAdapter } from "./base-adapter";
import { ServiceResponse, PaginatedResponse, PaginationParams } from "./types";
import { random } from "../seeded-rng";

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "transfer" | "strategy_allocation" | "strategy_return";
  amount: number;
  asset: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  fromAddress?: string;
  toAddress?: string;
  txHash?: string;
  fee?: number;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface CreateTransactionParams {
  type: Transaction["type"];
  amount: number;
  asset: string;
  fromAddress?: string;
  toAddress?: string;
  metadata?: Record<string, any>;
}

export interface TransactionFilter {
  type?: Transaction["type"];
  status?: Transaction["status"];
  asset?: string;
  startDate?: string;
  endDate?: string;
}

export class TransactionService extends BaseAdapter {
  private mockTransactions: Map<string, Transaction[]> = new Map();

  constructor() {
    super();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const transactions: Transaction[] = [
      {
        id: "tx_1",
        userId: "user_1",
        type: "deposit",
        amount: 10000,
        asset: "USDC",
        status: "completed",
        fromAddress: "GD...1234",
        toAddress: "GA...5678",
        txHash: "0x" + random().toString(16).substr(2, 64),
        fee: 0.01,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5000).toISOString(),
      },
      {
        id: "tx_2",
        userId: "user_1",
        type: "strategy_allocation",
        amount: 5000,
        asset: "USDC",
        status: "completed",
        toAddress: "GA...9012",
        txHash: "0x" + random().toString(16).substr(2, 64),
        fee: 0.02,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 10000).toISOString(),
        metadata: { strategyId: "strategy_1" },
      },
      {
        id: "tx_3",
        userId: "user_1",
        type: "withdrawal",
        amount: 500,
        asset: "USDC",
        status: "pending",
        toAddress: "GD...3456",
        fee: 0.015,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ];

    this.mockTransactions.set("user_1", transactions);
  }

  async createTransaction(
    userId: string,
    params: CreateTransactionParams
  ): Promise<ServiceResponse<Transaction>> {
    return this.executeWithRetry(async () => {
      const transaction: Transaction = {
        id: `tx_${Date.now()}`,
        userId,
        type: params.type,
        amount: params.amount,
        asset: params.asset,
        status: "pending",
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        fee: this.calculateFee(params.type, params.amount),
        createdAt: new Date().toISOString(),
        metadata: params.metadata,
      };

      const userTransactions = this.mockTransactions.get(userId) || [];
      userTransactions.unshift(transaction);
      this.mockTransactions.set(userId, userTransactions);

      // Simulate transaction processing
      this.simulateTransactionProcessing(userId, transaction.id);

      return this.createResponse(transaction);
    }, "TransactionService.createTransaction");
  }

  async getTransaction(
    userId: string,
    transactionId: string
  ): Promise<ServiceResponse<Transaction>> {
    return this.executeWithRetry(async () => {
      const transactions = this.mockTransactions.get(userId) || [];
      const transaction = transactions.find((t) => t.id === transactionId);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      return this.createResponse(transaction);
    }, "TransactionService.getTransaction");
  }

  async getUserTransactions(
    userId: string,
    params: PaginationParams & { filter?: TransactionFilter }
  ): Promise<ServiceResponse<PaginatedResponse<Transaction>>> {
    return this.executeWithRetry(async () => {
      let transactions = this.mockTransactions.get(userId) || [];

      // Apply filters
      if (params.filter) {
        if (params.filter.type) {
          transactions = transactions.filter((t) => t.type === params.filter!.type);
        }
        if (params.filter.status) {
          transactions = transactions.filter((t) => t.status === params.filter!.status);
        }
        if (params.filter.asset) {
          transactions = transactions.filter((t) => t.asset === params.filter!.asset);
        }
        if (params.filter.startDate) {
          transactions = transactions.filter(
            (t) => new Date(t.createdAt) >= new Date(params.filter!.startDate!)
          );
        }
        if (params.filter.endDate) {
          transactions = transactions.filter(
            (t) => new Date(t.createdAt) <= new Date(params.filter!.endDate!)
          );
        }
      }

      const startIndex = (params.page - 1) * params.limit;
      const endIndex = startIndex + params.limit;
      const paginatedItems = transactions.slice(startIndex, endIndex);

      return this.createResponse({
        items: paginatedItems,
        total: transactions.length,
        page: params.page,
        limit: params.limit,
        hasMore: endIndex < transactions.length,
      });
    }, "TransactionService.getUserTransactions");
  }

  async cancelTransaction(
    userId: string,
    transactionId: string
  ): Promise<ServiceResponse<Transaction>> {
    return this.executeWithRetry(async () => {
      const transactions = this.mockTransactions.get(userId) || [];
      const transaction = transactions.find((t) => t.id === transactionId);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status !== "pending") {
        throw new Error("Cannot cancel transaction in current state");
      }

      transaction.status = "cancelled";
      this.mockTransactions.set(userId, transactions);

      return this.createResponse(transaction);
    }, "TransactionService.cancelTransaction");
  }

  async getTransactionStats(
    userId: string
  ): Promise<ServiceResponse<{
    totalVolume: number;
    totalTransactions: number;
    completedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
  }>> {
    return this.executeWithRetry(async () => {
      const transactions = this.mockTransactions.get(userId) || [];

      const stats = {
        totalVolume: transactions
          .filter((t) => t.status === "completed")
          .reduce((sum, t) => sum + t.amount, 0),
        totalTransactions: transactions.length,
        completedTransactions: transactions.filter((t) => t.status === "completed").length,
        pendingTransactions: transactions.filter((t) => t.status === "pending").length,
        failedTransactions: transactions.filter((t) => t.status === "failed").length,
      };

      return this.createResponse(stats);
    }, "TransactionService.getTransactionStats");
  }

  private calculateFee(type: Transaction["type"], amount: number): number {
    // Simplified fee calculation
    const baseFee = 0.01;
    const percentageFee = amount * 0.001;
    return Math.max(baseFee, percentageFee);
  }

  private async simulateTransactionProcessing(
    userId: string,
    transactionId: string
  ): Promise<void> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const transactions = this.mockTransactions.get(userId) || [];
    const transaction = transactions.find((t) => t.id === transactionId);

    if (!transaction || transaction.status !== "pending") {
      return;
    }

    // Simulate 90% success rate
    const isSuccess = random() < 0.9;

    transaction.status = isSuccess ? "processing" : "failed";
    this.mockTransactions.set(userId, transactions);

    if (isSuccess) {
      // Simulate completion
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedTransactions = this.mockTransactions.get(userId) || [];
      const updatedTransaction = updatedTransactions.find((t) => t.id === transactionId);

      if (updatedTransaction) {
        updatedTransaction.status = "completed";
        updatedTransaction.completedAt = new Date().toISOString();
        updatedTransaction.txHash = "0x" + random().toString(16).substr(2, 64);
        this.mockTransactions.set(userId, updatedTransactions);
      }
    }
  }
}

// Singleton instance
export const transactionService = new TransactionService();
