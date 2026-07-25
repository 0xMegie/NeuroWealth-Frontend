# Service Layer - Adapter Contract Documentation

This document describes the adapter pattern for integrating the mock service layer with a real backend API.

## Overview

The service layer follows an adapter pattern that allows easy swapping between mock implementations and real backend services. All services extend the `BaseAdapter` class which provides:

- Retry logic with exponential backoff
- Simulated latency (configurable)
- Simulated failure scenarios (configurable)
- Centralized error handling
- Request/response logging

## Architecture

```
BaseAdapter (abstract)
    ├── AuthService
    ├── PortfolioService
    ├── StrategyService
    └── TransactionService
```

## Adapter Contract

### BaseAdapter Interface

All service adapters must extend `BaseAdapter` and implement the following pattern:

```typescript
class MyService extends BaseAdapter {
  constructor() {
    super(config);
  }

  async myMethod(params: T): Promise<ServiceResponse<R>> {
    return this.executeWithRetry(async () => {
      // Implementation logic
      return this.createResponse(data);
    }, "MyService.myMethod");
  }
}
```

### Required Methods

Each service adapter should implement:

1. **CRUD Operations** - Create, Read, Update, Delete as appropriate
2. **Error Handling** - Use `this.handleError()` for consistent error responses
3. **Response Format** - Use `this.createResponse()` for consistent response structure

### Response Format

All services return `ServiceResponse<T>`:

```typescript
interface ServiceResponse<T> {
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
    version?: string;
  };
}
```

### Error Handling

All errors are thrown as `ServiceException` with standardized error codes:

```typescript
type ServiceErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";
```

## Backend Integration Guide

### Step 1: Create Real Service Implementation

Create a new service class that extends `BaseAdapter` but makes real API calls:

```typescript
import { BaseAdapter } from "./base-adapter";
import { ServiceResponse } from "./types";

class RealAuthService extends BaseAdapter {
  private apiClient: ApiClient; // Your HTTP client

  constructor(apiClient: ApiClient) {
    super({ simulateLatency: false, simulateFailure: false });
    this.apiClient = apiClient;
  }

  async login(credentials: LoginCredentials): Promise<ServiceResponse<AuthSession>> {
    return this.executeWithRetry(async () => {
      const response = await this.apiClient.post('/auth/login', credentials);
      return this.createResponse(response.data);
    }, "RealAuthService.login");
  }
}
```

### Step 2: Configure Service Switching

Create a service factory to switch between mock and real implementations:

```typescript
// lib/service-layer/factory.ts
const USE_MOCK_SERVICES = process.env.NEXT_PUBLIC_USE_MOCK_SERVICES === 'true';

export const authService = USE_MOCK_SERVICES
  ? new AuthService()
  : new RealAuthService(apiClient);

export const portfolioService = USE_MOCK_SERVICES
  ? new PortfolioService()
  : new RealPortfolioService(apiClient);
```

### Step 3: Update Environment Variables

Add to `.env`:

```env
NEXT_PUBLIC_USE_MOCK_SERVICES=false
NEXT_PUBLIC_API_BASE_URL=https://api.neurowealth.app
```

### Step 4: API Client Configuration

Configure your HTTP client (e.g., axios, fetch) with:

- Base URL from environment
- Authentication headers
- Request/response interceptors
- Timeout handling

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  // Add auth token
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle API errors
    throw new ServiceException({
      code: mapApiErrorToCode(error),
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
);
```

## Service-Specific Contracts

### AuthService

**Methods:**
- `login(credentials: LoginCredentials)` - Authenticate user
- `signup(credentials: SignupCredentials)` - Register new user
- `logout(token: string)` - End user session
- `refreshToken(refreshToken: string)` - Refresh access token
- `verifyEmail(token: string)` - Verify user email
- `resetPassword(email: string)` - Initiate password reset

**API Endpoints (for backend):**
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/verify-email`
- `POST /auth/reset-password`

### PortfolioService

**Methods:**
- `getPortfolio(userId: string)` - Get user portfolio
- `getPortfolioHistory(userId, params)` - Get portfolio history with pagination
- `updatePortfolio(userId: string)` - Refresh portfolio data
- `addAsset(userId, asset)` - Add asset to portfolio
- `removeAsset(userId, assetId)` - Remove asset from portfolio

**API Endpoints (for backend):**
- `GET /portfolios/:userId`
- `GET /portfolios/:userId/history`
- `PUT /portfolios/:userId`
- `POST /portfolios/:userId/assets`
- `DELETE /portfolios/:userId/assets/:assetId`

### StrategyService

**Methods:**
- `getStrategies()` - List available strategies
- `getStrategy(strategyId: string)` - Get strategy details
- `getUserAllocations(userId, params)` - Get user's strategy allocations
- `createAllocation(userId, strategyId, amount)` - Allocate to strategy
- `cancelAllocation(userId, allocationId)` - Cancel allocation
- `getStrategyPerformance(strategyId, params)` - Get strategy performance

**API Endpoints (for backend):**
- `GET /strategies`
- `GET /strategies/:strategyId`
- `GET /users/:userId/allocations`
- `POST /users/:userId/allocations`
- `DELETE /users/:userId/allocations/:allocationId`
- `GET /strategies/:strategyId/performance`

### TransactionService

**Methods:**
- `createTransaction(userId, params)` - Create new transaction
- `getTransaction(userId, transactionId)` - Get transaction details
- `getUserTransactions(userId, params)` - List user transactions with filters
- `cancelTransaction(userId, transactionId)` - Cancel pending transaction
- `getTransactionStats(userId)` - Get transaction statistics

**API Endpoints (for backend):**
- `POST /transactions`
- `GET /transactions/:transactionId`
- `GET /users/:userId/transactions`
- `DELETE /transactions/:transactionId`
- `GET /users/:userId/transactions/stats`

## Configuration

### Service Config Options

```typescript
interface ServiceConfig {
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  simulateLatency?: boolean;
  latencyRange?: [number, number];
  simulateFailure?: boolean;
  failureRate?: number;
}
```

### Example Configuration

```typescript
// Development (mock)
const devConfig = {
  simulateLatency: true,
  latencyRange: [200, 800],
  simulateFailure: false,
};

// Production (real)
const prodConfig = {
  simulateLatency: false,
  simulateFailure: false,
  baseUrl: 'https://api.neurowealth.app',
  timeout: 10000,
  retryAttempts: 3,
};
```

## Testing

### Unit Testing

Mock services can be tested directly:

```typescript
import { authService } from '@/lib/service-layer/auth-service';

describe('AuthService', () => {
  it('should login successfully', async () => {
    const result = await authService.login({
      email: 'user@example.com',
      password: 'password',
    });
    expect(result.data.user.email).toBe('user@example.com');
  });
});
```

### Integration Testing

Test with real API by switching to real services:

```typescript
describe('AuthService Integration', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_USE_MOCK_SERVICES = 'false';
  });

  it('should login with real API', async () => {
    // Test real API integration
  });
});
```

## Migration Checklist

- [ ] Create real service implementations
- [ ] Configure API client
- [ ] Set up environment variables
- [ ] Implement service factory
- [ ] Add API error mapping
- [ ] Update authentication flow
- [ ] Test with mock services disabled
- [ ] Test retry logic with real network failures
- [ ] Update documentation
- [ ] Monitor error rates in production

## Notes

- Mock services use in-memory storage; data is lost on refresh
- Real services should implement proper caching strategies
- Consider implementing request deduplication for concurrent requests
- Add proper logging for debugging in production
- Monitor API response times and adjust retry logic accordingly
