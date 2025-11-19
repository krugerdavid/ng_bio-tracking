import type { UserProfile, CreateUserProfileDTO, UpdateUserProfileDTO } from '../entities/UserProfile';

export interface IUserProfileRepository {
    create(data: CreateUserProfileDTO): Promise<UserProfile>;
    findAll(): Promise<UserProfile[]>;
    findByUserId(userId: string): Promise<UserProfile | null>;
    update(userId: string, data: UpdateUserProfileDTO): Promise<UserProfile>;
    delete(userId: string): Promise<void>;
}
