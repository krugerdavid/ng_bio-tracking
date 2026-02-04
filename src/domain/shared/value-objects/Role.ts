export const Role = {
  ROOT: "root",
  ADMIN: "admin",
  USER: "user",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const isRoot = (role: Role): boolean => role === Role.ROOT;
export const isAdmin = (role: Role): boolean => role === Role.ADMIN;
export const isUser = (role: Role): boolean => role === Role.USER;
