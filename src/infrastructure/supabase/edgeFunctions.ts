import { supabase } from "../supabase/client";

interface CreateUserResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
}

/**
 * Wrapper para llamar a Supabase Edge Functions de forma segura
 */
export const edgeFunctions = {
  /**
   * Crea un nuevo usuario. Solo admin puede llamar esto.
   * Internamente usa service_role_key en el edge function.
   */
  async createUser(email: string, password: string, role: "admin" | "user"): Promise<CreateUserResponse> {
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { email, password, role },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user",
      };
    }
  },
};
