import type { Role } from '../../shared/value-objects/Role';

export interface UserProfile {
    id: string;
    userId: string;
    email: string;
    role: Role;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateUserProfileDTO = {
    email: string;
    password: string;
    role: Role;
};

export type UpdateUserProfileDTO = {
    role?: Role;
};

