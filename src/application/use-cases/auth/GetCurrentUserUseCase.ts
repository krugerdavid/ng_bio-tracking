import type { User } from '../../../domain/entities/User';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';

export class GetCurrentUserUseCase {
    private authRepository: IAuthRepository;

    constructor(authRepository: IAuthRepository) {
        this.authRepository = authRepository;
    }

    async execute(): Promise<User | null> {
        return await this.authRepository.getCurrentUser();
    }
}
