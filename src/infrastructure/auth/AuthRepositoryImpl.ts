import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { User } from "@domain/user/entities/User";
import type { AuthRepository } from "@domain/auth/AuthRepository";
import { Role } from "@domain/shared/value-objects/Role";
import type { SupabaseClient } from "@supabase/supabase-js";

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor(@inject(TYPES.SupabaseClient) private supabase: SupabaseClient) {}

  async login(email: string, password: string): Promise<Result<User>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return Result.error(`Login failed: ${error.message}`);
      }

      if (!data.user) {
        return Result.error("Login failed: No user data returned");
      }

      const user = await this.mapToUser(data.user);
      return Result.success(user);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error during login");
    }
  }

  async logout(): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return Result.error(`Logout failed: ${error.message}`);
      }

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error during logout");
    }
  }

  async getCurrentUser(): Promise<Result<User | null>> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error) {
        return Result.error(`Failed to get current user: ${error.message}`);
      }

      if (!user) {
        return Result.success(null);
      }

      const mappedUser = await this.mapToUser(user);
      return Result.success(mappedUser);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error getting current user");
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    // Get initial state immediately
    this.getInitialAuthState(callback);

    // Subscribe to future changes
    const {
      data: { subscription },
    } = this.supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const user = await this.mapToUser(session.user);
          callback(user);
        } catch (error) {
          console.error("Error mapping user in auth state change:", error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  private async getInitialAuthState(callback: (user: User | null) => void): Promise<void> {
    try {
      const result = await this.getCurrentUser();
      if (result.isSuccess()) {
        callback(result.getValue());
      } else {
        callback(null);
      }
    } catch (error) {
      console.error("Error getting initial auth state:", error);
      callback(null);
    }
  }

  private async mapToUser(authUser: { id: string; email?: string | null; created_at: string }): Promise<User> {
    let role: Role = Role.USER;

    try {
      const { data: profile } = await this.supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", authUser.id)
        .single();

      if (profile?.role) {
        role = profile.role as Role;
      }
    } catch (error) {
      // Silently fail and use default role
      console.warn("Could not fetch user profile, using default role:", error);
    }

    return {
      id: authUser.id,
      email: authUser.email!,
      role,
      createdAt: new Date(authUser.created_at),
    };
  }
}
