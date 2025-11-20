import type { UserProfile, CreateUserProfileDTO, UpdateUserProfileDTO } from '@domain/entities/UserProfile';
import type { IUserProfileRepository } from '@domain/repositories/IUserProfileRepository';
import { Role } from '@domain/value-objects/Role';
import { supabase } from '../supabase/client';
import { edgeFunctions } from '../supabase/edgeFunctions';

export class SupabaseUserProfileRepository implements IUserProfileRepository {
    async create(data: CreateUserProfileDTO): Promise<UserProfile> {
        // Usar Edge Function para crear usuario de forma segura
        const response = await edgeFunctions.createUser(
            data.email,
            data.password,
            data.role
        );

        if (!response.success || !response.user) {
            throw new Error(response.error || 'Failed to create user profile');
        }

        // Obtener el profile creado
        const profile = await this.findByUserId(response.user.id);
        if (!profile) {
            throw new Error('Profile was created but could not be retrieved');
        }

        return profile;
    }

    async findAll(): Promise<UserProfile[]> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Error fetching user profiles: ${error.message}`);
        }

        return data.map(p => this.mapToUserProfile(p));
    }

    async findByUserId(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error finding user profile: ${error.message}`);
        }

        return data ? this.mapToUserProfile(data) : null;
    }

    async update(userId: string, updateData: UpdateUserProfileDTO): Promise<UserProfile> {
        const data: any = {};
        if (updateData.role !== undefined) data.role = updateData.role;

        const { data: updated, error } = await supabase
            .from('user_profiles')
            .update(data)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating user profile: ${error.message}`);
        }

        return this.mapToUserProfile(updated);
    }

    async delete(userId: string): Promise<void> {
        // Esto también eliminará el usuario de auth.users por CASCADE
        const { error } = await supabase
            .from('user_profiles')
            .delete()
            .eq('user_id', userId);

        if (error) {
            throw new Error(`Error deleting user profile: ${error.message}`);
        }
    }

    private mapToUserProfile(data: any): UserProfile {
        return {
            id: data.id,
            userId: data.user_id,
            email: data.email,
            role: data.role as Role,
            createdBy: data.created_by,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        };
    }
}
