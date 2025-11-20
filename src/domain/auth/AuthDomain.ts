import { injectable, inject } from 'inversify';
import { TYPES } from '@core/container/DIContainer';
import type { AuthRepository } from './AuthRepository';
import type { User } from '../user/entities/User';
import { UnauthorizedError } from '@core/errors/DomainError';

/**
 * Domain service for authentication business logic
 */
@injectable()
export class AuthDomain {
    constructor(
        @inject(TYPES.AuthRepository) private readonly authRepository: AuthRepository
    ) {}

    /**
     * Authenticate user with email and password
     */
    async login(email: string, password: string): Promise<User> {
        if (!email || !password) {
            throw new UnauthorizedError('Email and password are required');
        }

        try {
            return await this.authRepository.login(email, password);
        } catch (error) {
            throw new UnauthorizedError(
                error instanceof Error ? error.message : 'Invalid credentials'
            );
        }
    }

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        await this.authRepository.logout();
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<User | null> {
        return await this.authRepository.getCurrentUser();
    }

    /**
     * Subscribe to authentication state changes
     */
    onAuthStateChange(callback: (user: User | null) => void): () => void {
        return this.authRepository.onAuthStateChange(callback);
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const user = await this.getCurrentUser();
        return user !== null;
    }
}

