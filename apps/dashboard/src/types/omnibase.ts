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
      api_keys: {
        Row: {
          created_at: string;
          created_by: string;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          key_hash: string;
          key_prefix: string;
          last_used_at: string | null;
          name: string;
          permissions: Json | null;
          tenant_id: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          key_hash: string;
          key_prefix: string;
          last_used_at?: string | null;
          name: string;
          permissions?: Json | null;
          tenant_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          key_hash?: string;
          key_prefix?: string;
          last_used_at?: string | null;
          name?: string;
          permissions?: Json | null;
          tenant_id?: string;
        };
        Relationships: [];
      };
      clusters: {
        Row: {
          created_at: string;
          current_tenants: number;
          error_message: string | null;
          id: string;
          kubeconfig_encrypted: string | null;
          label: string;
          max_tenants: number;
          node_count: number | null;
          node_type: string | null;
          rancher_cluster_id: string | null;
          ready_at: string | null;
          region: string;
          status: Database["public"]["Enums"]["cluster_status"];
          updated_at: string;
          vultr_id: string | null;
        };
        Insert: {
          created_at?: string;
          current_tenants?: number;
          error_message?: string | null;
          id?: string;
          kubeconfig_encrypted?: string | null;
          label: string;
          max_tenants?: number;
          node_count?: number | null;
          node_type?: string | null;
          rancher_cluster_id?: string | null;
          ready_at?: string | null;
          region: string;
          status?: Database["public"]["Enums"]["cluster_status"];
          updated_at?: string;
          vultr_id?: string | null;
        };
        Update: {
          created_at?: string;
          current_tenants?: number;
          error_message?: string | null;
          id?: string;
          kubeconfig_encrypted?: string | null;
          label?: string;
          max_tenants?: number;
          node_count?: number | null;
          node_type?: string | null;
          rancher_cluster_id?: string | null;
          ready_at?: string | null;
          region?: string;
          status?: Database["public"]["Enums"]["cluster_status"];
          updated_at?: string;
          vultr_id?: string | null;
        };
        Relationships: [];
      };
      "migrations.init_migrations": {
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
      postgres_instances: {
        Row: {
          allocated_storage_mb: number;
          cluster_id: string;
          created_at: string;
          endpoint: string;
          error_message: string | null;
          id: string;
          instance_number: number;
          max_storage_mb: number;
          name: string;
          namespace: string;
          pod_name: string;
          region_code: string;
          status: string;
          tenant_count: number;
          updated_at: string;
        };
        Insert: {
          allocated_storage_mb?: number;
          cluster_id: string;
          created_at?: string;
          endpoint?: string;
          error_message?: string | null;
          id?: string;
          instance_number?: number;
          max_storage_mb: number;
          name: string;
          namespace: string;
          pod_name: string;
          region_code?: string;
          status?: string;
          tenant_count?: number;
          updated_at?: string;
        };
        Update: {
          allocated_storage_mb?: number;
          cluster_id?: string;
          created_at?: string;
          endpoint?: string;
          error_message?: string | null;
          id?: string;
          instance_number?: number;
          max_storage_mb?: number;
          name?: string;
          namespace?: string;
          pod_name?: string;
          region_code?: string;
          status?: string;
          tenant_count?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "postgres_instances_cluster_id_fkey";
            columns: ["cluster_id"];
            referencedRelation: "clusters";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          api_service_key_encrypted: string | null;
          api_url: string | null;
          branch_name: string;
          cluster_id: string | null;
          compute_deployment_id: string | null;
          created_at: string;
          database_anon_key: string | null;
          database_connection_string_encrypted: string | null;
          database_deployment_id: string | null;
          database_host: string | null;
          database_name: string | null;
          database_password_encrypted: string | null;
          database_port: number | null;
          database_service_key_encrypted: string | null;
          database_username: string | null;
          deprovisioned_at: string | null;
          email_deployment_id: string | null;
          error_message: string | null;
          id: string;
          is_default_branch: boolean;
          last_activity_at: string | null;
          minio_instance_id: string | null;
          minio_storage_allocation_mb: number | null;
          name: string;
          namespace: string | null;
          neon_project_id: string | null;
          postgres_instance_id: string | null;
          postgrest_url: string | null;
          postmark_server_id: string | null;
          postmark_server_token_encrypted: string | null;
          project_group_id: string;
          status: Database["public"]["Enums"]["project_status"];
          storage_access_key: string | null;
          storage_allocation_mb: number | null;
          storage_bucket_name: string | null;
          storage_deployment_id: string | null;
          storage_endpoint: string | null;
          storage_secret_key_encrypted: string | null;
          stripe_customer_id: string | null;
          stripe_onboarding_complete: boolean;
          suspension_reason: string | null;
          tenant_id: string;
          updated_at: string;
          worker_url: string | null;
          workers_deployment_id: string | null;
        };
        Insert: {
          api_service_key_encrypted?: string | null;
          api_url?: string | null;
          branch_name: string;
          cluster_id?: string | null;
          compute_deployment_id?: string | null;
          created_at?: string;
          database_anon_key?: string | null;
          database_connection_string_encrypted?: string | null;
          database_deployment_id?: string | null;
          database_host?: string | null;
          database_name?: string | null;
          database_password_encrypted?: string | null;
          database_port?: number | null;
          database_service_key_encrypted?: string | null;
          database_username?: string | null;
          deprovisioned_at?: string | null;
          email_deployment_id?: string | null;
          error_message?: string | null;
          id?: string;
          is_default_branch?: boolean;
          last_activity_at?: string | null;
          minio_instance_id?: string | null;
          minio_storage_allocation_mb?: number | null;
          name: string;
          namespace?: string | null;
          neon_project_id?: string | null;
          postgres_instance_id?: string | null;
          postgrest_url?: string | null;
          postmark_server_id?: string | null;
          postmark_server_token_encrypted?: string | null;
          project_group_id: string;
          status?: Database["public"]["Enums"]["project_status"];
          storage_access_key?: string | null;
          storage_allocation_mb?: number | null;
          storage_bucket_name?: string | null;
          storage_deployment_id?: string | null;
          storage_endpoint?: string | null;
          storage_secret_key_encrypted?: string | null;
          stripe_customer_id?: string | null;
          stripe_onboarding_complete?: boolean;
          suspension_reason?: string | null;
          tenant_id: string;
          updated_at?: string;
          worker_url?: string | null;
          workers_deployment_id?: string | null;
        };
        Update: {
          api_service_key_encrypted?: string | null;
          api_url?: string | null;
          branch_name?: string;
          cluster_id?: string | null;
          compute_deployment_id?: string | null;
          created_at?: string;
          database_anon_key?: string | null;
          database_connection_string_encrypted?: string | null;
          database_deployment_id?: string | null;
          database_host?: string | null;
          database_name?: string | null;
          database_password_encrypted?: string | null;
          database_port?: number | null;
          database_service_key_encrypted?: string | null;
          database_username?: string | null;
          deprovisioned_at?: string | null;
          email_deployment_id?: string | null;
          error_message?: string | null;
          id?: string;
          is_default_branch?: boolean;
          last_activity_at?: string | null;
          minio_instance_id?: string | null;
          minio_storage_allocation_mb?: number | null;
          name?: string;
          namespace?: string | null;
          neon_project_id?: string | null;
          postgres_instance_id?: string | null;
          postgrest_url?: string | null;
          postmark_server_id?: string | null;
          postmark_server_token_encrypted?: string | null;
          project_group_id?: string;
          status?: Database["public"]["Enums"]["project_status"];
          storage_access_key?: string | null;
          storage_allocation_mb?: number | null;
          storage_bucket_name?: string | null;
          storage_deployment_id?: string | null;
          storage_endpoint?: string | null;
          storage_secret_key_encrypted?: string | null;
          stripe_customer_id?: string | null;
          stripe_onboarding_complete?: boolean;
          suspension_reason?: string | null;
          tenant_id?: string;
          updated_at?: string;
          worker_url?: string | null;
          workers_deployment_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_cluster_id_fkey";
            columns: ["cluster_id"];
            referencedRelation: "clusters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_minio_instance_id_fkey";
            columns: ["minio_instance_id"];
            referencedRelation: "storage_instances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_postgres_instance_id_fkey";
            columns: ["postgres_instance_id"];
            referencedRelation: "postgres_instances";
            referencedColumns: ["id"];
          },
        ];
      };
      storage_instances: {
        Row: {
          allocated_storage_mb: number;
          cluster_id: string;
          created_at: string;
          endpoint: string;
          error_message: string | null;
          id: string;
          instance_number: number;
          max_storage_mb: number;
          name: string;
          namespace: string;
          pod_name: string;
          region_code: string;
          status: string;
          tenant_count: number;
          updated_at: string;
        };
        Insert: {
          allocated_storage_mb?: number;
          cluster_id: string;
          created_at?: string;
          endpoint: string;
          error_message?: string | null;
          id?: string;
          instance_number: number;
          max_storage_mb: number;
          name: string;
          namespace: string;
          pod_name: string;
          region_code: string;
          status?: string;
          tenant_count?: number;
          updated_at?: string;
        };
        Update: {
          allocated_storage_mb?: number;
          cluster_id?: string;
          created_at?: string;
          endpoint?: string;
          error_message?: string | null;
          id?: string;
          instance_number?: number;
          max_storage_mb?: number;
          name?: string;
          namespace?: string;
          pod_name?: string;
          region_code?: string;
          status?: string;
          tenant_count?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "minio_instances_cluster_id_fkey";
            columns: ["cluster_id"];
            referencedRelation: "clusters";
            referencedColumns: ["id"];
          },
        ];
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
          deployment_id: string | null;
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
          deployment_id?: string | null;
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
          deployment_id?: string | null;
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
      webhook_registrations: {
        Row: {
          account_id: string;
          active: boolean;
          callback_url: string;
          connect: boolean;
          created_at: string;
          events: string[];
          id: string;
          pseudo_id: string;
          secret: string;
          tenant_id: string;
          updated_at: string;
          webhook_id: string;
        };
        Insert: {
          account_id: string;
          active?: boolean;
          callback_url: string;
          connect?: boolean;
          created_at?: string;
          events: string[];
          id?: string;
          pseudo_id: string;
          secret: string;
          tenant_id: string;
          updated_at?: string;
          webhook_id: string;
        };
        Update: {
          account_id?: string;
          active?: boolean;
          callback_url?: string;
          connect?: boolean;
          created_at?: string;
          events?: string[];
          id?: string;
          pseudo_id?: string;
          secret?: string;
          tenant_id?: string;
          updated_at?: string;
          webhook_id?: string;
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
      cluster_status:
        | "provisioning"
        | "active"
        | "maintenance"
        | "failed"
        | "deleted";
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
      subscription_tier: "free" | "starter" | "payg" | "pro" | "enterprise";
      vps_provider: "vultr" | "gcp" | "aws";
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
    : never = never,
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
    : never = never,
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
    : never = never,
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
    : never = never,
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
    : never = never,
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
      cluster_status: [
        "provisioning",
        "active",
        "maintenance",
        "failed",
        "deleted",
      ],
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
      subscription_tier: ["free", "starter", "payg", "pro", "enterprise"],
      vps_provider: ["vultr", "gcp", "aws"],
      vps_status: ["active", "full", "maintenance", "decommissioned"],
      vps_tier: ["shared_free", "dedicated", "shared_starter"],
    },
  },
} as const;
