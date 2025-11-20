import { describe, it, expect } from "vitest";
import { Role, isAdmin, isUser } from "../Role";

describe("Role Value Object", () => {
  describe("isAdmin", () => {
    it("should return true for admin role", () => {
      expect(isAdmin(Role.ADMIN)).toBe(true);
    });

    it("should return false for user role", () => {
      expect(isAdmin(Role.USER)).toBe(false);
    });
  });

  describe("isUser", () => {
    it("should return true for user role", () => {
      expect(isUser(Role.USER)).toBe(true);
    });

    it("should return false for admin role", () => {
      expect(isUser(Role.ADMIN)).toBe(false);
    });
  });

  describe("Role constants", () => {
    it("should have correct string values", () => {
      expect(Role.ADMIN).toBe("admin");
      expect(Role.USER).toBe("user");
    });
  });
});
