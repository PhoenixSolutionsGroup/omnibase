"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Server,
  Cloud,
  Zap,
  Check,
  ChevronsUpDown,
  Cpu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
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
import { cn } from "@/lib/utils";

// --- Types matching backend response (Go uses PascalCase JSON) ---

type PriceInfo = {
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
} | null;

type VPSDeployment = {
  ID: string;
  Provider: string;
  MachineType: string;
  Region: string;
  Name: string;
  Country: string;
  Continent: string;
  LocationName: string;
  VCPUs: number;
  MemoryGB: number;
  StorageGB: number;
  BaseCostPerHour: number;
  StripePriceID: string;
  price?: PriceInfo;
};

type ServerlessDeployment = {
  ID: string;
  Provider: string;
  Region: string;
  Name: string;
  Country: string;
  Continent: string;
  LocationName: string;
  BaseCostPerVCPUSecond: number;
  BaseCostPerGBSecond: number;
  BaseCostPerMillionRequests: number;
  StripePriceVCPUSecond: string;
  StripePriceGBSecond: string;
  StripePriceRequests: string;
  price_vcpu_second?: PriceInfo;
  price_gb_second?: PriceInfo;
  price_requests?: PriceInfo;
};

type SharedComputeDeployment = {
  ID: string;
  Name: string;
  CPULimit: number;
  MemoryLimitMB: number;
  Region: string;
  BaseCostPerHour: number;
  StripePriceID: string;
  price?: PriceInfo;
};

type SharedStorageDeployment = {
  ID: string;
  Name: string;
  StorageLimitGB: number;
  BaseCostPerHour: number;
  StripePriceID: string;
  price?: PriceInfo;
};

type SharedDatabaseDeployment = {
  ID: string;
  Name: string;
  StorageLimitGB: number;
  BaseCostPerHour: number;
  StripePriceID: string;
  price?: PriceInfo;
};

type SharedWorkersDeployment = {
  ID: string;
  Name: string;
  RequestLimitPerMonth: number;
  CPUMsLimitPerMonth: number;
  BaseCostPerHour: number;
  StripePriceID: string;
  OveragePricingID: string;
  price?: PriceInfo;
};

type DatabaseDeploymentConfig = {
  ID: string;
  Provider: string;
  Region: string;
  Name: string;
  Country: string;
  Continent: string;
  LocationName: string;
  BaseCostPerComputeHour: number;
  BaseCostPerGBHour: number;
  StripePriceComputeHour: string;
  StripePriceGBHour: string;
  price_compute_hour?: PriceInfo;
  price_gb_hour?: PriceInfo;
};

type StorageDeploymentConfig = {
  ID: string;
  Provider: string;
  Name: string;
  BaseCostPerGBMonth: number;
  BaseCostPerClassAOp: number;
  BaseCostPerClassBOp: number;
  StripePriceGBMonth: string;
  StripePriceClassAOp: string;
  StripePriceClassBOp: string;
  price_gb_month?: PriceInfo;
  price_class_a_op?: PriceInfo;
  price_class_b_op?: PriceInfo;
};

type CloudRunResourceLimits = {
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

type DeploymentOptions = {
  vps_deployments: VPSDeployment[];
  serverless_deployments: ServerlessDeployment[];
  shared_deployments: {
    compute: SharedComputeDeployment[];
    storage: SharedStorageDeployment[];
    database: SharedDatabaseDeployment[];
    workers: SharedWorkersDeployment[];
  };
  database_options: DatabaseDeploymentConfig[];
  storage_options: StorageDeploymentConfig[];
  cloud_run_resource_limits: CloudRunResourceLimits;
};

type DeploymentMode = "shared" | "dedicated" | "serverless";
type SharedTier = "basic" | "pro";

type FormData = {
  name: string;
  branch_name?: string;
  website_url: string;
  billing_email: string;
  deployment_mode: DeploymentMode;
  // Shared tier selection (basic or pro - applies to all services)
  shared_tier: SharedTier;
  // Shared region selection
  shared_region: string;
  // Dedicated (VPS) selection
  vps_deployment_id: string;
  // Serverless selection
  serverless_deployment_id: string;
  serverless_config: Record<
    string,
    {
      vcpu: number;
      memory_mb: number;
      min_scale: number;
      max_scale: number;
    }
  >;
  // Database selection (for dedicated/serverless)
  database_deployment_id: string;
  // Storage selection (for dedicated/serverless)
  storage_deployment_id: string;
};

interface ProvisioningFormProps {
  mode: "project" | "branch";
  projectGroupId?: string;
  projectName?: string;
}

// --- Helper: Format price ---
function formatPriceInfo(
  price: PriceInfo | undefined,
  fallback?: string
): string {
  if (!price) return fallback || "Free";
  if (price.amount === 0) return "Free";

  // Price amount is in cents, convert to dollars then to monthly
  const hourlyDollars = price.amount / 100;
  const monthly = hourlyDollars * 24 * 30;
  if (monthly < 1) return `$${monthly.toFixed(2)}/mo`;
  return `$${monthly.toFixed(0)}/mo`;
}

function formatUsagePrice(price: PriceInfo | undefined, unit: string): string {
  if (!price || price.amount === 0) return "Free";
  // Price amount is in cents, convert to dollars
  const dollars = price.amount / 100;
  // For very small values (like per-second pricing), show more precision
  if (dollars < 0.01) {
    // Show 6 decimal places for tiny values
    return `$${dollars.toFixed(6)}/${unit}`;
  }
  return `$${dollars.toFixed(2)}/${unit}`;
}

// --- Helper: Group by continent ---
function groupByContinent<T extends { continent: string }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const continent = item.continent || "Other";
    if (!groups.has(continent)) {
      groups.set(continent, []);
    }
    groups.get(continent)!.push(item);
  }
  return groups;
}

// --- Combobox Component ---
interface DeploymentComboboxProps<T> {
  items: T[];
  value: string;
  onSelect: (id: string) => void;
  placeholder: string;
  getItemId: (item: T) => string;
  getItemName: (item: T) => string;
  getItemPrice: (item: T) => string;
  getItemContinent?: (item: T) => string;
  disabled?: boolean;
}

function DeploymentCombobox<T>({
  items,
  value,
  onSelect,
  placeholder,
  getItemId,
  getItemName,
  getItemPrice,
  getItemContinent,
  disabled,
}: DeploymentComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = items.find((item) => getItemId(item) === value);
  const displayValue = selectedItem
    ? `${getItemName(selectedItem)}`
    : placeholder;

  // Group items if getItemContinent is provided
  const groupedItems = getItemContinent
    ? groupByContinent(
        items.map((item) => ({
          ...item,
          continent: getItemContinent(item),
        }))
      )
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[620px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            {groupedItems ? (
              // Grouped by continent
              Array.from(groupedItems.entries()).map(
                ([continent, groupItems]) => (
                  <CommandGroup key={continent} heading={continent}>
                    {groupItems.map((item) => (
                      <CommandItem
                        key={getItemId(item as T)}
                        value={`${getItemName(item as T)} ${continent}`}
                        onSelect={() => {
                          onSelect(getItemId(item as T));
                          setOpen(false);
                        }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "h-4 w-4",
                              value === getItemId(item as T)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span>{getItemName(item as T)}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {getItemPrice(item as T)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )
              )
            ) : (
              // Flat list
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={getItemId(item)}
                    value={getItemName(item)}
                    onSelect={() => {
                      onSelect(getItemId(item));
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === getItemId(item)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span>{getItemName(item)}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {getItemPrice(item)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
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
    shared_tier: "basic",
    shared_region: "nbg1",
    vps_deployment_id: "",
    serverless_deployment_id: "",
    serverless_config: {},
    database_deployment_id: "",
    storage_deployment_id: "",
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
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch options");
        const data: DeploymentOptions = await res.json();
        setOptions(data);
      } catch (error) {
        toast.error("Failed to load deployment options");
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, [managed_hosting_url]);

  // Initialize serverless config when deployment changes
  React.useEffect(() => {
    if (
      formData.deployment_mode === "serverless" &&
      formData.serverless_deployment_id &&
      options?.cloud_run_resource_limits
    ) {
      const { options: resourceOpts } = options.cloud_run_resource_limits;
      const defaultVcpu = resourceOpts.vcpu.includes(2)
        ? 2
        : resourceOpts.vcpu[Math.floor(resourceOpts.vcpu.length / 2)];
      const defaultMemory = resourceOpts.memory_mb.includes(4096)
        ? 4096
        : resourceOpts.memory_mb[Math.floor(resourceOpts.memory_mb.length / 2)];

      const defaults: Record<string, any> = {};
      options.cloud_run_resource_limits.services.forEach((service) => {
        defaults[service] = {
          vcpu: defaultVcpu,
          memory_mb: defaultMemory,
          min_scale: 0,
          max_scale: 1,
        };
      });
      setFormData((prev) => ({ ...prev, serverless_config: defaults }));
    }
  }, [formData.deployment_mode, formData.serverless_deployment_id, options]);

  // Set default database/storage when switching to dedicated/serverless
  React.useEffect(() => {
    if (
      formData.deployment_mode === "dedicated" &&
      formData.vps_deployment_id
    ) {
      // For VPS, default to vps_postgres and vps_minio
      const vpsDb = options?.database_options.find(
        (d) => d.Provider === "vps_postgres"
      );
      const vpsMinio = options?.storage_options.find(
        (s) => s.Provider === "vps_minio"
      );
      setFormData((prev) => ({
        ...prev,
        database_deployment_id: vpsDb?.ID || prev.database_deployment_id,
        storage_deployment_id: vpsMinio?.ID || prev.storage_deployment_id,
      }));
    } else if (
      formData.deployment_mode === "serverless" &&
      formData.serverless_deployment_id
    ) {
      // For serverless, default to first neon region and R2
      const neonDb = options?.database_options.find(
        (d) => d.Provider === "neon"
      );
      const r2 = options?.storage_options.find(
        (s) => s.Provider === "cloudflare_r2"
      );
      setFormData((prev) => ({
        ...prev,
        database_deployment_id: neonDb?.ID || prev.database_deployment_id,
        storage_deployment_id: r2?.ID || prev.storage_deployment_id,
      }));
    }
  }, [
    formData.deployment_mode,
    formData.vps_deployment_id,
    formData.serverless_deployment_id,
    options,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        website_url: formData.website_url,
        billing_email: formData.billing_email,
      };

      if (isBranchMode) {
        payload.branch_name = formData.branch_name;
        payload.project_group_id = projectGroupId;
      }

      if (formData.deployment_mode === "shared") {
        // Shared mode - send full deployment IDs with region
        payload.providers = {
          compute: `shared_compute_${formData.shared_tier}_${formData.shared_region}`,
          storage: `shared_storage_${formData.shared_tier}`,
          database: `shared_database_${formData.shared_tier}`,
        };
      } else if (formData.deployment_mode === "dedicated") {
        // VPS mode - deployment IDs as strings
        payload.providers = {
          compute: formData.vps_deployment_id,
          database: formData.database_deployment_id,
          storage: formData.storage_deployment_id,
        };
      } else {
        // Serverless mode - deployment IDs + resources at top level
        payload.providers = {
          compute: formData.serverless_deployment_id,
          database: formData.database_deployment_id,
          storage: formData.storage_deployment_id,
          resources: formData.serverless_config,
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
        throw new Error(err.error || "Provisioning failed");
      }

      const result = await res.json();
      toast.success(
        isBranchMode
          ? "Branch creation initiated!"
          : "Project creation initiated!"
      );

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

  // Filter database options based on mode
  const availableDatabaseOptions =
    formData.deployment_mode === "dedicated"
      ? options?.database_options || []
      : options?.database_options.filter(
          (d) => d.Provider !== "vps_postgres"
        ) || [];

  // Filter storage options based on mode
  const availableStorageOptions =
    formData.deployment_mode === "dedicated"
      ? options?.storage_options || []
      : options?.storage_options.filter((s) => s.Provider !== "vps_minio") ||
        [];

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

      {/* Deployment Mode Tabs */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Infrastructure</h3>

        <div className="grid w-full grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, deployment_mode: "shared" })
            }
            className={cn(
              "flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all",
              formData.deployment_mode === "shared"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            <Cloud className="h-4 w-4" />
            Shared
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, deployment_mode: "dedicated" })
            }
            className={cn(
              "flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all",
              formData.deployment_mode === "dedicated"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            <Server className="h-4 w-4" />
            Dedicated
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, deployment_mode: "serverless" })
            }
            className={cn(
              "flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all",
              formData.deployment_mode === "serverless"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            <Zap className="h-4 w-4" />
            Serverless
          </button>
        </div>

        {/* SHARED CONFIG */}
        {formData.deployment_mode === "shared" &&
          options &&
          (() => {
            // Get unique regions from compute deployments
            const regions = [
              ...new Set(
                options.shared_deployments.compute.map((c) => c.Region)
              ),
            ];

            // Region display names
            const regionNames: Record<string, string> = {
              nbg1: "Nuremberg, Germany",
              fsn1: "Falkenstein, Germany",
              hel1: "Helsinki, Finland",
            };

            // Find compute options for selected region
            const basicCompute = options.shared_deployments.compute.find(
              (c) => c.ID === `shared_compute_basic_${formData.shared_region}`
            );
            const proCompute = options.shared_deployments.compute.find(
              (c) => c.ID === `shared_compute_pro_${formData.shared_region}`
            );
            const basicStorage = options.shared_deployments.storage.find(
              (s) => s.ID === "shared_storage_basic"
            );
            const proStorage = options.shared_deployments.storage.find(
              (s) => s.ID === "shared_storage_pro"
            );
            const basicDatabase = options.shared_deployments.database.find(
              (d) => d.ID === "shared_database_basic"
            );
            const proDatabase = options.shared_deployments.database.find(
              (d) => d.ID === "shared_database_pro"
            );

            return (
              <div className="space-y-4">
                {/* Region Selector */}
                <div className="space-y-2">
                  <Label>Region</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {regions.map((region) => (
                      <button
                        key={region}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, shared_region: region })
                        }
                        className={cn(
                          "rounded-md border px-3 py-2 text-sm transition-all",
                          formData.shared_region === region
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {regionNames[region] || region}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Basic Tier */}
                  <Card
                    className={cn(
                      "cursor-pointer transition-all",
                      formData.shared_tier === "basic"
                        ? "border-primary ring-2 ring-primary"
                        : "hover:border-primary/50"
                    )}
                    onClick={() =>
                      setFormData({ ...formData, shared_tier: "basic" })
                    }
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Basic</CardTitle>
                        <span className="text-lg font-semibold text-primary">
                          {formatPriceInfo(basicCompute?.price)}
                        </span>
                      </div>
                      <CardDescription>
                        Perfect for getting started and small projects
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compute</span>
                        <span>
                          {basicCompute?.CPULimit} CPU,{" "}
                          {basicCompute?.MemoryLimitMB}MB RAM
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage</span>
                        <span>{basicStorage?.StorageLimitGB}GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Database</span>
                        <span>{basicDatabase?.StorageLimitGB}GB</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pro Tier */}
                  <Card
                    className={cn(
                      "cursor-pointer transition-all",
                      formData.shared_tier === "pro"
                        ? "border-primary ring-2 ring-primary"
                        : "hover:border-primary/50"
                    )}
                    onClick={() =>
                      setFormData({ ...formData, shared_tier: "pro" })
                    }
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Pro</CardTitle>
                        <span className="text-lg font-semibold text-primary">
                          {formatPriceInfo(proCompute?.price)}
                        </span>
                      </div>
                      <CardDescription>
                        More resources for growing applications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compute</span>
                        <span>
                          {proCompute?.CPULimit} CPU,{" "}
                          {proCompute?.MemoryLimitMB}
                          MB RAM
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage</span>
                        <span>{proStorage?.StorageLimitGB}GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Database</span>
                        <span>{proDatabase?.StorageLimitGB}GB</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })()}

        {/* DEDICATED (VPS) CONFIG */}
        {formData.deployment_mode === "dedicated" && options && (
          <Card>
            <CardHeader>
              <CardTitle>Dedicated VPS</CardTitle>
              <CardDescription>
                Fully isolated virtual private server with dedicated resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="space-y-2">
                <Label>Server</Label>
                <DeploymentCombobox
                  items={options.vps_deployments}
                  value={formData.vps_deployment_id}
                  onSelect={(id) =>
                    setFormData({ ...formData, vps_deployment_id: id })
                  }
                  placeholder="Select server"
                  getItemId={(item) => item.ID}
                  getItemName={(item) =>
                    `${item.Name} (${item.VCPUs} vCPU, ${item.MemoryGB}GB RAM)`
                  }
                  getItemPrice={(item) => formatPriceInfo(item.price)}
                  getItemContinent={(item) => item.Continent}
                />
              </div>

              {formData.vps_deployment_id && (
                <>
                  <div className="space-y-2">
                    <Label>Database</Label>
                    <DeploymentCombobox
                      items={availableDatabaseOptions}
                      value={formData.database_deployment_id}
                      onSelect={(id) =>
                        setFormData({ ...formData, database_deployment_id: id })
                      }
                      placeholder="Select database"
                      getItemId={(item) => item.ID}
                      getItemName={(item) => item.Name}
                      getItemPrice={(item) =>
                        formatUsagePrice(item.price_compute_hour, "compute-hr")
                      }
                      getItemContinent={(item) => item.Continent || "Shared"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Storage</Label>
                    <DeploymentCombobox
                      items={availableStorageOptions}
                      value={formData.storage_deployment_id}
                      onSelect={(id) =>
                        setFormData({ ...formData, storage_deployment_id: id })
                      }
                      placeholder="Select storage"
                      getItemId={(item) => item.ID}
                      getItemName={(item) => item.Name}
                      getItemPrice={(item) =>
                        formatUsagePrice(item.price_gb_month, "GB/mo")
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* SERVERLESS CONFIG */}
        {formData.deployment_mode === "serverless" && options && (
          <Card>
            <CardHeader>
              <CardTitle>Serverless</CardTitle>
              <CardDescription>
                Pay-as-you-go infrastructure that scales automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="space-y-2">
                <Label>Region</Label>
                <DeploymentCombobox
                  items={options.serverless_deployments}
                  value={formData.serverless_deployment_id}
                  onSelect={(id) =>
                    setFormData({ ...formData, serverless_deployment_id: id })
                  }
                  placeholder="Select region"
                  getItemId={(item) => item.ID}
                  getItemName={(item) => item.Name}
                  getItemPrice={(item) => {
                    const vcpu = formatUsagePrice(
                      item.price_vcpu_second,
                      "vCPU-s"
                    );
                    const ram = formatUsagePrice(item.price_gb_second, "GB-s");
                    const req = formatUsagePrice(item.price_requests, "M req");
                    return `${vcpu} · ${ram} · ${req}`;
                  }}
                  getItemContinent={(item) => item.Continent}
                />
              </div>

              {formData.serverless_deployment_id && (
                <>
                  <div className="space-y-2">
                    <Label>Database</Label>
                    <DeploymentCombobox
                      items={availableDatabaseOptions}
                      value={formData.database_deployment_id}
                      onSelect={(id) =>
                        setFormData({ ...formData, database_deployment_id: id })
                      }
                      placeholder="Select database"
                      getItemId={(item) => item.ID}
                      getItemName={(item) => item.Name}
                      getItemPrice={(item) =>
                        formatUsagePrice(item.price_compute_hour, "compute-hr")
                      }
                      getItemContinent={(item) => item.Continent}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Storage</Label>
                    <DeploymentCombobox
                      items={availableStorageOptions}
                      value={formData.storage_deployment_id}
                      onSelect={(id) =>
                        setFormData({ ...formData, storage_deployment_id: id })
                      }
                      placeholder="Select storage"
                      getItemId={(item) => item.ID}
                      getItemName={(item) => item.Name}
                      getItemPrice={(item) =>
                        formatUsagePrice(item.price_gb_month, "GB/mo")
                      }
                    />
                  </div>

                  {/* Resource Configuration */}
                  {options.cloud_run_resource_limits && (
                    <div className="space-y-6 rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          <h4 className="font-semibold">Service Resources</h4>
                        </div>
                        <Select
                          onValueChange={(preset) => {
                            const vcpuOptions =
                              options.cloud_run_resource_limits.options.vcpu;
                            const memoryOptions =
                              options.cloud_run_resource_limits.options.memory_mb;

                            const presets: Record<
                              string,
                              { vcpu: number; memory_mb: number }
                            > = {
                              starter: {
                                vcpu: vcpuOptions[0],
                                memory_mb: memoryOptions[0],
                              },
                              standard: {
                                vcpu: vcpuOptions.includes(2)
                                  ? 2
                                  : vcpuOptions[
                                      Math.floor(vcpuOptions.length / 2)
                                    ],
                                memory_mb: memoryOptions.includes(2048)
                                  ? 2048
                                  : memoryOptions[
                                      Math.floor(memoryOptions.length / 2)
                                    ],
                              },
                              performance: {
                                vcpu: vcpuOptions.includes(4)
                                  ? 4
                                  : vcpuOptions[vcpuOptions.length - 1],
                                memory_mb: memoryOptions.includes(8192)
                                  ? 8192
                                  : memoryOptions[memoryOptions.length - 1],
                              },
                            };

                            const config = presets[preset];
                            if (!config) return;

                            const newServerlessConfig: typeof formData.serverless_config =
                              {};
                            options.cloud_run_resource_limits.services.forEach(
                              (service) => {
                                newServerlessConfig[service] = {
                                  vcpu: config.vcpu,
                                  memory_mb: config.memory_mb,
                                  min_scale:
                                    formData.serverless_config[service]
                                      ?.min_scale ?? 0,
                                  max_scale:
                                    formData.serverless_config[service]
                                      ?.max_scale ?? 1,
                                };
                              }
                            );
                            setFormData({
                              ...formData,
                              serverless_config: newServerlessConfig,
                            });
                          }}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Apply preset" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="performance">
                              Performance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {options.cloud_run_resource_limits.services.map(
                        (service) => {
                          const vcpuOptions =
                            options.cloud_run_resource_limits.options.vcpu;
                          const memoryOptions =
                            options.cloud_run_resource_limits.options.memory_mb;
                          const currentVcpu =
                            formData.serverless_config[service]?.vcpu ??
                            vcpuOptions[0];
                          const currentMemory =
                            formData.serverless_config[service]?.memory_mb ??
                            memoryOptions[0];
                          const vcpuIndex = vcpuOptions.indexOf(currentVcpu);
                          const memoryIndex =
                            memoryOptions.indexOf(currentMemory);

                          const formatMemory = (mb: number) => {
                            if (mb >= 1024) return `${mb / 1024} GB`;
                            return `${mb} MB`;
                          };

                          return (
                            <div
                              key={service}
                              className="space-y-4 border-b pb-4 last:border-0"
                            >
                              <h5 className="text-sm font-medium uppercase text-muted-foreground">
                                {service}
                              </h5>
                              <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label>vCPU</Label>
                                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                                      {currentVcpu} vCPU
                                    </span>
                                  </div>
                                  <Slider
                                    value={[vcpuIndex >= 0 ? vcpuIndex : 0]}
                                    min={0}
                                    max={vcpuOptions.length - 1}
                                    step={1}
                                    onValueChange={(vals) => {
                                      const newConfig = {
                                        ...formData.serverless_config,
                                      };
                                      if (!newConfig[service])
                                        newConfig[service] = {
                                          vcpu: 0,
                                          memory_mb: 0,
                                          min_scale: 0,
                                          max_scale: 1,
                                        };
                                      newConfig[service].vcpu =
                                        vcpuOptions[vals[0]];
                                      setFormData({
                                        ...formData,
                                        serverless_config: newConfig,
                                      });
                                    }}
                                  />
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label>Memory</Label>
                                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                                      {formatMemory(currentMemory)}
                                    </span>
                                  </div>
                                  <Slider
                                    value={[memoryIndex >= 0 ? memoryIndex : 0]}
                                    min={0}
                                    max={memoryOptions.length - 1}
                                    step={1}
                                    onValueChange={(vals) => {
                                      const newConfig = {
                                        ...formData.serverless_config,
                                      };
                                      if (!newConfig[service])
                                        newConfig[service] = {
                                          vcpu: 0,
                                          memory_mb: 0,
                                          min_scale: 0,
                                          max_scale: 1,
                                        };
                                      newConfig[service].memory_mb =
                                        memoryOptions[vals[0]];
                                      setFormData({
                                        ...formData,
                                        serverless_config: newConfig,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </>
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
