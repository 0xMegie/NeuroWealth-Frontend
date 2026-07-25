export type ServiceErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export interface ServiceError<T = any> {
  code: ServiceErrorCode;
  message: string;
  details?: T;
  timestamp: string;
  requestId?: string;
}

export class ServiceException extends Error {
  public readonly code: ServiceErrorCode;
  public readonly details?: any;
  public readonly timestamp: string;
  public readonly requestId?: string;

  constructor(error: ServiceError) {
    super(error.message);
    this.name = "ServiceException";
    this.code = error.code;
    this.details = error.details;
    this.timestamp = error.timestamp;
    this.requestId = error.requestId;
  }
}

export interface ServiceResponse<T> {
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
    version?: string;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ServiceConfig {
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  simulateLatency?: boolean;
  latencyRange?: [number, number];
  simulateFailure?: boolean;
  failureRate?: number;
}
