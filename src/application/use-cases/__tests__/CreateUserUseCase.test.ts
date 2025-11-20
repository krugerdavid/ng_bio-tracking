import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateUserUseCase } from '@application/use-cases/admin/CreateUserUseCase';
import type { IUserProfileRepository } from '@domain/repositories/IUserProfileRepository';
import type { CreateUserProfileDTO } from '@domain/entities/UserProfile';
import { Role } from '@domain/value-objects/Role';

describe('CreateUserUseCase', () => {
    let createUserUseCase: CreateUserUseCase;
    let mockUserProfileRepository: IUserProfileRepository;

    beforeEach(() => {
        // Create mock repository
        mockUserProfileRepository = {
            create: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };

        createUserUseCase = new CreateUserUseCase(mockUserProfileRepository);
    });

    describe('execute', () => {
        it('should create a user with valid data', async () => {
            const userData: CreateUserProfileDTO = {
                email: 'test@example.com',
                password: 'password123',
                role: Role.USER,
            };

            const mockCreatedUser = {
                id: '123',
                userId: 'user-456',
                email: userData.email,
                role: userData.role,
                createdBy: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            vi.mocked(mockUserProfileRepository.create).mockResolvedValue(mockCreatedUser);

            const result = await createUserUseCase.execute(userData);

            expect(mockUserProfileRepository.create).toHaveBeenCalledWith(userData);
            expect(result).toEqual(mockCreatedUser);
        });

        it('should throw error when email is invalid', async () => {
            const invalidData: CreateUserProfileDTO = {
                email: 'invalid-email',
                password: 'password123',
                role: Role.USER,
            };

            await expect(createUserUseCase.execute(invalidData)).rejects.toThrow('Invalid email format');
            expect(mockUserProfileRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when password is too short', async () => {
            const invalidData: CreateUserProfileDTO = {
                email: 'test@example.com',
                password: '123',
                role: Role.USER,
            };

            await expect(createUserUseCase.execute(invalidData)).rejects.toThrow(
                'Password must be at least 6 characters long'
            );
            expect(mockUserProfileRepository.create).not.toHaveBeenCalled();
        });

        it('should create admin user when role is ADMIN', async () => {
            const adminData: CreateUserProfileDTO = {
                email: 'admin@example.com',
                password: 'adminpass123',
                role: Role.ADMIN,
            };

            const mockAdminUser = {
                id: '789',
                userId: 'admin-999',
                email: adminData.email,
                role: Role.ADMIN,
                createdBy: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            vi.mocked(mockUserProfileRepository.create).mockResolvedValue(mockAdminUser);

            const result = await createUserUseCase.execute(adminData);

            expect(result.role).toBe(Role.ADMIN);
            expect(mockUserProfileRepository.create).toHaveBeenCalledWith(adminData);
        });
    });
});
