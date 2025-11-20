import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { UserProfile, CreateUserProfileDTO, UpdateUserProfileDTO } from "@domain/user/entities/UserProfile";
import type { UserProfileRepository } from "@domain/user/UserProfileRepository";
import { Role } from "@domain/shared/value-objects/Role";
import type { SupabaseClient } from "@supabase/supabase-js";
import { edgeFunctions } from "../supabase/edgeFunctions";

@injectable()
export class UserProfileRepositoryImpl implements UserProfileRepository {
  constructor(@inject(TYPES.SupabaseClient) private supabase: SupabaseClient) {}

  async create(data: CreateUserProfileDTO): Promise<Result<UserProfile>> {
    try {
      // Usar Edge Function para crear usuario de forma segura
      const response = await edgeFunctions.createUser(data.email, data.password, data.role);

      if (!response.success || !response.user) {
        return Result.error(response.error || "Failed to create user profile");
      }

      // Obtener el profile creado
      const profileResult = await this.findByUserId(response.user.id);
      if (profileResult.isError()) {
        return Result.error("Profile was created but could not be retrieved");
      }

      const profile = profileResult.getValue();
      if (!profile) {
        return Result.error("Profile was created but could not be retrieved");
      }

      return Result.success(profile);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error creating user profile");
    }
  }

  async findAll(): Promise<Result<UserProfile[]>> {
    try {
      const { data, error } = await this.supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Check if it's a permission error (RLS)
        if (error.code === "PGRST301" || error.message.includes("permission") || error.message.includes("policy")) {
          return Result.error("No tienes permisos para ver la lista de usuarios");
        }
        return Result.error(`Error fetching user profiles: ${error.message}`);
      }

      // Return empty array if no data (not an error)
      return Result.success(data ? data.map(p => this.mapToUserProfile(p)) : []);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error fetching user profiles");
    }
  }

  async findByUserId(userId: string): Promise<Result<UserProfile | null>> {
    try {
      const { data, error } = await this.supabase.from("user_profiles").select("*").eq("user_id", userId).single();

      if (error) {
        if (error.code === "PGRST116") {
          return Result.success(null);
        }
        return Result.error(`Error finding user profile: ${error.message}`);
      }

      return Result.success(data ? this.mapToUserProfile(data) : null);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error finding user profile");
    }
  }

  async update(userId: string, updateData: UpdateUserProfileDTO): Promise<Result<UserProfile>> {
    try {
      const data: Record<string, unknown> = {};
      if (updateData.role !== undefined) data.role = updateData.role;

      const { data: updated, error } = await this.supabase
        .from("user_profiles")
        .update(data)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        return Result.error(`Error updating user profile: ${error.message}`);
      }

      return Result.success(this.mapToUserProfile(updated));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error updating user profile");
    }
  }

  async delete(userId: string): Promise<Result<void>> {
    try {
      // Esto también eliminará el usuario de auth.users por CASCADE
      const { error } = await this.supabase.from("user_profiles").delete().eq("user_id", userId);

      if (error) {
        return Result.error(`Error deleting user profile: ${error.message}`);
      }

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error deleting user profile");
    }
  }

  private mapToUserProfile(data: {
    id: string;
    user_id: string;
    email: string;
    role: string;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  }): UserProfile {
    return {
      id: data.id,
      userId: data.user_id,
      email: data.email,
      role: data.role as Role,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
