import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../../domain/entities/User';
import {
    loginUseCase,
    logoutUseCase,
    getCurrentUserUseCase,
} from '../../application/di/container';
import { supabase } from '../../infrastructure/supabase/client';

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

    useEffect(() => {
        // Check current session
        getCurrentUserUseCase.execute().then(setUser).catch(console.error).finally(() => setLoading(false));

        // Listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                try {
                    const currentUser = await getCurrentUserUseCase.execute();
                    setUser(currentUser);
                } catch (error) {
                    console.error('Error getting user:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

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
