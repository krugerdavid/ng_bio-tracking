import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '@presentation/components/Layout';
import type { User } from '@domain/entities/User';
import { Role } from '@domain/value-objects/Role';

// Mock useAuth hook
vi.mock('@presentation/context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

import { useAuth } from '@presentation/context/AuthContext';

const renderWithRouter = (ui: React.ReactElement) => {
    return render(
        <BrowserRouter>
            {ui}
        </BrowserRouter>
    );
};

describe('Layout Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Navigation Links', () => {
        it('should render Miembros and Registrar Miembro links for all users', () => {
            const regularUser: User = {
                id: '1',
                email: 'user@test.com',
                role: Role.USER,
            };

            vi.mocked(useAuth).mockReturnValue({
                user: regularUser,
                loading: false,
                login: vi.fn(),
                logout: vi.fn(),
            });

            renderWithRouter(<Layout />);

            expect(screen.getByText('Miembros')).toBeInTheDocument();
            expect(screen.getByText('Registrar Miembro')).toBeInTheDocument();
        });

        it('should NOT show Usuarios link for regular users', () => {
            const regularUser: User = {
                id: '1',
                email: 'user@test.com',
                role: Role.USER,
            };

            vi.mocked(useAuth).mockReturnValue({
                user: regularUser,
                loading: false,
                login: vi.fn(),
                logout: vi.fn(),
            });

            renderWithRouter(<Layout />);

            expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
        });

        it('should show Usuarios link for admin users', () => {
            const adminUser: User = {
                id: '2',
                email: 'admin@test.com',
                role: Role.ADMIN,
            };

            vi.mocked(useAuth).mockReturnValue({
                user: adminUser,
                loading: false,
                login: vi.fn(),
                logout: vi.fn(),
            });

            renderWithRouter(<Layout />);

            expect(screen.getByText('Usuarios')).toBeInTheDocument();
        });
    });

    describe('User Info Display', () => {
        it('should display user email and role badge', () => {
            const adminUser: User = {
                id: '2',
                email: 'admin@test.com',
                role: Role.ADMIN,
            };

            vi.mocked(useAuth).mockReturnValue({
                user: adminUser,
                loading: false,
                login: vi.fn(),
                logout: vi.fn(),
            });

            renderWithRouter(<Layout />);

            expect(screen.getByText('admin@test.com')).toBeInTheDocument();
            expect(screen.getByText('Admin')).toBeInTheDocument();
        });

        it('should display "Usuario" badge for regular users', () => {
            const regularUser: User = {
                id: '1',
                email: 'user@test.com',
                role: Role.USER,
            };

            vi.mocked(useAuth).mockReturnValue({
                user: regularUser,
                loading: false,
                login: vi.fn(),
                logout: vi.fn(),
            });

            renderWithRouter(<Layout />);

            expect(screen.getByText('user@test.com')).toBeInTheDocument();
            expect(screen.getByText('Usuario')).toBeInTheDocument();
        });

        it('should render logout button', () => {
            const user: User = {
                id: '1',
                email: 'user@test.com',
                role: Role.USER,
            };

            vi.mocked(useAuth).mockReturnValue({
                user,
                loading: false,
                login: vi.fn(),
                logout: vi.fn(),
            });

            renderWithRouter(<Layout />);

            expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
        });
    });

    describe('Branding', () => {
        it('should display BioTracker logo/title', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                loading: false,
                login: vi.fn(),
                logout: vi.fn(),
            });

            renderWithRouter(<Layout />);

            expect(screen.getByText('BioTracker')).toBeInTheDocument();
        });
    });
});
