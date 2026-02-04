import type { Role } from "../../shared/value-objects/Role";

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserProfileDTO = {
  name?: string;
  email: string;
  password: string;
  role: Role;
};

export type UpdateUserProfileDTO = {
  name?: string;
  role?: Role;
  password?: string;
};
