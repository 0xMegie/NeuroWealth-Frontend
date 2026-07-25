import { BaseAdapter } from "./base-adapter";
import { ServiceResponse } from "./types";
import { random } from "../seeded-rng";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  isVerified: boolean;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export class AuthService extends BaseAdapter {
  private mockUsers: Map<string, AuthUser> = new Map();
  private mockSessions: Map<string, AuthSession> = new Map();

  constructor() {
    super();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Add some mock users for testing
    this.mockUsers.set("user@example.com", {
      id: "user_1",
      email: "user@example.com",
      fullName: "Test User",
      createdAt: new Date().toISOString(),
      isVerified: true,
    });
  }

  async login(credentials: LoginCredentials): Promise<ServiceResponse<AuthSession>> {
    return this.executeWithRetry(async () => {
      const user = this.mockUsers.get(credentials.email);

      if (!user) {
        throw new Error("Invalid credentials");
      }

      if (!user.isVerified) {
        throw new Error("Email not verified");
      }

      const session: AuthSession = {
        user,
        token: this.generateToken(),
        refreshToken: this.generateToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      this.mockSessions.set(session.token, session);

      return this.createResponse(session);
    }, "AuthService.login");
  }

  async signup(credentials: SignupCredentials): Promise<ServiceResponse<AuthSession>> {
    return this.executeWithRetry(async () => {
      if (this.mockUsers.has(credentials.email)) {
        throw new Error("Email already registered");
      }

      const user: AuthUser = {
        id: `user_${Date.now()}`,
        email: credentials.email,
        fullName: credentials.fullName,
        createdAt: new Date().toISOString(),
        isVerified: false,
      };

      this.mockUsers.set(credentials.email, user);

      const session: AuthSession = {
        user,
        token: this.generateToken(),
        refreshToken: this.generateToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      this.mockSessions.set(session.token, session);

      return this.createResponse(session);
    }, "AuthService.signup");
  }

  async logout(token: string): Promise<ServiceResponse<{ success: boolean }>> {
    return this.executeWithRetry(async () => {
      this.mockSessions.delete(token);
      return this.createResponse({ success: true });
    }, "AuthService.logout");
  }

  async refreshToken(refreshToken: string): Promise<ServiceResponse<AuthSession>> {
    return this.executeWithRetry(async () => {
      const session = Array.from(this.mockSessions.values()).find(
        (s) => s.refreshToken === refreshToken
      );

      if (!session) {
        throw new Error("Invalid refresh token");
      }

      const newSession: AuthSession = {
        ...session,
        token: this.generateToken(),
        refreshToken: this.generateToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      this.mockSessions.delete(session.token);
      this.mockSessions.set(newSession.token, newSession);

      return this.createResponse(newSession);
    }, "AuthService.refreshToken");
  }

  async verifyEmail(token: string): Promise<ServiceResponse<{ success: boolean }>> {
    return this.executeWithRetry(async () => {
      const user = Array.from(this.mockUsers.values()).find((u) => u.id === token);

      if (!user) {
        throw new Error("Invalid verification token");
      }

      user.isVerified = true;
      this.mockUsers.set(user.email, user);

      return this.createResponse({ success: true });
    }, "AuthService.verifyEmail");
  }

  async resetPassword(email: string): Promise<ServiceResponse<{ success: boolean }>> {
    return this.executeWithRetry(async () => {
      if (!this.mockUsers.has(email)) {
        throw new Error("Email not found");
      }

      // In a real implementation, this would send an email
      return this.createResponse({ success: true });
    }, "AuthService.resetPassword");
  }

  private generateToken(): string {
    return `token_${Date.now()}_${random().toString(36).substr(2, 16)}`;
  }
}

// Singleton instance
export const authService = new AuthService();
