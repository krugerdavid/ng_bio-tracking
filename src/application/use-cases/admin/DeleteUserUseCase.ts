import type { IUserProfileRepository } from '../../../domain/repositories/IUserProfileRepository';

export class DeleteUserUseCase {
    private userProfileRepository: IUserProfileRepository;

    constructor(userProfileRepository: IUserProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    async execute(userId: string): Promise<void> {
        if (!userId) {
            throw new Error('User ID is required');
        }

        await this.userProfileRepository.delete(userId);
    }
}
