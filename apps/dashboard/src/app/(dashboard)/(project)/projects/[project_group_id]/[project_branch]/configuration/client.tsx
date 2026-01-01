"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  Copy,
} from "lucide-react";
import { Project } from "../dashboard/project-provisioning-dashboard";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import {
  fetchProjectSecretKey,
  fetchDatabasePassword,
  fetchDatabaseConnectionString,
  fetchPostmarkServerToken,
  fetchStorageCredentials,
} from "../settings/actions";
import { cn } from "@/lib/utils";

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
    | "postmark_token"
    | "storage_secret_key";
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
  const [copyingEnv, setCopyingEnv] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const copyOmnibaseEnv = async () => {
    setCopyingEnv(true);
    try {
      // Fetch the API service key
      const result = await fetchProjectSecretKey(project.id);

      let serviceKey = "UNAUTHORIZED";
      if (result?.success && result.serviceKey) {
        serviceKey = result.serviceKey;
      }

      const envVars = [
        `OMNIBASE_PROJECT_ID=${project.id}`,
        `OMNIBASE_API_URL=${project.api_url || ""}`,
        `OMNIBASE_SERVICE_KEY=${serviceKey}`,
      ].join("\n");

      navigator.clipboard.writeText(envVars);

      if (!result?.success) {
        toast.warning("OmniBase env copied with placeholder for unauthorized keys");
      } else {
        toast.success("OmniBase environment variables copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to copy environment variables");
    } finally {
      setCopyingEnv(false);
    }
  };

  const copyAllEnv = async () => {
    setCopyingEnv(true);
    let hasUnauthorized = false;

    try {
      // Fetch all sensitive values in parallel
      const [serviceKeyResult, dbPasswordResult, connStringResult, postmarkResult, storageResult] = await Promise.all([
        fetchProjectSecretKey(project.id),
        fetchDatabasePassword(project.id),
        fetchDatabaseConnectionString(project.id),
        fetchPostmarkServerToken(project.id),
        fetchStorageCredentials(project.id),
      ]);

      // Helper to get value or UNAUTHORIZED
      const getValue = (result: { success: boolean; [key: string]: any } | undefined, key: string) => {
        if (result?.success && result[key]) {
          return result[key];
        }
        hasUnauthorized = true;
        return "UNAUTHORIZED";
      };

      const envVars: string[] = [];

      // OmniBase core
      envVars.push(`OMNIBASE_PROJECT_ID=${project.id}`);
      if (project.api_url) envVars.push(`OMNIBASE_API_URL=${project.api_url}`);
      envVars.push(`OMNIBASE_SERVICE_KEY=${getValue(serviceKeyResult, "serviceKey")}`);

      // Auth
      if (project.auth_public_url) envVars.push(`OMNIBASE_AUTH_URL=${project.auth_public_url}`);
      if (project.auth_admin_url) envVars.push(`OMNIBASE_AUTH_ADMIN_URL=${project.auth_admin_url}`);

      // Database
      if (project.postgrest_url) envVars.push(`OMNIBASE_POSTGREST_URL=${project.postgrest_url}`);
      if (project.database_anon_key) envVars.push(`OMNIBASE_ANON_KEY=${project.database_anon_key}`);
      if (project.database_host) envVars.push(`OMNIBASE_DATABASE_HOST=${project.database_host}`);
      if (project.database_port) envVars.push(`OMNIBASE_DATABASE_PORT=${project.database_port}`);
      if (project.database_name) envVars.push(`OMNIBASE_DATABASE_NAME=${project.database_name}`);
      if (project.database_username) envVars.push(`OMNIBASE_DATABASE_USERNAME=${project.database_username}`);
      envVars.push(`OMNIBASE_DATABASE_PASSWORD=${getValue(dbPasswordResult, "password")}`);
      envVars.push(`OMNIBASE_DATABASE_URL=${getValue(connStringResult, "connectionString")}`);

      // Storage
      if (project.storage_bucket_name) envVars.push(`OMNIBASE_STORAGE_BUCKET=${project.storage_bucket_name}`);
      if (project.storage_endpoint) envVars.push(`OMNIBASE_STORAGE_ENDPOINT=${project.storage_endpoint}`);
      if (project.storage_access_key) envVars.push(`OMNIBASE_STORAGE_ACCESS_KEY=${project.storage_access_key}`);
      envVars.push(`OMNIBASE_STORAGE_SECRET_KEY=${getValue(storageResult, "secretKey")}`);

      // Email
      if (project.postmark_server_id) envVars.push(`OMNIBASE_POSTMARK_SERVER_ID=${project.postmark_server_id}`);
      envVars.push(`OMNIBASE_POSTMARK_SERVER_TOKEN=${getValue(postmarkResult, "token")}`);

      // Worker
      if (project.worker_url) envVars.push(`OMNIBASE_WORKER_URL=${project.worker_url}`);

      navigator.clipboard.writeText(envVars.join("\n"));

      if (hasUnauthorized) {
        toast.warning("Environment variables copied. Some values show UNAUTHORIZED due to missing permissions.");
      } else {
        toast.success("All environment variables copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to copy environment variables");
    } finally {
      setCopyingEnv(false);
    }
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
            accessKey?: string;
            secretKey?: string;
            endpoint?: string;
            bucketName?: string;
          }
        | undefined;
      switch (encryptedField) {
        case "service_key":
          result = await fetchProjectSecretKey(project.id);
          console.log(result);
          if (result?.success && result.serviceKey) {
            console.log(result);
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
        case "storage_secret_key":
          result = await fetchStorageCredentials(project.id);
          if (result?.success && result.secretKey) {
            setDecryptedValues((prev) =>
              new Map(prev).set(key, result!.secretKey!)
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
        { label: "Storage Endpoint", value: project.storage_endpoint },
        { label: "Storage Access Key", value: project.storage_access_key },
        {
          label: "Storage Secret Key",
          value: project.storage_secret_key_encrypted,
          sensitive: true,
          encryptedField: "storage_secret_key",
        },
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

  const [activeSection, setActiveSection] = useState<string>(
    visibleSections[0]?.title || ""
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const getSectionId = (title: string) =>
    title.toLowerCase().replace(/\s+/g, "-");

  const scrollToSection = (title: string) => {
    const sectionId = getSectionId(title);
    const element = document.getElementById(sectionId);
    if (element && contentRef.current) {
      const containerTop = contentRef.current.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const offset = elementTop - containerTop + contentRef.current.scrollTop;
      contentRef.current.scrollTo({
        top: offset - 24,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();

      for (const section of visibleSections) {
        const element = document.getElementById(getSectionId(section.title));
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const relativeTop = elementRect.top - containerRect.top;

          if (relativeTop <= 100 && relativeTop > -elementRect.height + 100) {
            setActiveSection(section.title);
            break;
          }
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [visibleSections]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto flex h-full max-w-7xl">
          {/* Main Content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Configuration
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    View and copy your project configuration and service URLs
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    disabled={copyingEnv}
                  >
                    {copyingEnv ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy Env
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={copyingEnv ? undefined : copyOmnibaseEnv}
                      className={copyingEnv ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      Copy OmniBase Env
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={copyingEnv ? undefined : copyAllEnv}
                      className={copyingEnv ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      Copy All Env Variables
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Configuration Sections */}
              <div className="space-y-6">
                {visibleSections.map((section) => (
                  <Card key={section.title} id={getSectionId(section.title)}>
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
                                      toggleReveal(
                                        secretKey,
                                        item.encryptedField
                                      )
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
                                      item.sensitive &&
                                        isRevealed &&
                                        decryptedValue
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

          {/* Sidebar Navigation */}
          <nav className="hidden lg:block w-48 flex-shrink-0 border-l p-4">
            <div className="sticky top-0 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                On this page
              </p>
              {visibleSections.map((section) => (
                <button
                  key={section.title}
                  onClick={() => scrollToSection(section.title)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left",
                    activeSection === section.title
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {section.icon}
                  <span className="truncate">{section.title}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
