"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Database,
  Globe,
  Key,
  Mail,
  Shield,
  Cloud,
  Boxes,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Project } from "../dashboard/project-provisioning-dashboard";
import { toast } from "sonner";
import { useState } from "react";
import {
  fetchProjectSecretKey,
  fetchDatabasePassword,
  fetchDatabaseConnectionString,
  fetchPostmarkServerToken,
} from "../settings/actions";

interface ConfigurationClientProps {
  project: Project;
}

interface ConfigItem {
  label: string;
  value: string | null | undefined;
  sensitive?: boolean;
  encryptedField?:
    | "service_key"
    | "database_password"
    | "connection_string"
    | "postmark_token";
}

interface ConfigSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  provider?: string | null;
  items: ConfigItem[];
}

export function ConfigurationClient({ project }: ConfigurationClientProps) {
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(
    new Set()
  );
  const [decryptedValues, setDecryptedValues] = useState<Map<string, string>>(
    new Map()
  );
  const [loadingSecrets, setLoadingSecrets] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const toggleReveal = async (key: string, encryptedField?: string) => {
    const isCurrentlyRevealed = revealedSecrets.has(key);

    // If hiding, just remove from revealed set
    if (isCurrentlyRevealed) {
      setRevealedSecrets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      return;
    }

    // If revealing and we already have the decrypted value, just show it
    if (decryptedValues.has(key)) {
      setRevealedSecrets((prev) => {
        const newSet = new Set(prev);
        newSet.add(key);
        return newSet;
      });
      return;
    }

    // Otherwise, fetch the decrypted value from the backend
    if (!encryptedField) {
      return;
    }

    setLoadingSecrets((prev) => new Set(prev).add(key));
    setErrors((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });

    try {
      let result:
        | {
            success: boolean;
            error?: string;
            serviceKey?: string;
            password?: string;
            connectionString?: string;
            token?: string;
          }
        | undefined;
      switch (encryptedField) {
        case "service_key":
          result = await fetchProjectSecretKey(project.id);
          if (result?.success && result.serviceKey) {
            setDecryptedValues((prev) =>
              new Map(prev).set(key, result!.serviceKey!)
            );
          }
          break;
        case "database_password":
          result = await fetchDatabasePassword(project.id);
          if (result?.success && result.password) {
            setDecryptedValues((prev) =>
              new Map(prev).set(key, result!.password!)
            );
          }
          break;
        case "connection_string":
          result = await fetchDatabaseConnectionString(project.id);
          if (result?.success && result.connectionString) {
            setDecryptedValues((prev) =>
              new Map(prev).set(key, result!.connectionString!)
            );
          }
          break;
        case "postmark_token":
          result = await fetchPostmarkServerToken(project.id);
          if (result?.success && result.token) {
            setDecryptedValues((prev) =>
              new Map(prev).set(key, result!.token!)
            );
          }
          break;
      }

      if (result && result.success) {
        setRevealedSecrets((prev) => {
          const newSet = new Set(prev);
          newSet.add(key);
          return newSet;
        });
      } else if (result && result.error) {
        setErrors((prev) => new Map(prev).set(key, result.error!));
        toast.error(result.error);
      }
    } catch (error) {
      const errorMessage = "Failed to decrypt secret";
      setErrors((prev) => new Map(prev).set(key, errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoadingSecrets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const sections: ConfigSection[] = [
    {
      title: "Authentication",
      description: "Authentication service endpoints and credentials",
      icon: <Shield className="h-5 w-5 text-primary" />,
      items: [
        { label: "Auth Public URL", value: project.auth_public_url },
        { label: "Auth Admin URL", value: project.auth_admin_url },
      ],
    },
    {
      title: "Database",
      description: "Database connection information",
      icon: <Database className="h-5 w-5 text-primary" />,
      provider: project.database_provider,
      items: [
        { label: "PostgREST URL", value: project.postgrest_url },
        { label: "Anon Key", value: project.database_anon_key },
        {
          label: "Database Service Key",
          value: project.database_service_key_encrypted,
          sensitive: true,
          encryptedField: "service_key",
        },
        { label: "Database Host", value: project.database_host },
        { label: "Database Port", value: project.database_port?.toString() },
        { label: "Database Name", value: project.database_name },
        { label: "Database Username", value: project.database_username },
        {
          label: "Database Password",
          value: project.database_password_encrypted,
          sensitive: true,
          encryptedField: "database_password",
        },
        {
          label: "Connection String",
          value: project.database_connection_string_encrypted,
          sensitive: true,
          encryptedField: "connection_string",
        },
        { label: "Neon Project ID", value: project.neon_project_id },
      ],
    },
    {
      title: "API Endpoints",
      description: "Core API service URLs",
      icon: <Globe className="h-5 w-5 text-primary" />,
      provider: project.compute_provider,
      items: [
        { label: "API URL", value: project.api_url },
        {
          label: "REST API Service Key",
          value: project.api_service_key_encrypted,
          sensitive: true,
          encryptedField: "service_key",
        },
        { label: "Worker URL", value: project.worker_url },
      ],
    },
    {
      title: "Permissions",
      description: "Permission service endpoints",
      icon: <Key className="h-5 w-5 text-primary" />,
      items: [
        { label: "Permissions Read URL", value: project.permissions_read_url },
        {
          label: "Permissions Write URL",
          value: project.permissions_write_url,
        },
      ],
    },
    {
      title: "Storage",
      description: "Object storage configuration",
      icon: <Cloud className="h-5 w-5 text-primary" />,
      provider: project.storage_provider,
      items: [
        { label: "Storage Bucket Name", value: project.storage_bucket_name },
      ],
    },
    {
      title: "Email",
      description: "Email service configuration",
      icon: <Mail className="h-5 w-5 text-primary" />,
      provider: project.email_provider,
      items: [
        { label: "Postmark Server ID", value: project.postmark_server_id },
        {
          label: "Postmark Server Token",
          value: project.postmark_server_token_encrypted,
          sensitive: true,
          encryptedField: "postmark_token",
        },
      ],
    },
    {
      title: "Infrastructure",
      description: "Hosting and infrastructure details",
      icon: <Boxes className="h-5 w-5 text-primary" />,
      provider: project.compute_provider,
      items: [
        { label: "VPS Host ID", value: project.vps_host_id },
        { label: "Dedicated VPS ID", value: project.dedicated_vps_id },
        { label: "Provisioning Type", value: project.provisioning_type },
      ],
    },
  ];

  // Filter out sections with no values
  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.value),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
            <p className="mt-2 text-muted-foreground">
              View and copy your project configuration and service URLs
            </p>
          </div>

          {/* Configuration Sections */}
          <div className="space-y-6">
            {visibleSections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {section.icon}
                      {section.title}
                    </CardTitle>
                    {section.provider && (
                      <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {section.provider}
                      </span>
                    )}
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.items.map((item) => {
                      const secretKey = `${section.title}-${item.label}`;
                      const isRevealed = revealedSecrets.has(secretKey);
                      const isLoading = loadingSecrets.has(secretKey);
                      const error = errors.get(secretKey);
                      const decryptedValue = decryptedValues.get(secretKey);

                      // Determine what value to display
                      let displayValue = item.value;
                      if (item.sensitive && item.value) {
                        if (isLoading) {
                          displayValue = "Decrypting...";
                        } else if (error) {
                          displayValue = `Error: ${error}`;
                        } else if (isRevealed && decryptedValue) {
                          displayValue = decryptedValue;
                        } else if (!isRevealed) {
                          displayValue = "••••••••••••••••";
                        }
                      }

                      return (
                        <div
                          key={item.label}
                          className="flex items-start justify-between gap-4 rounded-lg border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              {item.label}
                            </p>
                            <p
                              className={`mt-1 font-mono text-sm break-all ${
                                error ? "text-destructive" : ""
                              }`}
                            >
                              {displayValue}
                            </p>
                          </div>
                          <div className="flex flex-shrink-0 gap-2">
                            {item.sensitive && item.value && (
                              <button
                                onClick={() =>
                                  toggleReveal(secretKey, item.encryptedField)
                                }
                                disabled={isLoading}
                                className="rounded px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isRevealed ? "Hide" : "Reveal"}
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : isRevealed ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleCopy(
                                  item.sensitive && isRevealed && decryptedValue
                                    ? decryptedValue
                                    : item.value || "",
                                  item.label
                                )
                              }
                              disabled={item.sensitive && !isRevealed}
                              className="rounded px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
