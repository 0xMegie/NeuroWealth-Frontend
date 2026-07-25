import {
  ServiceError,
  ServiceResponse,
  ServiceException,
  ServiceConfig,
  ServiceErrorCode,
} from "./types";
import { random, randomInt as seededRandomInt } from "../seeded-rng";

const DEFAULT_CONFIG: ServiceConfig = {
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  simulateLatency: true,
  latencyRange: [200, 800],
  simulateFailure: false,
  failureRate: 0.1,
};

function generateRequestId(): string {
  return `req_${Date.now()}_${random().toString(36).substr(2, 9)}`;
}

function randomInRange(min: number, max: number): number {
  return seededRandomInt(min, max + 1);
}

async function simulateLatency(config: ServiceConfig): Promise<void> {
  if (!config.simulateLatency) return;
  const [min, max] = config.latencyRange || DEFAULT_CONFIG.latencyRange!;
  const delay = randomInRange(min, max);
  await new Promise((resolve) => setTimeout(resolve, delay));
}

function shouldSimulateFailure(config: ServiceConfig): boolean {
  if (!config.simulateFailure) return false;
  const failureRate = config.failureRate || DEFAULT_CONFIG.failureRate!;
  return random() < failureRate;
}

function createServiceError(
  code: ServiceErrorCode,
  message: string,
  details?: any
): ServiceError {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
}

export abstract class BaseAdapter {
  protected config: ServiceConfig;

  constructor(config: Partial<ServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    const maxAttempts = this.config.retryAttempts || DEFAULT_CONFIG.retryAttempts!;
    const retryDelay = this.config.retryDelay || DEFAULT_CONFIG.retryDelay!;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await simulateLatency(this.config);

        if (shouldSimulateFailure(this.config)) {
          throw new ServiceException(
            createServiceError(
              "SERVER_ERROR",
              `Simulated failure in ${context}`,
              { attempt }
            )
          );
        }

        const result = await operation();
        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          throw new ServiceException(
            createServiceError(
              "TIMEOUT",
              `Operation failed after ${maxAttempts} attempts: ${context}`,
              { originalError: lastError.message }
            )
          );
        }

        // Exponential backoff
        const backoffDelay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }

    throw lastError || new Error("Unknown error in executeWithRetry");
  }

  protected createResponse<T>(data: T): ServiceResponse<T> {
    return {
      data,
      meta: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
    };
  }

  protected handleError(error: any, context: string): never {
    if (error instanceof ServiceException) {
      throw error;
    }

    const code: ServiceErrorCode = this.mapErrorToCode(error);
    throw new ServiceException(
      createServiceError(code, `Error in ${context}: ${error.message}`, {
        originalError: error.message,
      })
    );
  }

  private mapErrorToCode(error: any): ServiceErrorCode {
    if (error.code === "NETWORK_ERROR") return "NETWORK_ERROR";
    if (error.code === "TIMEOUT") return "TIMEOUT";
    if (error.code === "UNAUTHORIZED") return "UNAUTHORIZED";
    if (error.code === "FORBIDDEN") return "FORBIDDEN";
    if (error.code === "NOT_FOUND") return "NOT_FOUND";
    if (error.code === "VALIDATION_ERROR") return "VALIDATION_ERROR";
    return "SERVER_ERROR";
  }

  public updateConfig(config: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): ServiceConfig {
    return { ...this.config };
  }
}
