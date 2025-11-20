import type { Member, CreateMemberDTO, UpdateMemberDTO } from '@domain/entities/Member';
import type { IMemberRepository } from '@domain/repositories/IMemberRepository';
import { supabase } from '../supabase/client';

export class SupabaseMemberRepository implements IMemberRepository {
    async create(data: CreateMemberDTO): Promise<Member> {
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User must be authenticated to create members');
        }

        const { data: member, error } = await supabase
            .from('members')
            .insert({
                user_id: user.id,
                name: data.name,
                email: data.email,
                date_of_birth: this.formatDate(data.dateOfBirth),
                gender: data.gender,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating member: ${error.message}`);
        }

        return this.mapToMember(member);
    }

    async findById(id: string): Promise<Member | null> {
        const { data: member, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Error finding member: ${error.message}`);
        }

        return member ? this.mapToMember(member) : null;
    }

    async findAll(): Promise<Member[]> {
        const { data: members, error } = await supabase
            .from('members')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Error fetching members: ${error.message}`);
        }

        return members.map(m => this.mapToMember(m));
    }

    async update(id: string, data: UpdateMemberDTO): Promise<Member> {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.dateOfBirth !== undefined) updateData.date_of_birth = this.formatDate(data.dateOfBirth);
        if (data.gender !== undefined) updateData.gender = data.gender;

        const { data: member, error } = await supabase
            .from('members')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating member: ${error.message}`);
        }

        return this.mapToMember(member);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Error deleting member: ${error.message}`);
        }
    }

    private mapToMember(data: any): Member {
        return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            email: data.email,
            dateOfBirth: new Date(data.date_of_birth),
            gender: data.gender,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
