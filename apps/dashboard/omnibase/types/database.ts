export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          anon_key: string | null
          api_url: string | null
          auth_admin_url: string | null
          auth_public_url: string | null
          branch_name: string | null
          cloud_run_service_names: string[] | null
          created_at: string
          database_host: string | null
          database_name: string | null
          database_password: string | null
          database_pooler_host: string | null
          database_port: string | null
          database_username: string | null
          error_message: string | null
          id: string
          is_default_branch: boolean | null
          keto_read_url: string | null
          keto_write_url: string | null
          name: string
          neon_project_id: string | null
          postgrest_url: string | null
          postmark_server_id: string | null
          postmark_server_token: string | null
          project_group_id: string
          r2_bucket_name: string | null
          region: string
          service_key: string | null
          stage: Database["public"]["Enums"]["project_stage"]
          stripe_customer_id: string | null
          stripe_onboarding_complete: boolean | null
          tenant_id: string
          type_gen_url: string | null
          updated_at: string
        }
        Insert: {
          anon_key?: string | null
          api_url?: string | null
          auth_admin_url?: string | null
          auth_public_url?: string | null
          branch_name?: string | null
          cloud_run_service_names?: string[] | null
          created_at?: string
          database_host?: string | null
          database_name?: string | null
          database_password?: string | null
          database_pooler_host?: string | null
          database_port?: string | null
          database_username?: string | null
          error_message?: string | null
          id: string
          is_default_branch?: boolean | null
          keto_read_url?: string | null
          keto_write_url?: string | null
          name: string
          neon_project_id?: string | null
          postgrest_url?: string | null
          postmark_server_id?: string | null
          postmark_server_token?: string | null
          project_group_id: string
          r2_bucket_name?: string | null
          region: string
          service_key?: string | null
          stage?: Database["public"]["Enums"]["project_stage"]
          stripe_customer_id?: string | null
          stripe_onboarding_complete?: boolean | null
          tenant_id: string
          type_gen_url?: string | null
          updated_at?: string
        }
        Update: {
          anon_key?: string | null
          api_url?: string | null
          auth_admin_url?: string | null
          auth_public_url?: string | null
          branch_name?: string | null
          cloud_run_service_names?: string[] | null
          created_at?: string
          database_host?: string | null
          database_name?: string | null
          database_password?: string | null
          database_pooler_host?: string | null
          database_port?: string | null
          database_username?: string | null
          error_message?: string | null
          id?: string
          is_default_branch?: boolean | null
          keto_read_url?: string | null
          keto_write_url?: string | null
          name?: string
          neon_project_id?: string | null
          postgrest_url?: string | null
          postmark_server_id?: string | null
          postmark_server_token?: string | null
          project_group_id?: string
          r2_bucket_name?: string | null
          region?: string
          service_key?: string | null
          stage?: Database["public"]["Enums"]["project_stage"]
          stripe_customer_id?: string | null
          stripe_onboarding_complete?: boolean | null
          tenant_id?: string
          type_gen_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          dirty: boolean
          version: number
        }
        Insert: {
          dirty: boolean
          version: number
        }
        Update: {
          dirty?: boolean
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      uuid_generate_v1: { Args: never; Returns: string }
      uuid_generate_v1mc: { Args: never; Returns: string }
      uuid_generate_v3: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_generate_v4: { Args: never; Returns: string }
      uuid_generate_v5: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_nil: { Args: never; Returns: string }
      uuid_ns_dns: { Args: never; Returns: string }
      uuid_ns_oid: { Args: never; Returns: string }
      uuid_ns_url: { Args: never; Returns: string }
      uuid_ns_x500: { Args: never; Returns: string }
    }
    Enums: {
      project_stage:
        | "provisioning"
        | "provisioned"
        | "active"
        | "suspended"
        | "deprovisioning"
        | "deleted"
        | "error"
        | "deleting"
        | "deletion_failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      project_stage: [
        "provisioning",
        "provisioned",
        "active",
        "suspended",
        "deprovisioning",
        "deleted",
        "error",
        "deleting",
        "deletion_failed",
      ],
    },
  },
} as const
