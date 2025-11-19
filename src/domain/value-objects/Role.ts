export const Role = {
    ADMIN: 'admin',
    USER: 'user'
} as const;

export type Role = typeof Role[keyof typeof Role];

export const isAdmin = (role: Role): boolean => role === Role.ADMIN;
export const isUser = (role: Role): boolean => role === Role.USER;
