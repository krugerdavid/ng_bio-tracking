import { injectable, inject } from 'inversify';
import type { UserProfile, CreateUserProfileDTO } from '@domain/user/entities/UserProfile';
import type { UserDomain } from '@domain/user/UserDomain';
import { TYPES } from '@core/container/DIContainer';

@injectable()
export class CreateUserUseCase {
    constructor(
        @inject(TYPES.UserDomain) private userDomain: UserDomain
    ) {}

    async execute(data: CreateUserProfileDTO): Promise<UserProfile> {
        // Use domain service for validation
        this.userDomain.validateUserProfile(data);

        // Create user (vía Edge Function)
        return await this.userDomain.createUserProfile(data);
    }
}

