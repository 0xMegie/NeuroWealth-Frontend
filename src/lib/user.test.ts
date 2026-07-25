import { describe, it, expect } from "vitest";
import {
  adaptMockAuthUser,
  adaptApiUser,
  getUserInitials,
  truncateWalletAddress,
  getUserAddressLabel,
} from "./user";

describe("user module", () => {
  describe("getUserInitials", () => {
    it("extracts initials correctly", () => {
      expect(getUserInitials("John Doe")).toBe("JD");
      expect(getUserInitials("Jane")).toBe("J");
      expect(getUserInitials("  foo  bar  ")).toBe("FB");
      expect(getUserInitials("")).toBe("??");
      expect(getUserInitials("  ")).toBe("??");
    });
  });

  describe("truncateWalletAddress", () => {
    it("truncates long addresses", () => {
      expect(truncateWalletAddress("0x1234567890abcdef1234567890abcdef")).toBe("0x1234...cdef");
    });

    it("returns short addresses as is", () => {
      expect(truncateWalletAddress("0x1234567890")).toBe("0x1234567890");
    });

    it("returns already truncated addresses as is", () => {
      expect(truncateWalletAddress("0x12...cdef")).toBe("0x12...cdef");
    });
  });

  describe("getUserAddressLabel", () => {
    it("returns truncated label when address exists", () => {
      expect(getUserAddressLabel({ walletAddress: "0x1234567890abcdef1234567890abcdef" })).toBe("0x1234...cdef");
    });

    it("returns undefined when address is missing", () => {
      expect(getUserAddressLabel({ walletAddress: undefined })).toBeUndefined();
    });
  });

  describe("adaptMockAuthUser", () => {
    it("uses name for display name", () => {
      const user = adaptMockAuthUser({
        id: "1",
        email: "foo@example.com",
        name: "Foo Bar",
        createdAt: "2023-01-01",
      });
      expect(user.displayName).toBe("Foo Bar");
      expect(user.avatarInitials).toBe("FB");
    });

    it("falls back to email prefix for display name", () => {
      const user = adaptMockAuthUser({
        id: "1",
        email: "foo@example.com",
        name: "",
        createdAt: "2023-01-01",
      });
      expect(user.displayName).toBe("foo");
      expect(user.avatarInitials).toBe("F");
    });

    it("falls back to wallet address", () => {
      const user = adaptMockAuthUser({
        id: "1",
        email: "",
        name: "",
        walletAddress: "0xabc",
        createdAt: "2023-01-01",
      });
      expect(user.displayName).toBe("0xabc");
    });

    it("falls back to id", () => {
      const user = adaptMockAuthUser({
        id: "usr-123",
        email: "",
        name: "",
        createdAt: "2023-01-01",
      });
      expect(user.displayName).toBe("usr-123");
    });
  });

  describe("adaptApiUser", () => {
    it("uses displayName", () => {
      const user = adaptApiUser({
        id: "1",
        displayName: "API Name",
        name: "Other Name",
      });
      expect(user.displayName).toBe("API Name");
    });

    it("falls back to name, then email, then wallet, then id", () => {
      expect(adaptApiUser({ id: "1", name: "Other Name" }).displayName).toBe("Other Name");
      expect(adaptApiUser({ id: "1", email: "test@x.com" }).displayName).toBe("test");
      expect(adaptApiUser({ id: "1", address: "0xabc" }).displayName).toBe("0xabc");
      expect(adaptApiUser({ id: "1" }).displayName).toBe("1");
    });

    it("picks walletAddress or address", () => {
      expect(adaptApiUser({ id: "1", walletAddress: "0x123" }).walletAddress).toBe("0x123");
      expect(adaptApiUser({ id: "1", address: "0x456" }).walletAddress).toBe("0x456");
    });

    it("picks avatarUrl or avatar", () => {
      expect(adaptApiUser({ id: "1", avatarUrl: "url1" }).avatarUrl).toBe("url1");
      expect(adaptApiUser({ id: "1", avatar: "url2" }).avatarUrl).toBe("url2");
    });

    it("defaults to 'User' if everything is empty or whitespace", () => {
      const user = adaptApiUser({
        id: "  ",
        displayName: "  ",
        name: "",
        email: null,
      });
      expect(user.displayName).toBe("User");
    });
  });
});
