import type { UserProfile } from '@domain/entities/UserProfile';
import type { IUserProfileRepository } from '@domain/repositories/IUserProfileRepository';

export class ListUsersUseCase {
    private userProfileRepository: IUserProfileRepository;

    constructor(userProfileRepository: IUserProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    async execute(): Promise<UserProfile[]> {
        return await this.userProfileRepository.findAll();
    }
}
