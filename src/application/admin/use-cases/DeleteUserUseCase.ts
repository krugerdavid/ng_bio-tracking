import { injectable, inject } from 'inversify';
import type { UserProfileRepository } from '@domain/user/UserProfileRepository';
import { TYPES } from '@core/container/DIContainer';
import { ValidationError } from '@core/errors/DomainError';

@injectable()
export class DeleteUserUseCase {
    constructor(
        @inject(TYPES.UserProfileRepository) private userProfileRepository: UserProfileRepository
    ) {}

    async execute(userId: string): Promise<void> {
        if (!userId) {
            throw new ValidationError('User ID is required', 'userId');
        }

        await this.userProfileRepository.delete(userId);
    }
}

