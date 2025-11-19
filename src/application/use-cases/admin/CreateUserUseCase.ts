import type { UserProfile, CreateUserProfileDTO } from '../../../domain/entities/UserProfile';
import type { IUserProfileRepository } from '../../../domain/repositories/IUserProfileRepository';

export class CreateUserUseCase {
    private userProfileRepository: IUserProfileRepository;

    constructor(userProfileRepository: IUserProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    async execute(data: CreateUserProfileDTO): Promise<UserProfile> {
        // Validaciones
        if (!data.email || !data.password) {
            throw new Error('Email and password are required');
        }

        if (!data.email.includes('@')) {
            throw new Error('Invalid email format');
        }

        if (data.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Crear usuario (vía Edge Function)
        return await this.userProfileRepository.create(data);
    }
}
