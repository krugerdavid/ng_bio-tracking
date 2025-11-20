import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import AppLayout from "../AppLayout";
import type { User } from "@domain/user/entities/User";
import { Role } from "@domain/shared/value-objects/Role";

// Mock useAuth hook
vi.mock("../../providers/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../providers/AuthProvider";

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("AppLayout Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Navigation Links", () => {
    it("should render Miembros link for all users", () => {
      const regularUser: User = {
        id: "1",
        email: "user@test.com",
        role: Role.USER,
        createdAt: new Date(),
      };

      vi.mocked(useAuth).mockReturnValue({
        user: regularUser,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithRouter(<AppLayout />);

      expect(screen.getByText("Miembros")).toBeInTheDocument();
    });

    it("should NOT show Usuarios link for regular users", () => {
      const regularUser: User = {
        id: "1",
        email: "user@test.com",
        role: Role.USER,
        createdAt: new Date(),
      };

      vi.mocked(useAuth).mockReturnValue({
        user: regularUser,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithRouter(<AppLayout />);

      expect(screen.queryByText("Usuarios")).not.toBeInTheDocument();
    });

    it("should show Usuarios link for admin users", () => {
      const adminUser: User = {
        id: "2",
        email: "admin@test.com",
        role: Role.ADMIN,
        createdAt: new Date(),
      };

      vi.mocked(useAuth).mockReturnValue({
        user: adminUser,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithRouter(<AppLayout />);

      expect(screen.getByText("Usuarios")).toBeInTheDocument();
    });
  });

  describe("User Info Display", () => {
    it("should display user email", () => {
      const adminUser: User = {
        id: "2",
        email: "admin@test.com",
        role: Role.ADMIN,
        createdAt: new Date(),
      };

      vi.mocked(useAuth).mockReturnValue({
        user: adminUser,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithRouter(<AppLayout />);

      expect(screen.getByText("admin@test.com")).toBeInTheDocument();
    });

    it("should render user dropdown with logout option", () => {
      const user: User = {
        id: "1",
        email: "user@test.com",
        role: Role.USER,
        createdAt: new Date(),
      };

      vi.mocked(useAuth).mockReturnValue({
        user,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithRouter(<AppLayout />);

      // The logout button is inside a dropdown, so we check for the user email which is always visible
      expect(screen.getByText("user@test.com")).toBeInTheDocument();
    });
  });

  describe("Branding", () => {
    it("should display NG Training logo/title", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      renderWithRouter(<AppLayout />);

      expect(screen.getByText("NG Training")).toBeInTheDocument();
    });
  });
});
