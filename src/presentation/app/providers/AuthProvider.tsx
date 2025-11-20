import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@domain/user/entities/User';
import { container } from '@core/container/bindings';
import { TYPES } from '@core/container/DIContainer';
import type { LoginUseCase } from '@application/auth/use-cases/LoginUseCase';
import type { LogoutUseCase } from '@application/auth/use-cases/LogoutUseCase';
import type { GetCurrentUserUseCase } from '@application/auth/use-cases/GetCurrentUserUseCase';
import type { AuthRepository } from '@domain/auth/AuthRepository';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loginUseCase = container.get<LoginUseCase>(TYPES.LoginUseCase);
    const logoutUseCase = container.get<LogoutUseCase>(TYPES.LogoutUseCase);
    const getCurrentUserUseCase = container.get<GetCurrentUserUseCase>(TYPES.GetCurrentUserUseCase);
    const authRepository = container.get<AuthRepository>(TYPES.AuthRepository);

    useEffect(() => {
        // Check current session
        getCurrentUserUseCase.execute().then(setUser).catch(console.error).finally(() => setLoading(false));

        // Listen to auth changes
        const unsubscribe = authRepository.onAuthStateChange(async (currentUser) => {
            setUser(currentUser);
        });

        return () => {
            unsubscribe();
        };
    }, [getCurrentUserUseCase, authRepository]);

    const login = async (email: string, password: string) => {
        const loggedUser = await loginUseCase.execute(email, password);
        setUser(loggedUser);
    };

    const logout = async () => {
        await logoutUseCase.execute();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

