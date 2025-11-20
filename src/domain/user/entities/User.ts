import type { Role } from "../../shared/value-objects/Role";

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
}
