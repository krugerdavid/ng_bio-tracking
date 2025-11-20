import { injectable, inject } from 'inversify';
import type { UserProfile } from '@domain/user/entities/UserProfile';
import type { UserProfileRepository } from '@domain/user/UserProfileRepository';
import { TYPES } from '@core/container/DIContainer';

@injectable()
export class ListUsersUseCase {
    constructor(
        @inject(TYPES.UserProfileRepository) private userProfileRepository: UserProfileRepository
    ) {}

    async execute(): Promise<UserProfile[]> {
        return await this.userProfileRepository.findAll();
    }
}

