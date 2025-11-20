import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AppLayout from "../AppLayout";
import { AuthContext } from "@presentation/app/providers/AuthContext";
import type { AuthContextType } from "@presentation/app/providers/AuthContext";
import { Result } from "@core/types/Result";
import type { User } from "@domain/user/entities/User";
import { Role } from "@domain/shared/value-objects/Role";

const mockUser: User = {
  id: "1",
  email: "test@example.com",
  role: Role.USER,
  createdAt: new Date(),
};

const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
  authState: {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    error: null,
  },
  login: vi.fn().mockResolvedValue(Result.success(undefined)),
  logout: vi.fn().mockResolvedValue(Result.success(undefined)),
  clearAuthError: vi.fn(),
  ...overrides,
});

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders navigation menu", () => {
    const mockContext = createMockAuthContext();

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContext}>
          <AppLayout />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Miembros")).toBeInTheDocument();
  });

  it("shows user email in dropdown", () => {
    const mockContext = createMockAuthContext();

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContext}>
          <AppLayout />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it("shows admin menu when user is admin", () => {
    const adminUser: User = { ...mockUser, role: Role.ADMIN };
    const mockContext = createMockAuthContext({
      authState: {
        user: adminUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      },
    });

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContext}>
          <AppLayout />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("Usuarios")).toBeInTheDocument();
  });

  it("calls logout when logout button is clicked", async () => {
    const mockLogout = vi.fn().mockResolvedValue(Result.success(undefined));
    const mockContext = createMockAuthContext({ logout: mockLogout });

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContext}>
          <AppLayout />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // Click user info to open dropdown
    const userButton = screen.getByText(mockUser.email).closest("button");
    if (userButton) {
      userButton.click();
    }

    await waitFor(() => {
      const logoutButton = screen.getByText("Cerrar Sesión");
      expect(logoutButton).toBeInTheDocument();
    });

    const logoutButton = screen.getByText("Cerrar Sesión");
    logoutButton.click();

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
