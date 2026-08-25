export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig,
): number {
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(exponentialDelay, config.maxDelayMs);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function handleError(error: unknown): ServiceError {
  if (error instanceof ServiceError) {
    return error;
  }

  if (error instanceof Error) {
    return new ServiceError(error.message, "UNKNOWN_ERROR");
  }

  if (typeof error === "string") {
    return new ServiceError(error, "UNKNOWN_ERROR");
  }

  return new ServiceError(
    "An unknown error occurred",
    "UNKNOWN_ERROR",
  );
}

export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  let lastError: ServiceError | null = null;

  for (let attempt = 1; attempt <= mergedConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = handleError(error);

      if (attempt === mergedConfig.maxAttempts) {
        throw lastError;
      }

      const backoffMs = calculateBackoffDelay(attempt, mergedConfig);
      await delay(backoffMs);
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new ServiceError("Retry exhausted", "RETRY_EXHAUSTED");
}

export async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new ServiceError("Operation timed out", "TIMEOUT")),
        timeoutMs,
      ),
    ),
  ]);
}

export async function executeWithRetryAndTimeout<T>(
  fn: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {},
  timeoutPerAttemptMs: number = 10000,
): Promise<T> {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

  let lastError: ServiceError | null = null;

  for (let attempt = 1; attempt <= mergedConfig.maxAttempts; attempt++) {
    try {
      return await executeWithTimeout(fn, timeoutPerAttemptMs);
    } catch (error) {
      lastError = handleError(error);

      if (attempt === mergedConfig.maxAttempts) {
        throw lastError;
      }

      const backoffMs = calculateBackoffDelay(attempt, mergedConfig);
      await delay(backoffMs);
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new ServiceError("Retry exhausted", "RETRY_EXHAUSTED");
}
