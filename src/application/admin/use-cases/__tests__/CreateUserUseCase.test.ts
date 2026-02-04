import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateUserUseCase } from "../CreateUserUseCase";
import type { UserDomain } from "@domain/user/UserDomain";
import type { CreateUserProfileDTO, UserProfile } from "@domain/user/entities/UserProfile";
import { Role } from "@domain/shared/value-objects/Role";
import { Result } from "@core/types/Result";

describe("CreateUserUseCase", () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserDomain: UserDomain;

  beforeEach(() => {
    // Create mock domain service
    mockUserDomain = {
      validateUserProfile: vi.fn(),
      createUserProfile: vi.fn(),
    } as unknown as UserDomain;

    createUserUseCase = new CreateUserUseCase(mockUserDomain);
  });

  describe("execute", () => {
    it("should create a user with valid data", async () => {
      const userData: CreateUserProfileDTO = {
        email: "test@example.com",
        password: "password123",
        role: Role.USER,
      };

      const mockCreatedUser: UserProfile = {
        id: "123",
        userId: "user-456",
        name: "",
        email: userData.email,
        role: userData.role,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockUserDomain.createUserProfile).mockResolvedValue(Result.success(mockCreatedUser));

      const result = await createUserUseCase.execute(userData);

      expect(mockUserDomain.validateUserProfile).toHaveBeenCalledWith(userData);
      expect(mockUserDomain.createUserProfile).toHaveBeenCalledWith(userData);
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual(mockCreatedUser);
    });

    it("should throw error when email is invalid", async () => {
      const invalidData: CreateUserProfileDTO = {
        email: "invalid-email",
        password: "password123",
        role: Role.USER,
      };

      vi.mocked(mockUserDomain.validateUserProfile).mockImplementation(() => {
        throw new Error("Invalid email format");
      });

      const result = await createUserUseCase.execute(invalidData);
      expect(result.isError()).toBe(true);
      expect(result.getError()).toContain("Invalid email format");
      expect(mockUserDomain.createUserProfile).not.toHaveBeenCalled();
    });

    it("should throw error when password is too short", async () => {
      const invalidData: CreateUserProfileDTO = {
        email: "test@example.com",
        password: "123",
        role: Role.USER,
      };

      vi.mocked(mockUserDomain.validateUserProfile).mockImplementation(() => {
        throw new Error("Password must be at least 6 characters long");
      });

      const result = await createUserUseCase.execute(invalidData);
      expect(result.isError()).toBe(true);
      expect(result.getError()).toContain("Password must be at least 6 characters long");
      expect(mockUserDomain.createUserProfile).not.toHaveBeenCalled();
    });

    it("should create admin user when role is ADMIN", async () => {
      const adminData: CreateUserProfileDTO = {
        email: "admin@example.com",
        password: "adminpass123",
        role: Role.ADMIN,
      };

      const mockAdminUser: UserProfile = {
        id: "789",
        userId: "admin-999",
        name: "",
        email: adminData.email,
        role: Role.ADMIN,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockUserDomain.createUserProfile).mockResolvedValue(Result.success(mockAdminUser));

      const result = await createUserUseCase.execute(adminData);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().role).toBe(Role.ADMIN);
      expect(mockUserDomain.createUserProfile).toHaveBeenCalledWith(adminData);
    });
  });
});
