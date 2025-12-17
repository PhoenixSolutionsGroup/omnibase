export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          api_service_key_encrypted: string | null;
          api_url: string | null;
          auth_admin_url: string | null;
          auth_public_url: string | null;
          branch_name: string;
          cloud_run_service_resource_names: Json | null;
          compute_provider: string | null;
          created_at: string;
          database_anon_key: string | null;
          database_connection_string_encrypted: string | null;
          database_host: string | null;
          database_name: string | null;
          database_password_encrypted: string | null;
          database_port: number | null;
          database_provider: string | null;
          database_service_key_encrypted: string | null;
          database_username: string | null;
          dedicated_vps_id: string | null;
          email_provider: string | null;
          error_message: string | null;
          id: string;
          is_default_branch: boolean;
          last_activity_at: string | null;
          name: string;
          neon_project_id: string | null;
          permissions_read_url: string | null;
          permissions_write_url: string | null;
          postgrest_url: string | null;
          postmark_server_id: string | null;
          postmark_server_token_encrypted: string | null;
          project_group_id: string;
          provisioning_type:
            | Database["public"]["Enums"]["provisioning_type"]
            | null;
          status: Database["public"]["Enums"]["project_status"];
          storage_bucket_name: string | null;
          storage_provider: string | null;
          stripe_customer_id: string | null;
          stripe_onboarding_complete: boolean;
          suspension_reason: string | null;
          tenant_id: string;
          updated_at: string;
          vps_host_id: string | null;
          worker_url: string | null;
        };
        Insert: {
          api_service_key_encrypted?: string | null;
          api_url?: string | null;
          auth_admin_url?: string | null;
          auth_public_url?: string | null;
          branch_name: string;
          cloud_run_service_resource_names?: Json | null;
          compute_provider?: string | null;
          created_at?: string;
          database_anon_key?: string | null;
          database_connection_string_encrypted?: string | null;
          database_host?: string | null;
          database_name?: string | null;
          database_password_encrypted?: string | null;
          database_port?: number | null;
          database_provider?: string | null;
          database_service_key_encrypted?: string | null;
          database_username?: string | null;
          dedicated_vps_id?: string | null;
          email_provider?: string | null;
          error_message?: string | null;
          id?: string;
          is_default_branch?: boolean;
          last_activity_at?: string | null;
          name: string;
          neon_project_id?: string | null;
          permissions_read_url?: string | null;
          permissions_write_url?: string | null;
          postgrest_url?: string | null;
          postmark_server_id?: string | null;
          postmark_server_token_encrypted?: string | null;
          project_group_id: string;
          provisioning_type?:
            | Database["public"]["Enums"]["provisioning_type"]
            | null;
          status?: Database["public"]["Enums"]["project_status"];
          storage_bucket_name?: string | null;
          storage_provider?: string | null;
          stripe_customer_id?: string | null;
          stripe_onboarding_complete?: boolean;
          suspension_reason?: string | null;
          tenant_id: string;
          updated_at?: string;
          vps_host_id?: string | null;
          worker_url?: string | null;
        };
        Update: {
          api_service_key_encrypted?: string | null;
          api_url?: string | null;
          auth_admin_url?: string | null;
          auth_public_url?: string | null;
          branch_name?: string;
          cloud_run_service_resource_names?: Json | null;
          compute_provider?: string | null;
          created_at?: string;
          database_anon_key?: string | null;
          database_connection_string_encrypted?: string | null;
          database_host?: string | null;
          database_name?: string | null;
          database_password_encrypted?: string | null;
          database_port?: number | null;
          database_provider?: string | null;
          database_service_key_encrypted?: string | null;
          database_username?: string | null;
          dedicated_vps_id?: string | null;
          email_provider?: string | null;
          error_message?: string | null;
          id?: string;
          is_default_branch?: boolean;
          last_activity_at?: string | null;
          name?: string;
          neon_project_id?: string | null;
          permissions_read_url?: string | null;
          permissions_write_url?: string | null;
          postgrest_url?: string | null;
          postmark_server_id?: string | null;
          postmark_server_token_encrypted?: string | null;
          project_group_id?: string;
          provisioning_type?:
            | Database["public"]["Enums"]["provisioning_type"]
            | null;
          status?: Database["public"]["Enums"]["project_status"];
          storage_bucket_name?: string | null;
          storage_provider?: string | null;
          stripe_customer_id?: string | null;
          stripe_onboarding_complete?: boolean;
          suspension_reason?: string | null;
          tenant_id?: string;
          updated_at?: string;
          vps_host_id?: string | null;
          worker_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_vps_host_id_fkey";
            columns: ["vps_host_id"];
            referencedRelation: "vps_hosts";
            referencedColumns: ["id"];
          }
        ];
      };
      schema_migrations: {
        Row: {
          dirty: boolean;
          version: number;
        };
        Insert: {
          dirty: boolean;
          version: number;
        };
        Update: {
          dirty?: boolean;
          version?: number;
        };
        Relationships: [];
      };
      usage_metrics: {
        Row: {
          cloudrun_billable_time_seconds: number | null;
          cloudrun_memory_gb_seconds: number;
          cloudrun_requests: number;
          cloudrun_vcpu_seconds: number;
          created_at: string | null;
          db_compute_hours: number | null;
          db_storage_gb: number | null;
          email_sends: number | null;
          end_time: string;
          id: string;
          organization_id: string;
          project_group_id: string;
          project_id: string;
          start_time: string;
          storage_bytes: number | null;
          storage_operations: number | null;
          workers_cpu_ms: number | null;
          workers_requests: number | null;
        };
        Insert: {
          cloudrun_billable_time_seconds?: number | null;
          cloudrun_memory_gb_seconds?: number;
          cloudrun_requests?: number;
          cloudrun_vcpu_seconds?: number;
          created_at?: string | null;
          db_compute_hours?: number | null;
          db_storage_gb?: number | null;
          email_sends?: number | null;
          end_time: string;
          id?: string;
          organization_id: string;
          project_group_id: string;
          project_id: string;
          start_time: string;
          storage_bytes?: number | null;
          storage_operations?: number | null;
          workers_cpu_ms?: number | null;
          workers_requests?: number | null;
        };
        Update: {
          cloudrun_billable_time_seconds?: number | null;
          cloudrun_memory_gb_seconds?: number;
          cloudrun_requests?: number;
          cloudrun_vcpu_seconds?: number;
          created_at?: string | null;
          db_compute_hours?: number | null;
          db_storage_gb?: number | null;
          email_sends?: number | null;
          end_time?: string;
          id?: string;
          organization_id?: string;
          project_group_id?: string;
          project_id?: string;
          start_time?: string;
          storage_bytes?: number | null;
          storage_operations?: number | null;
          workers_cpu_ms?: number | null;
          workers_requests?: number | null;
        };
        Relationships: [];
      };
      vps_hosts: {
        Row: {
          created_at: string | null;
          current_tenants: number;
          health_check_url: string | null;
          id: string;
          ip_address: string;
          last_health_check: string | null;
          max_tenants: number;
          memory_gb: number;
          name: string;
          provider: Database["public"]["Enums"]["vps_provider"];
          provider_server_id: string;
          region: string;
          ssh_port: number | null;
          status: Database["public"]["Enums"]["vps_status"];
          storage_gb: number;
          tier: Database["public"]["Enums"]["vps_tier"];
          updated_at: string | null;
          vcpus: number;
        };
        Insert: {
          created_at?: string | null;
          current_tenants?: number;
          health_check_url?: string | null;
          id?: string;
          ip_address: string;
          last_health_check?: string | null;
          max_tenants?: number;
          memory_gb: number;
          name: string;
          provider: Database["public"]["Enums"]["vps_provider"];
          provider_server_id: string;
          region: string;
          ssh_port?: number | null;
          status?: Database["public"]["Enums"]["vps_status"];
          storage_gb: number;
          tier: Database["public"]["Enums"]["vps_tier"];
          updated_at?: string | null;
          vcpus: number;
        };
        Update: {
          created_at?: string | null;
          current_tenants?: number;
          health_check_url?: string | null;
          id?: string;
          ip_address?: string;
          last_health_check?: string | null;
          max_tenants?: number;
          memory_gb?: number;
          name?: string;
          provider?: Database["public"]["Enums"]["vps_provider"];
          provider_server_id?: string;
          region?: string;
          ssh_port?: number | null;
          status?: Database["public"]["Enums"]["vps_status"];
          storage_gb?: number;
          tier?: Database["public"]["Enums"]["vps_tier"];
          updated_at?: string | null;
          vcpus?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_last_collection_end_time: {
        Args: { p_project_id: string };
        Returns: string;
      };
      uuid_generate_v1: { Args: never; Returns: string };
      uuid_generate_v1mc: { Args: never; Returns: string };
      uuid_generate_v3: {
        Args: { name: string; namespace: string };
        Returns: string;
      };
      uuid_generate_v4: { Args: never; Returns: string };
      uuid_generate_v5: {
        Args: { name: string; namespace: string };
        Returns: string;
      };
      uuid_nil: { Args: never; Returns: string };
      uuid_ns_dns: { Args: never; Returns: string };
      uuid_ns_oid: { Args: never; Returns: string };
      uuid_ns_url: { Args: never; Returns: string };
      uuid_ns_x500: { Args: never; Returns: string };
    };
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
        | "deletion_failed";
      project_status:
        | "provisioning"
        | "active"
        | "suspended"
        | "failed"
        | "deleting"
        | "deleted";
      provisioning_type: "serverless" | "vps_shared" | "vps_dedicated";
      subscription_tier: "free" | "starter" | "payg" | "pro" | "enterprise";
      vps_provider: "hetzner" | "gcp" | "aws";
      vps_status: "active" | "full" | "maintenance" | "decommissioned";
      vps_tier: "shared_free" | "dedicated" | "shared_starter";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

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
      project_status: [
        "provisioning",
        "active",
        "suspended",
        "failed",
        "deleting",
        "deleted",
      ],
      provisioning_type: ["serverless", "vps_shared", "vps_dedicated"],
      subscription_tier: ["free", "starter", "payg", "pro", "enterprise"],
      vps_provider: ["hetzner", "gcp", "aws"],
      vps_status: ["active", "full", "maintenance", "decommissioned"],
      vps_tier: ["shared_free", "dedicated", "shared_starter"],
    },
  },
} as const;
