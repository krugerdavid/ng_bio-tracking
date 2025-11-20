import { injectable, inject } from 'inversify';
import type { AuthRepository } from '@domain/auth/AuthRepository';
import { TYPES } from '@core/container/DIContainer';

@injectable()
export class LogoutUseCase {
    constructor(
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository
    ) {}

    async execute(): Promise<void> {
        await this.authRepository.logout();
    }
}

