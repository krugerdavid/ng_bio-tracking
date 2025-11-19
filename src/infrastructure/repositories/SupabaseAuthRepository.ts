import type { User } from '../../domain/entities/User';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { Role } from '../../domain/value-objects/Role';
import { supabase } from '../supabase/client';

export class SupabaseAuthRepository implements IAuthRepository {
    async login(email: string, password: string): Promise<User> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(`Login failed: ${error.message}`);
        }

        if (!data.user) {
            throw new Error('Login failed: No user data returned');
        }

        return await this.mapToUser(data.user);
    }

    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new Error(`Logout failed: ${error.message}`);
        }
    }

    async getCurrentUser(): Promise<User | null> {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            throw new Error(`Failed to get current user: ${error.message}`);
        }

        return user ? await this.mapToUser(user) : null;
    }

    onAuthStateChange(callback: (user: User | null) => void): () => void {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const user = session?.user ? await this.mapToUser(session.user) : null;
            callback(user);
        });

        return () => {
            subscription.unsubscribe();
        };
    }

    private async mapToUser(authUser: any): Promise<User> {
        // Fetch user profile to get role
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', authUser.id)
            .single();

        return {
            id: authUser.id,
            email: authUser.email!,
            role: (profile?.role as Role) || Role.USER,
            createdAt: new Date(authUser.created_at),
        };
    }
}
