import type { User } from '@domain/entities/User';
import type { IAuthRepository } from '@domain/repositories/IAuthRepository';

export class LoginUseCase {
    private authRepository: IAuthRepository;

    constructor(authRepository: IAuthRepository) {
        this.authRepository = authRepository;
    }

    async execute(email: string, password: string): Promise<User> {
        // Basic validation
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        if (!email.includes('@')) {
            throw new Error('Invalid email format');
        }

        return await this.authRepository.login(email, password);
    }
}
