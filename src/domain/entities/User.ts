import type { Role } from '../value-objects/Role';

export interface User {
    id: string;
    email: string;
    role: Role;
    createdAt: Date;
}
