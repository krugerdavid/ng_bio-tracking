import { injectable, inject } from 'inversify';
import type { User } from '@domain/user/entities/User';
import type { AuthRepository } from '@domain/auth/AuthRepository';
import { TYPES } from '@core/container/DIContainer';
import { ValidationError } from '@core/errors/DomainError';

@injectable()
export class LoginUseCase {
    constructor(
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository
    ) {}

    async execute(email: string, password: string): Promise<User> {
        // Basic validation
        if (!email || !password) {
            throw new ValidationError('Email and password are required');
        }

        if (!email.includes('@')) {
            throw new ValidationError('Invalid email format', 'email');
        }

        return await this.authRepository.login(email, password);
    }
}

