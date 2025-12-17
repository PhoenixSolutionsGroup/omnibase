"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Server, Cloud, Cpu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// --- Types ---

type SharedTier = {
  id: string;
  name: string;
  description: string;
  regions: string[];
};

type DedicatedProvider = {
  id: string;
  name: string;
  type: "vps" | "serverless";
  regions: string[];
  machine_types?: { id: string; name: string }[];
  resource_config?: {
    services: string[];
    options: {
      vcpu: number[];
      memory_mb: number[];
    };
    limits: {
      min_scale: { min: number; max: number };
      max_scale: { min: number; max: number };
    };
  };
};

type DeploymentOptions = {
  shared_deployments: SharedTier[];
  dedicated_deployments: {
    can_provision: boolean;
    providers: DedicatedProvider[];
  };
};

type FormData = {
  name: string;
  branch_name?: string;
  website_url: string;
  billing_email: string;
  deployment_mode: "shared" | "dedicated";
  shared_tier: string;
  shared_region: string;
  dedicated_provider: string;
  dedicated_region: string;
  dedicated_machine_type: string;
  serverless_config: Record<
    string,
    {
      vcpu: number;
      memory_mb: number;
      min_scale: number;
      max_scale: number;
    }
  >;
};

interface ProvisioningFormProps {
  mode: "project" | "branch";
  projectGroupId?: string;
  projectName?: string;
}

export function ProvisioningForm({
  mode,
  projectGroupId,
  projectName,
}: ProvisioningFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [options, setOptions] = React.useState<DeploymentOptions | null>(null);

  const isBranchMode = mode === "branch";

  const [formData, setFormData] = React.useState<FormData>({
    name: isBranchMode ? projectName || "" : "",
    branch_name: "",
    website_url: "",
    billing_email: "",
    deployment_mode: "shared",
    shared_tier: "free",
    shared_region: "",
    dedicated_provider: "",
    dedicated_region: "",
    dedicated_machine_type: "",
    serverless_config: {},
  });

  const managed_hosting_url = process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL;
  if (!managed_hosting_url) {
    throw new Error("Must set NEXT_PUBLIC_MANAGED_HOSTING_API_URL");
  }
  // --- Fetch Options ---
  React.useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch(
          managed_hosting_url + "/api/v1/projects/options",
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to fetch options");
        const data = await res.json();
        setOptions(data);

        // Set initial shared region if available
        if (data.shared_deployments.length > 0) {
          const freeTier = data.shared_deployments.find(
            (t: SharedTier) => t.id === "free"
          );
          if (freeTier && freeTier.regions.length > 0) {
            setFormData((prev) => ({
              ...prev,
              shared_region: freeTier.regions[0],
            }));
          }
        }
      } catch (error) {
        toast.error("Failed to load deployment options");
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  const selectedProvider = options?.dedicated_deployments.providers.find(
    (p) => p.id === formData.dedicated_provider
  );

  // Initialize serverless config defaults when provider changes
  React.useEffect(() => {
    if (
      selectedProvider?.type === "serverless" &&
      selectedProvider.resource_config
    ) {
      const defaults: Record<string, any> = {};
      selectedProvider.resource_config.services.forEach((service) => {
        defaults[service] = {
          vcpu: 1,
          memory_mb: 512,
          min_scale: 0,
          max_scale: 1,
        };
      });
      setFormData((prev) => ({ ...prev, serverless_config: defaults }));
    }
  }, [selectedProvider]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        website_url: formData.website_url,
        billing_email: formData.billing_email,
      };

      // Add branch-specific fields
      if (isBranchMode) {
        payload.branch_name = formData.branch_name;
        payload.project_group_id = projectGroupId;
      }

      if (formData.deployment_mode === "shared") {
        payload.template = formData.shared_tier;
        // Note: Backend template logic handles defaults.
        // If we want to support custom regions for shared, backend needs update.
      } else {
        // Dedicated Payload Construction
        const providerConfig: any = {
          provider: formData.dedicated_provider,
          region: formData.dedicated_region,
        };

        if (selectedProvider?.type === "vps") {
          providerConfig.type = formData.dedicated_machine_type;
        } else if (selectedProvider?.type === "serverless") {
          providerConfig.resources = formData.serverless_config;
        }

        payload.providers = {
          compute: providerConfig,
          database: {
            provider:
              selectedProvider?.type === "serverless" ? "neon" : "vps_postgres",
            region:
              selectedProvider?.type === "serverless"
                ? "aws-us-east-1"
                : "auto",
          },
          storage: {
            provider:
              selectedProvider?.type === "serverless"
                ? "cloudflare_r2"
                : "vps_minio",
          },
        };
      }

      const res = await fetch(
        managed_hosting_url + "/api/v1/projects/provision",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.log(err);
        throw new Error(err.error || "Provisioning failed");
      }

      const result = await res.json();
      toast.success(
        isBranchMode
          ? "Branch creation initiated!"
          : "Project creation initiated!"
      );

      // Navigate to the appropriate dashboard
      const targetBranch = isBranchMode
        ? formData.branch_name
        : result.branch_name || "main";
      const targetProjectGroup = isBranchMode
        ? projectGroupId
        : result.project_id;
      router.push(`/projects/${targetProjectGroup}/${targetBranch}/dashboard`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Project/Branch Basics */}
      <div className="grid gap-4 md:grid-cols-2">
        {isBranchMode ? (
          <div className="space-y-2">
            <Label htmlFor="branch_name">Branch Name</Label>
            <Input
              id="branch_name"
              placeholder="feature-branch"
              value={formData.branch_name}
              onChange={(e) =>
                setFormData({ ...formData, branch_name: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              Parent project: {projectName}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="my-awesome-app"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="website_url">Website URL</Label>
          <Input
            id="website_url"
            placeholder="https://example.com"
            value={formData.website_url}
            onChange={(e) =>
              setFormData({ ...formData, website_url: e.target.value })
            }
            required
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="billing_email">Billing Email</Label>
          <Input
            id="billing_email"
            type="email"
            placeholder="billing@example.com"
            value={formData.billing_email}
            onChange={(e) =>
              setFormData({ ...formData, billing_email: e.target.value })
            }
            required
          />
        </div>
      </div>

      <Separator />

      {/* Deployment Mode Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Infrastructure</h3>

        <div className="grid w-full grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, deployment_mode: "shared" })
            }
            className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
              formData.deployment_mode === "shared"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            }`}
          >
            <Cloud className="h-4 w-4" />
            Shared Cloud
          </button>
          <button
            type="button"
            disabled={!options?.dedicated_deployments.can_provision}
            onClick={() =>
              setFormData({ ...formData, deployment_mode: "dedicated" })
            }
            className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
              formData.deployment_mode === "dedicated"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            } ${
              !options?.dedicated_deployments.can_provision
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <Server className="h-4 w-4" />
            Dedicated Infrastructure
          </button>
        </div>

        {/* SHARED CONFIG */}
        {formData.deployment_mode === "shared" && (
          <Card>
            <CardHeader>
              <CardTitle>Shared Hosting</CardTitle>
              <CardDescription>
                Cost-effective, managed resources perfect for getting started.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select
                  value={formData.shared_tier}
                  onValueChange={(v) =>
                    setFormData({ ...formData, shared_tier: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.shared_deployments.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {
                    options?.shared_deployments.find(
                      (t) => t.id === formData.shared_tier
                    )?.description
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label>Region</Label>
                <Select
                  value={formData.shared_region}
                  onValueChange={(v) =>
                    setFormData({ ...formData, shared_region: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.shared_deployments
                      .find((t) => t.id === formData.shared_tier)
                      ?.regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DEDICATED CONFIG */}
        {formData.deployment_mode === "dedicated" && (
          <Card>
            <CardHeader>
              <CardTitle>Dedicated Infrastructure</CardTitle>
              <CardDescription>
                Fully isolated resources with custom configuration options.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select
                    value={formData.dedicated_provider}
                    onValueChange={(v) =>
                      setFormData({ ...formData, dedicated_provider: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.dedicated_deployments.providers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select
                    value={formData.dedicated_region}
                    onValueChange={(v) =>
                      setFormData({ ...formData, dedicated_region: v })
                    }
                    disabled={!formData.dedicated_provider}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProvider?.regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* VPS Specific: Machine Type */}
              {selectedProvider?.type === "vps" && (
                <div className="space-y-2">
                  <Label>Machine Type</Label>
                  <Select
                    value={formData.dedicated_machine_type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, dedicated_machine_type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instance size" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProvider.machine_types?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Serverless Specific: Resource Sliders */}
              {selectedProvider?.type === "serverless" &&
                selectedProvider.resource_config && (
                  <div className="space-y-6 rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Cpu className="h-4 w-4" />
                      <h4 className="font-semibold">Service Configuration</h4>
                    </div>

                    {selectedProvider.resource_config.services.map(
                      (service) => (
                        <div
                          key={service}
                          className="space-y-4 border-b pb-4 last:border-0"
                        >
                          <h5 className="text-sm font-medium uppercase text-muted-foreground">
                            {service}
                          </h5>
                          <div className="grid gap-4 md:grid-cols-2">
                            {/* vCPU Selection */}
                            <div className="space-y-2">
                              <Label>vCPU</Label>
                              <Select
                                value={formData.serverless_config[
                                  service
                                ]?.vcpu?.toString()}
                                onValueChange={(val) => {
                                  const newConfig = {
                                    ...formData.serverless_config,
                                  };
                                  if (!newConfig[service])
                                    newConfig[service] = {
                                      vcpu: 0,
                                      memory_mb: 0,
                                      min_scale: 0,
                                      max_scale: 0,
                                    };
                                  newConfig[service].vcpu = parseFloat(val);
                                  setFormData({
                                    ...formData,
                                    serverless_config: newConfig,
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select vCPU" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedProvider.resource_config?.options.vcpu.map(
                                    (v) => (
                                      <SelectItem key={v} value={v.toString()}>
                                        {v} vCPU
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Memory Selection */}
                            <div className="space-y-2">
                              <Label>Memory (MB)</Label>
                              <Select
                                value={formData.serverless_config[
                                  service
                                ]?.memory_mb?.toString()}
                                onValueChange={(val) => {
                                  const newConfig = {
                                    ...formData.serverless_config,
                                  };
                                  if (!newConfig[service])
                                    newConfig[service] = {
                                      vcpu: 0,
                                      memory_mb: 0,
                                      min_scale: 0,
                                      max_scale: 0,
                                    };
                                  newConfig[service].memory_mb = parseInt(val);
                                  setFormData({
                                    ...formData,
                                    serverless_config: newConfig,
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Memory" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedProvider.resource_config?.options.memory_mb.map(
                                    (m) => (
                                      <SelectItem key={m} value={m.toString()}>
                                        {m} MB
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        )}
      </div>

      <Button type="submit" disabled={submitting} size="lg">
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isBranchMode ? "Create Branch" : "Create Project"}
      </Button>
    </form>
  );
}
