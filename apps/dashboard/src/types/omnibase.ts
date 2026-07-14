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
      api_keys: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          tenant_id?: string
        }
        Relationships: []
      }
      clusters: {
        Row: {
          api_server_url: string | null
          created_at: string
          error_message: string | null
          id: string
          kubeconfig_encrypted: string | null
          label: string
          region: string
          status: Database["public"]["Enums"]["cluster_status"]
          updated_at: string
          vultr_id: string | null
        }
        Insert: {
          api_server_url?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          kubeconfig_encrypted?: string | null
          label: string
          region: string
          status?: Database["public"]["Enums"]["cluster_status"]
          updated_at?: string
          vultr_id?: string | null
        }
        Update: {
          api_server_url?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          kubeconfig_encrypted?: string | null
          label?: string
          region?: string
          status?: Database["public"]["Enums"]["cluster_status"]
          updated_at?: string
          vultr_id?: string | null
        }
        Relationships: []
      }
      "migrations.init_migrations": {
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
      project_branches: {
        Row: {
          api_service_key_encrypted: string | null
          api_url: string | null
          cluster_id: string | null
          created_at: string
          database_anon_key: string | null
          database_connection_string_encrypted: string | null
          database_host: string | null
          database_name: string | null
          database_password_encrypted: string | null
          database_port: number | null
          database_service_key_encrypted: string | null
          database_username: string | null
          deprovisioned_at: string | null
          email_deployment_id: string | null
          error_message: string | null
          id: string
          last_activity_at: string | null
          name: string
          namespace: string | null
          postgrest_url: string | null
          postmark_server_id: string | null
          postmark_server_token_encrypted: string | null
          project_id: string
          status: Database["public"]["Enums"]["project_branch_status"]
          storage_access_key: string | null
          storage_bucket_name: string | null
          storage_endpoint: string | null
          storage_secret_key_encrypted: string | null
          stripe_account_id: string | null
          stripe_environment: string | null
          suspension_reason: string | null
          updated_at: string
          worker_url: string | null
          workers_deployment_id: string | null
        }
        Insert: {
          api_service_key_encrypted?: string | null
          api_url?: string | null
          cluster_id?: string | null
          created_at?: string
          database_anon_key?: string | null
          database_connection_string_encrypted?: string | null
          database_host?: string | null
          database_name?: string | null
          database_password_encrypted?: string | null
          database_port?: number | null
          database_service_key_encrypted?: string | null
          database_username?: string | null
          deprovisioned_at?: string | null
          email_deployment_id?: string | null
          error_message?: string | null
          id?: string
          last_activity_at?: string | null
          name: string
          namespace?: string | null
          postgrest_url?: string | null
          postmark_server_id?: string | null
          postmark_server_token_encrypted?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["project_branch_status"]
          storage_access_key?: string | null
          storage_bucket_name?: string | null
          storage_endpoint?: string | null
          storage_secret_key_encrypted?: string | null
          stripe_account_id?: string | null
          stripe_environment?: string | null
          suspension_reason?: string | null
          updated_at?: string
          worker_url?: string | null
          workers_deployment_id?: string | null
        }
        Update: {
          api_service_key_encrypted?: string | null
          api_url?: string | null
          cluster_id?: string | null
          created_at?: string
          database_anon_key?: string | null
          database_connection_string_encrypted?: string | null
          database_host?: string | null
          database_name?: string | null
          database_password_encrypted?: string | null
          database_port?: number | null
          database_service_key_encrypted?: string | null
          database_username?: string | null
          deprovisioned_at?: string | null
          email_deployment_id?: string | null
          error_message?: string | null
          id?: string
          last_activity_at?: string | null
          name?: string
          namespace?: string | null
          postgrest_url?: string | null
          postmark_server_id?: string | null
          postmark_server_token_encrypted?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["project_branch_status"]
          storage_access_key?: string | null
          storage_bucket_name?: string | null
          storage_endpoint?: string | null
          storage_secret_key_encrypted?: string | null
          stripe_account_id?: string | null
          stripe_environment?: string | null
          suspension_reason?: string | null
          updated_at?: string
          worker_url?: string | null
          workers_deployment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_branches_cluster_id_fkey"
            columns: ["cluster_id"]
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_branches_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          clustersId: string | null
          created_at: string
          deployment_type: string
          error_message: string | null
          id: string
          name: string
          suspension_reason: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          clustersId?: string | null
          created_at?: string
          deployment_type?: string
          error_message?: string | null
          id?: string
          name: string
          suspension_reason?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          clustersId?: string | null
          created_at?: string
          deployment_type?: string
          error_message?: string | null
          id?: string
          name?: string
          suspension_reason?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          created_at: string | null
          db_compute_hours: number | null
          db_storage_gb: number | null
          email_sends: number | null
          end_time: string
          id: string
          project_group_id: string
          project_id: string
          start_time: string
          storage_bytes: number | null
          storage_operations: number | null
          tenant_id: string
          workers_cpu_ms: number | null
          workers_requests: number | null
        }
        Insert: {
          created_at?: string | null
          db_compute_hours?: number | null
          db_storage_gb?: number | null
          email_sends?: number | null
          end_time: string
          id?: string
          project_group_id: string
          project_id: string
          start_time: string
          storage_bytes?: number | null
          storage_operations?: number | null
          tenant_id: string
          workers_cpu_ms?: number | null
          workers_requests?: number | null
        }
        Update: {
          created_at?: string | null
          db_compute_hours?: number | null
          db_storage_gb?: number | null
          email_sends?: number | null
          end_time?: string
          id?: string
          project_group_id?: string
          project_id?: string
          start_time?: string
          storage_bytes?: number | null
          storage_operations?: number | null
          tenant_id?: string
          workers_cpu_ms?: number | null
          workers_requests?: number | null
        }
        Relationships: []
      }
      webhook_registrations: {
        Row: {
          account_id: string
          active: boolean
          callback_url: string
          connect: boolean
          created_at: string
          events: string[] | null
          id: string
          secret: string
          tenant_id: string
          updated_at: string
          webhook_id: string
        }
        Insert: {
          account_id: string
          active?: boolean
          callback_url: string
          connect?: boolean
          created_at?: string
          events?: string[] | null
          id?: string
          secret: string
          tenant_id: string
          updated_at?: string
          webhook_id: string
        }
        Update: {
          account_id?: string
          active?: boolean
          callback_url?: string
          connect?: boolean
          created_at?: string
          events?: string[] | null
          id?: string
          secret?: string
          tenant_id?: string
          updated_at?: string
          webhook_id?: string
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
      cluster_status:
        | "provisioning"
        | "active"
        | "maintenance"
        | "failed"
        | "deleted"
      project_branch_status:
        | "provisioning"
        | "active"
        | "suspended"
        | "failed"
        | "deleting"
        | "deleted"
        | "failed_deletion"
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
      cluster_status: [
        "provisioning",
        "active",
        "maintenance",
        "failed",
        "deleted",
      ],
      project_branch_status: [
        "provisioning",
        "active",
        "suspended",
        "failed",
        "deleting",
        "deleted",
        "failed_deletion",
      ],
    },
  },
} as const
