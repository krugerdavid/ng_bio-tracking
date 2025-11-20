import type { User } from '../user/entities/User';

export interface AuthRepository {
    login(email: string, password: string): Promise<User>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
    onAuthStateChange(callback: (user: User | null) => void): () => void;
}

