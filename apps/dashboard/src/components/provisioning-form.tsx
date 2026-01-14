"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Server, Zap, Check, ChevronsUpDown, Cpu, ChevronDown } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useRegionLatency,
  getTopRegionsByLatency,
  formatLatency,
  getLatencyColorClass,
} from "@/lib/region-latency";

// --- Types matching backend response (unified structure) ---

// PriceInfo contains resolved price information from Stripe
type PriceInfo = {
  amount: number;
  currency: string;
  interval: string; // Billing interval (e.g., "month", "year")
  interval_count: number;
};

// PriceConfig bundles a Stripe price ID with its resolved price info and unit
type PriceConfig = {
  id: string; // Stripe price ID
  enabled: boolean; // true if price is configured
  unit: string; // Pricing unit: "hour", "vcpu_second", "gb_second", "request", etc.
  price?: PriceInfo; // Resolved price from Stripe API
};

// ComputePrices contains all price configurations for a compute deployment
type ComputePrices = {
  hourly?: PriceConfig; // VPS hourly price
  vcpu_second?: PriceConfig; // Serverless vCPU-second price
  gb_second?: PriceConfig; // Serverless memory GB-second price
  requests?: PriceConfig; // Serverless request price
};

// DatabasePrices contains all price configurations for a database deployment
type DatabasePrices = {
  compute_hour?: PriceConfig;
  gb_hour?: PriceConfig;
};

// StoragePrices contains all price configurations for a storage deployment
type StoragePrices = {
  gb_month?: PriceConfig;
  class_a_op?: PriceConfig;
  class_b_op?: PriceConfig;
};

// RegionInfo contains metadata about a cloud region
type RegionInfo = {
  id: string;
  name: string;
  country: string;
  continent: string;
};

// Unified compute deployment - covers VPS (shared + dedicated) and serverless
type ComputeDeployment = {
  id: string;
  provider: string;
  machine_type: string;
  regions: RegionInfo[]; // Available regions with metadata
  name: string;

  // Server specs (zero for serverless)
  vcpus: number;
  memory_gb: number;
  storage_gb: number;

  // Multi-tenancy: 0=serverless, 1=dedicated, >1=shared
  max_tenants: number;
  cpu_limit: number; // Per-tenant container CPU limit (shared VPS)
  memory_limit_mb: number; // Per-tenant container memory limit (shared VPS)

  // Service limits included with this compute tier
  database_storage_limit_gb: number;
  object_storage_limit_gb: number;
  worker_requests_included: number;

  // Valid provider constraints - if set, only these IDs are allowed
  valid_database_ids?: string[];
  valid_storage_ids?: string[];

  // Bundled prices
  prices: ComputePrices;
};

// Helper functions for deployment type checks
const isServerless = (d: ComputeDeployment) => d.max_tenants === 0;
const isVPS = (d: ComputeDeployment) => d.max_tenants > 0;
const isShared = (d: ComputeDeployment) => d.max_tenants > 1;

type DatabaseDeploymentConfig = {
  id: string;
  provider: string;
  regions: RegionInfo[];
  name: string;
  prices: DatabasePrices;
};

type StorageDeploymentConfig = {
  id: string;
  provider: string;
  name: string;
  prices: StoragePrices;
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
  deployments: ComputeDeployment[];
  database_options: DatabaseDeploymentConfig[];
  storage_options: StorageDeploymentConfig[];
  cloud_run_resource_limits: CloudRunResourceLimits;
};

type DeploymentMode = "vps" | "serverless";

type FormData = {
  name: string;
  branch_name?: string;
  website_url: string;
  billing_email: string;
  deployment_mode: DeploymentMode;
  // Compute selection (two-step: first type, then region)
  compute_deployment_id: string;
  compute_region: string;
  // Serverless resource config
  serverless_config: Record<
    string,
    {
      vcpu: number;
      memory_mb: number;
      min_scale: number;
      max_scale: number;
    }
  >;
  // Database selection
  database_deployment_id: string;
  // Storage selection
  storage_deployment_id: string;
};

interface ProvisioningFormProps {
  mode: "project" | "branch";
  projectGroupId?: string;
  projectName?: string;
}

// --- Helper: Format price from PriceConfig ---

// Unit display names for formatting
const UNIT_DISPLAY: Record<string, string> = {
  hour: "hr",
  vcpu_second: "vCPU-s",
  gb_second: "GB-s",
  request: "req",
  compute_hour: "compute-hr",
  gb_hour: "GB-hr",
  gb_month: "GB/mo",
  class_a_op: "write op",
  class_b_op: "read op",
  email: "email",
  cpu_ms: "CPU-ms",
};

// Format a PriceConfig for display (e.g., "$7.30/hr" or "$0.000024/vCPU-s")
// Note: Stripe amounts are in cents, so we divide by 100 to get dollars
function formatPriceConfig(
  config: PriceConfig | undefined,
  fallback?: string
): string {
  if (!config?.enabled || !config.price) return fallback || "Free";
  if (config.price.amount === 0) return "Free";

  // Convert from cents to dollars
  const amount = config.price.amount / 100;
  const unitDisplay = UNIT_DISPLAY[config.unit] || config.unit;

  // For very small values (like per-second pricing), show more precision
  if (amount < 0.0001) {
    return `$${amount.toFixed(8)}/${unitDisplay}`;
  }
  if (amount < 0.01) {
    return `$${amount.toFixed(6)}/${unitDisplay}`;
  }
  if (amount < 1) {
    return `$${amount.toFixed(4)}/${unitDisplay}`;
  }
  return `$${amount.toFixed(2)}/${unitDisplay}`;
}

// Format hourly price as monthly estimate (for VPS pricing)
// Note: Stripe amounts are in cents, so we divide by 100 to get dollars
function formatHourlyAsMonthly(
  config: PriceConfig | undefined,
  fallback?: string
): string {
  if (!config?.enabled || !config.price) return fallback || "Free";
  if (config.price.amount === 0) return "Free";

  // Convert from cents to dollars, then multiply by 730 hours/month
  const hourlyDollars = config.price.amount / 100;
  const monthly = hourlyDollars * 730;

  return `$${monthly.toFixed(2)}/mo`;
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
  getItemGroup?: (item: T) => string;
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
  getItemGroup,
  disabled,
}: DeploymentComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = items.find((item) => getItemId(item) === value);
  const displayValue = selectedItem
    ? `${getItemName(selectedItem)}`
    : placeholder;

  // Group items if getItemGroup is provided
  const groupedItems = getItemGroup
    ? (() => {
        const groups = new Map<string, T[]>();
        for (const item of items) {
          const group = getItemGroup(item) || "Other";
          if (!groups.has(group)) {
            groups.set(group, []);
          }
          groups.get(group)!.push(item);
        }
        return groups;
      })()
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
              Array.from(groupedItems.entries()).map(([group, groupItems]) => (
                <CommandGroup key={group} heading={group}>
                  {groupItems.map((item) => (
                    <CommandItem
                      key={getItemId(item)}
                      value={`${getItemName(item)} ${group}`}
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
              ))
            ) : (
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

// --- Region Combobox Component ---
interface RegionComboboxProps {
  regions: RegionInfo[];
  value: string;
  onSelect: (id: string) => void;
  provider: string;
  disabled?: boolean;
  autoSelectLowestLatency?: boolean;
}

function RegionCombobox({
  regions,
  value,
  onSelect,
  provider,
  disabled,
  autoSelectLowestLatency = false,
}: RegionComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [hasAutoSelected, setHasAutoSelected] = React.useState(false);

  // Measure latency to all regions
  const regionIds = React.useMemo(() => regions.map((r) => r.id), [regions]);
  const latencies = useRegionLatency(regionIds, provider);

  // Reset auto-select when regions change (e.g., switching compute tiers)
  const regionKey = regionIds.join(",");
  React.useEffect(() => {
    setHasAutoSelected(false);
  }, [regionKey]);

  // Get top 3 regions by latency for recommended section
  const recommendedRegions = React.useMemo(
    () => getTopRegionsByLatency(regions, latencies, 3),
    [regions, latencies]
  );

  // Auto-select the lowest latency region as soon as we have any completed measurement
  React.useEffect(() => {
    if (!autoSelectLowestLatency || hasAutoSelected) return;
    if (regions.length === 0) return;

    // Use recommendedRegions which is sorted by actual latency value
    // This works for both live racing (first to complete has lowest latency)
    // and cached results (sorted by stored latency values)
    if (recommendedRegions.length === 0) return;

    const bestRegion = recommendedRegions[0];
    if (bestRegion && bestRegion.id !== value) {
      onSelect(bestRegion.id);
    }
    setHasAutoSelected(true);
  }, [
    autoSelectLowestLatency,
    hasAutoSelected,
    recommendedRegions,
    value,
    onSelect,
  ]);

  const selectedRegion = regions.find((r) => r.id === value);
  const selectedLatency = selectedRegion
    ? latencies.get(selectedRegion.id)
    : undefined;
  const displayValue = selectedRegion
    ? `${selectedRegion.name}, ${selectedRegion.country}`
    : "Select a region";
  const displayLatency = selectedLatency
    ? formatLatency(selectedLatency)
    : null;

  // Helper to get latency value (Infinity if not available)
  const getLatencyValue = React.useCallback(
    (regionId: string): number => {
      const result = latencies.get(regionId);
      if (result?.status === "done" && result.latency !== null) {
        return result.latency;
      }
      return Infinity;
    },
    [latencies]
  );

  // Group regions by continent, sorted by latency
  const groupedRegions = React.useMemo(() => {
    const groups = new Map<string, RegionInfo[]>();
    for (const region of regions) {
      const continent = region.continent || "Other";
      if (!groups.has(continent)) {
        groups.set(continent, []);
      }
      groups.get(continent)!.push(region);
    }

    // Sort regions within each group by latency (lowest first)
    for (const [, regionList] of groups) {
      regionList.sort((a, b) => getLatencyValue(a.id) - getLatencyValue(b.id));
    }

    // Sort continent groups by their lowest latency region
    const sortedEntries = Array.from(groups.entries()).sort(
      ([, regionsA], [, regionsB]) => {
        const minLatencyA = Math.min(
          ...regionsA.map((r) => getLatencyValue(r.id))
        );
        const minLatencyB = Math.min(
          ...regionsB.map((r) => getLatencyValue(r.id))
        );
        return minLatencyA - minLatencyB;
      }
    );

    return new Map(sortedEntries);
  }, [regions, getLatencyValue]);

  const renderRegionItem = (region: RegionInfo, keyPrefix: string = "") => {
    const latencyResult = latencies.get(region.id);
    const latencyDisplay = formatLatency(latencyResult);

    return (
      <CommandItem
        key={`${keyPrefix}${region.id}`}
        value={`${keyPrefix}${region.name} ${region.country} ${region.continent}`}
        onSelect={() => {
          onSelect(region.id);
          setOpen(false);
        }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Check
            className={cn(
              "h-4 w-4",
              value === region.id ? "opacity-100" : "opacity-0"
            )}
          />
          <span>{region.name}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{region.country}</span>
          <span
            className={cn(
              "min-w-[50px] text-right font-mono text-xs",
              latencyResult?.status === "measuring" && "animate-pulse",
              getLatencyColorClass(latencyResult)
            )}
          >
            {latencyDisplay}
          </span>
        </div>
      </CommandItem>
    );
  };

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
          <div className="flex items-center gap-2">
            {displayLatency && (
              <span className="text-xs text-muted-foreground font-mono">
                {displayLatency}
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[620px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search regions..." />
          <CommandList>
            <CommandEmpty>No regions found.</CommandEmpty>
            {recommendedRegions.length > 0 && (
              <CommandGroup heading="Recommended (Lowest Latency)">
                {recommendedRegions.map((region) =>
                  renderRegionItem(region, "recommended-")
                )}
              </CommandGroup>
            )}
            {Array.from(groupedRegions.entries()).map(
              ([continent, continentRegions]) => (
                <CommandGroup key={continent} heading={continent}>
                  {continentRegions.map((region) => renderRegionItem(region))}
                </CommandGroup>
              )
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
  const [showAdvancedResources, setShowAdvancedResources] = React.useState(false);
  const [globalResourceVcpu, setGlobalResourceVcpu] = React.useState<number | null>(null);
  const [globalResourceMemory, setGlobalResourceMemory] = React.useState<number | null>(null);

  const [formData, setFormData] = React.useState<FormData>({
    name: isBranchMode ? projectName || "" : "",
    branch_name: "",
    website_url: "",
    billing_email: "",
    deployment_mode: "vps",
    compute_deployment_id: "",
    compute_region: "",
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
        console.log(data);
        setOptions(data);

        // Set default compute deployment
        const firstVps = data.deployments.find(isVPS);
        if (firstVps) {
          setFormData((prev) => ({
            ...prev,
            compute_deployment_id: firstVps.id,
            compute_region: firstVps.regions[0]?.id || "",
          }));
        }
      } catch (error) {
        toast.error("Failed to load deployment options");
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, [managed_hosting_url]);

  // Get selected compute deployment (for VPS mode)
  const selectedCompute = React.useMemo(() => {
    if (!options || !formData.compute_deployment_id) return null;
    return options.deployments.find(
      (d) => d.id === formData.compute_deployment_id
    );
  }, [options, formData.compute_deployment_id]);

  // Merge serverless tiers by provider (e.g., combine tier1 and tier2 into one)
  type MergedServerlessDeployment = {
    id: string;
    provider: string;
    name: string;
    regions: RegionInfo[];
    regionTiers: Map<string, { tier: string; deployment: ComputeDeployment }>;
  };

  const mergedServerlessDeployments =
    React.useMemo((): MergedServerlessDeployment[] => {
      if (!options) return [];

      const serverlessOpts = options.deployments.filter(isServerless);
      const byProvider = new Map<string, MergedServerlessDeployment>();

      for (const deployment of serverlessOpts) {
        const existing = byProvider.get(deployment.provider);
        const tierMatch = deployment.name.match(/Tier\s*(\d+)/i);
        const tier = tierMatch ? `Tier ${tierMatch[1]}` : "Standard";

        if (existing) {
          existing.regions.push(...deployment.regions);
          for (const region of deployment.regions) {
            existing.regionTiers.set(region.id, { tier, deployment });
          }
        } else {
          const regionTiers = new Map<
            string,
            { tier: string; deployment: ComputeDeployment }
          >();
          for (const region of deployment.regions) {
            regionTiers.set(region.id, { tier, deployment });
          }
          const baseName = deployment.name
            .replace(/\s*-?\s*Tier\s*\d+/i, "")
            .trim();
          byProvider.set(deployment.provider, {
            id: deployment.provider,
            provider: deployment.provider,
            name: baseName || deployment.name,
            regions: [...deployment.regions],
            regionTiers,
          });
        }
      }

      return Array.from(byProvider.values());
    }, [options]);

  // Get the selected merged serverless deployment
  const selectedMergedServerless = React.useMemo(() => {
    return mergedServerlessDeployments.find(
      (d) => d.provider === formData.compute_deployment_id
    );
  }, [mergedServerlessDeployments, formData.compute_deployment_id]);

  // Get tier info for the currently selected region
  const selectedRegionTier = React.useMemo(() => {
    if (!selectedMergedServerless || !formData.compute_region) return null;
    return selectedMergedServerless.regionTiers.get(formData.compute_region);
  }, [selectedMergedServerless, formData.compute_region]);

  // Reset region when VPS compute type changes
  React.useEffect(() => {
    if (formData.deployment_mode !== "vps" || !selectedCompute) return;
    const regionIds = selectedCompute.regions.map((r) => r.id) || [];
    if (!regionIds.includes(formData.compute_region)) {
      setFormData((prev) => ({
        ...prev,
        compute_region: selectedCompute.regions[0]?.id || "",
      }));
    }
  }, [selectedCompute, formData.compute_region, formData.deployment_mode]);

  // Initialize serverless config when serverless provider changes
  React.useEffect(() => {
    if (
      formData.deployment_mode === "serverless" &&
      selectedMergedServerless &&
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
      setGlobalResourceVcpu(defaultVcpu);
      setGlobalResourceMemory(defaultMemory);
    }
  }, [selectedMergedServerless, options, formData.deployment_mode]);

  // Set default database/storage when compute is selected
  React.useEffect(() => {
    if (!options) return;

    if (formData.deployment_mode === "vps" && selectedCompute) {
      // For VPS, default to vps_postgres and vps_minio
      const vpsDb = options.database_options.find(
        (d) => d.provider === "vps_postgres"
      );
      const vpsMinio = options.storage_options.find(
        (s) => s.provider === "vps_minio"
      );
      setFormData((prev) => ({
        ...prev,
        database_deployment_id: vpsDb?.id || prev.database_deployment_id,
        storage_deployment_id: vpsMinio?.id || prev.storage_deployment_id,
      }));
    } else if (
      formData.deployment_mode === "serverless" &&
      selectedMergedServerless
    ) {
      // For serverless, default to first neon region and R2
      const neonDb = options.database_options.find(
        (d) => d.provider === "neon"
      );
      const r2 = options.storage_options.find(
        (s) => s.provider === "cloudflare_r2"
      );
      setFormData((prev) => ({
        ...prev,
        database_deployment_id: neonDb?.id || prev.database_deployment_id,
        storage_deployment_id: r2?.id || prev.storage_deployment_id,
      }));
    }
  }, [
    selectedCompute,
    selectedMergedServerless,
    options,
    formData.deployment_mode,
  ]);

  // Filter deployments by mode
  const vpsDeployments = React.useMemo(
    () => options?.deployments.filter(isVPS) || [],
    [options]
  );

  // Get all region IDs for current mode to measure latency at form level
  const vpsRegionIds = React.useMemo(() => {
    if (!selectedCompute || !isVPS(selectedCompute)) return [];
    return selectedCompute.regions.map((r) => r.id);
  }, [selectedCompute]);

  const serverlessRegionIds = React.useMemo(() => {
    if (!selectedMergedServerless) return [];
    return selectedMergedServerless.regions.map((r) => r.id);
  }, [selectedMergedServerless]);

  // Measure latencies at form level
  const vpsLatencies = useRegionLatency(
    vpsRegionIds,
    selectedCompute?.provider || "vultr"
  );
  const serverlessLatencies = useRegionLatency(
    serverlessRegionIds,
    selectedMergedServerless?.provider || "gcp_cloudrun"
  );

  // Check if latencies are still loading for each mode
  const isVpsLatenciesLoading = React.useMemo(() => {
    if (vpsRegionIds.length === 0) return false;
    const finishedCount = Array.from(vpsLatencies.values()).filter(
      (l) => l.status === "done" || l.status === "error"
    ).length;
    return finishedCount === 0;
  }, [vpsLatencies, vpsRegionIds.length]);

  const isServerlessLatenciesLoading = React.useMemo(() => {
    if (serverlessRegionIds.length === 0) return false;
    const finishedCount = Array.from(serverlessLatencies.values()).filter(
      (l) => l.status === "done" || l.status === "error"
    ).length;
    return finishedCount === 0;
  }, [serverlessLatencies, serverlessRegionIds.length]);

  // Filter database options based on compute selection
  const availableDatabaseOptions = React.useMemo(() => {
    if (!options) return [];

    // For serverless, use the actual tier deployment constraints
    if (formData.deployment_mode === "serverless" && selectedRegionTier) {
      const validIds = selectedRegionTier.deployment.valid_database_ids;
      if (validIds?.length) {
        return options.database_options.filter((d) => validIds.includes(d.id));
      }
      // Fallback: exclude VPS-hosted options
      return options.database_options.filter(
        (d) => d.provider !== "vps_postgres"
      );
    }

    // For VPS, use selectedCompute constraints
    if (selectedCompute?.valid_database_ids?.length) {
      return options.database_options.filter((d) =>
        selectedCompute.valid_database_ids!.includes(d.id)
      );
    }
    return options.database_options;
  }, [options, selectedCompute, selectedRegionTier, formData.deployment_mode]);

  // Filter storage options based on compute selection
  const availableStorageOptions = React.useMemo(() => {
    if (!options) return [];

    // For serverless, use the actual tier deployment constraints
    if (formData.deployment_mode === "serverless" && selectedRegionTier) {
      const validIds = selectedRegionTier.deployment.valid_storage_ids;
      if (validIds?.length) {
        return options.storage_options.filter((s) => validIds.includes(s.id));
      }
      // Fallback: exclude VPS-hosted options
      return options.storage_options.filter((s) => s.provider !== "vps_minio");
    }

    // For VPS, use selectedCompute constraints
    if (selectedCompute?.valid_storage_ids?.length) {
      return options.storage_options.filter((s) =>
        selectedCompute.valid_storage_ids!.includes(s.id)
      );
    }
    return options.storage_options;
  }, [options, selectedCompute, selectedRegionTier, formData.deployment_mode]);

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

      if (formData.deployment_mode === "serverless" && selectedRegionTier) {
        // Serverless mode - use actual tier deployment ID
        payload.providers = {
          compute: {
            id: selectedRegionTier.deployment.id,
            region: formData.compute_region,
          },
          database: formData.database_deployment_id,
          storage: formData.storage_deployment_id,
          resources: formData.serverless_config,
        };
      } else {
        // VPS mode (shared or dedicated)
        payload.providers = {
          compute: {
            id: formData.compute_deployment_id,
            region: formData.compute_region,
          },
          database: formData.database_deployment_id,
          storage: formData.storage_deployment_id,
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

        <div className="grid w-full grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => {
              const firstVps = options?.deployments.find(isVPS);
              setFormData({
                ...formData,
                deployment_mode: "vps",
                compute_deployment_id: firstVps?.id || "",
                compute_region: firstVps?.regions[0]?.id || "",
              });
            }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all",
              formData.deployment_mode === "vps"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            <Server className="h-4 w-4" />
            VPS
          </button>
          <button
            type="button"
            onClick={() => {
              const firstMerged = mergedServerlessDeployments[0];
              setFormData({
                ...formData,
                deployment_mode: "serverless",
                compute_deployment_id: firstMerged?.provider || "",
                compute_region: "",
              });
            }}
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

        {/* VPS CONFIG */}
        {formData.deployment_mode === "vps" && options && (
          <Card>
            <CardHeader>
              <CardTitle>VPS Compute</CardTitle>
              <CardDescription>
                Virtual private server with dedicated or shared resources.
              </CardDescription>
            </CardHeader>
            {isVpsLatenciesLoading ? (
              <CardContent className="grid gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-6 w-20 rounded" />
                  </div>
                  <Skeleton className="h-5 w-full rounded" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
                <Card className="border-muted">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32 rounded" />
                      <Skeleton className="h-5 w-20 rounded" />
                    </div>
                    <Skeleton className="h-4 w-64 rounded mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i}>
                          <Skeleton className="h-3 w-12 rounded mb-1" />
                          <Skeleton className="h-4 w-16 rounded" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Measuring region latencies...</span>
                </div>
              </CardContent>
            ) : (
              <CardContent className="grid gap-6">
                {/* Step 1: Select Compute Type with Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Compute Tier</Label>
                    {selectedCompute && isVPS(selectedCompute) && (
                      <span className="text-lg font-semibold text-primary">
                        {formatHourlyAsMonthly(selectedCompute.prices.hourly)}
                      </span>
                    )}
                  </div>

                  {vpsDeployments.length > 0 && (
                    <>
                      <div className="px-2">
                        <Slider
                          value={[
                            Math.max(
                              0,
                              vpsDeployments.findIndex(
                                (d) => d.id === formData.compute_deployment_id
                              )
                            ),
                          ]}
                          min={0}
                          max={vpsDeployments.length - 1}
                          step={1}
                          onValueChange={(vals) => {
                            const deployment = vpsDeployments[vals[0]];
                            if (deployment) {
                              setFormData({
                                ...formData,
                                compute_deployment_id: deployment.id,
                                compute_region: deployment.regions[0]?.id || "",
                              });
                            }
                          }}
                        />
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>{vpsDeployments[0]?.name}</span>
                          <span>
                            {vpsDeployments[vpsDeployments.length - 1]?.name}
                          </span>
                        </div>
                      </div>

                      {/* Selected Tier Spec Card */}
                      {selectedCompute && isVPS(selectedCompute) && (
                        <Card className="border-primary bg-primary/5">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                {selectedCompute.name}
                              </CardTitle>
                              <span className="text-lg font-semibold text-primary">
                                {formatHourlyAsMonthly(
                                  selectedCompute.prices.hourly
                                )}
                              </span>
                            </div>
                            <CardDescription>
                              {selectedCompute.max_tenants > 1
                                ? "Shared infrastructure - resources are allocated per container"
                                : "Dedicated infrastructure - full server resources"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {selectedCompute.max_tenants > 1 ? (
                                <>
                                  <div>
                                    <div className="text-muted-foreground">
                                      CPU
                                    </div>
                                    <div className="font-medium">
                                      {selectedCompute.cpu_limit} cores
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">
                                      Memory
                                    </div>
                                    <div className="font-medium">
                                      {selectedCompute.memory_limit_mb >= 1024
                                        ? `${selectedCompute.memory_limit_mb / 1024} GB`
                                        : `${selectedCompute.memory_limit_mb} MB`}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div>
                                    <div className="text-muted-foreground">
                                      vCPU
                                    </div>
                                    <div className="font-medium">
                                      {selectedCompute.vcpus} cores
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">
                                      Memory
                                    </div>
                                    <div className="font-medium">
                                      {selectedCompute.memory_gb} GB
                                    </div>
                                  </div>
                                </>
                              )}
                              {selectedCompute.database_storage_limit_gb >
                                0 && (
                                <div>
                                  <div className="text-muted-foreground">
                                    DB Included
                                  </div>
                                  <div className="font-medium">
                                    {selectedCompute.database_storage_limit_gb}{" "}
                                    GB
                                  </div>
                                </div>
                              )}
                              {selectedCompute.object_storage_limit_gb > 0 && (
                                <div>
                                  <div className="text-muted-foreground">
                                    Storage Included
                                  </div>
                                  <div className="font-medium">
                                    {selectedCompute.object_storage_limit_gb} GB
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>

                {/* Step 2: Select Region */}
                {selectedCompute && isVPS(selectedCompute) && (
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <RegionCombobox
                      regions={selectedCompute.regions}
                      value={formData.compute_region}
                      provider={selectedCompute.provider}
                      autoSelectLowestLatency
                      onSelect={(id) =>
                        setFormData({ ...formData, compute_region: id })
                      }
                    />
                  </div>
                )}

                {/* Database & Storage Selection */}
                {formData.compute_deployment_id && formData.compute_region && (
                  <>
                    <div className="space-y-2">
                      <Label>Database</Label>
                      <DeploymentCombobox
                        items={availableDatabaseOptions}
                        value={formData.database_deployment_id}
                        onSelect={(id) =>
                          setFormData({
                            ...formData,
                            database_deployment_id: id,
                          })
                        }
                        placeholder="Select database"
                        getItemId={(item) => item.id}
                        getItemName={(item) => item.name}
                        getItemPrice={(item) =>
                          formatPriceConfig(item.prices.compute_hour)
                        }
                        getItemGroup={(item) =>
                          item.provider === "vps_postgres"
                            ? "VPS-Hosted"
                            : "Managed"
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Storage</Label>
                      <DeploymentCombobox
                        items={availableStorageOptions}
                        value={formData.storage_deployment_id}
                        onSelect={(id) =>
                          setFormData({
                            ...formData,
                            storage_deployment_id: id,
                          })
                        }
                        placeholder="Select storage"
                        getItemId={(item) => item.id}
                        getItemName={(item) => item.name}
                        getItemPrice={(item) =>
                          formatPriceConfig(item.prices.gb_month)
                        }
                        getItemGroup={(item) =>
                          item.provider === "vps_minio"
                            ? "VPS-Hosted"
                            : "Managed"
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* SERVERLESS CONFIG */}
        {formData.deployment_mode === "serverless" &&
          options &&
          selectedMergedServerless && (
            <Card>
              <CardHeader>
                <CardTitle>Cloud Run</CardTitle>
                <CardDescription>
                  Pay-as-you-go serverless infrastructure that scales
                  automatically.
                </CardDescription>
              </CardHeader>
              {isServerlessLatenciesLoading ? (
                <CardContent className="grid gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                  <Card className="border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-40 rounded" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-48 rounded mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i}>
                            <Skeleton className="h-3 w-12 rounded mb-1" />
                            <Skeleton className="h-4 w-20 rounded" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Measuring region latencies...</span>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="grid gap-6">
                  {/* Select Region */}
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <RegionCombobox
                      regions={selectedMergedServerless.regions}
                      value={formData.compute_region}
                      provider={selectedMergedServerless.provider}
                      autoSelectLowestLatency
                      onSelect={(id) =>
                        setFormData({ ...formData, compute_region: id })
                      }
                    />
                  </div>

                  {/* Selected Region Summary Card */}
                  {formData.compute_region && selectedRegionTier && (
                    <Card className="border-primary bg-primary/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {
                              selectedMergedServerless.regions.find(
                                (r) => r.id === formData.compute_region
                              )?.name
                            }
                            ,{" "}
                            {
                              selectedMergedServerless.regions.find(
                                (r) => r.id === formData.compute_region
                              )?.country
                            }
                          </CardTitle>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              selectedRegionTier.tier === "Tier 1"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            )}
                          >
                            {selectedRegionTier.tier}
                          </span>
                        </div>
                        <CardDescription>
                          Pay only for what you use
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">vCPU</div>
                            <div className="font-medium">
                              {formatPriceConfig(
                                selectedRegionTier.deployment.prices.vcpu_second
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Memory</div>
                            <div className="font-medium">
                              {formatPriceConfig(
                                selectedRegionTier.deployment.prices.gb_second
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Requests
                            </div>
                            <div className="font-medium">
                              {formatPriceConfig(
                                selectedRegionTier.deployment.prices.requests
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {formData.compute_deployment_id &&
                    formData.compute_region && (
                      <>
                        <div className="space-y-2">
                          <Label>Database</Label>
                          <DeploymentCombobox
                            items={availableDatabaseOptions}
                            value={formData.database_deployment_id}
                            onSelect={(id) =>
                              setFormData({
                                ...formData,
                                database_deployment_id: id,
                              })
                            }
                            placeholder="Select database"
                            getItemId={(item) => item.id}
                            getItemName={(item) => item.name}
                            getItemPrice={(item) =>
                              formatPriceConfig(item.prices.compute_hour)
                            }
                            getItemGroup={(item) => item.provider}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Storage</Label>
                          <DeploymentCombobox
                            items={availableStorageOptions}
                            value={formData.storage_deployment_id}
                            onSelect={(id) =>
                              setFormData({
                                ...formData,
                                storage_deployment_id: id,
                              })
                            }
                            placeholder="Select storage"
                            getItemId={(item) => item.id}
                            getItemName={(item) => item.name}
                            getItemPrice={(item) =>
                              formatPriceConfig(item.prices.gb_month)
                            }
                            getItemGroup={(item) => item.provider}
                          />
                        </div>

                        {/* Resource Configuration */}
                        {options.cloud_run_resource_limits && (() => {
                          const vcpuOptions = options.cloud_run_resource_limits.options.vcpu;
                          const memoryOptions = options.cloud_run_resource_limits.options.memory_mb;
                          const services = options.cloud_run_resource_limits.services;

                          // Use global state for the sliders (independent of per-service values)
                          const globalVcpu = globalResourceVcpu ?? vcpuOptions[0];
                          const globalMemory = globalResourceMemory ?? memoryOptions[0];
                          const globalVcpuIndex = vcpuOptions.indexOf(globalVcpu);
                          const globalMemoryIndex = memoryOptions.indexOf(globalMemory);

                          const formatMemory = (mb: number) => {
                            if (mb >= 1024) return `${mb / 1024} GB`;
                            return `${mb} MB`;
                          };

                          // Update all services with global values
                          const updateAllServices = (vcpu: number, memory_mb: number) => {
                            const newConfig: typeof formData.serverless_config = {};
                            services.forEach((service) => {
                              newConfig[service] = {
                                vcpu,
                                memory_mb,
                                min_scale: formData.serverless_config[service]?.min_scale ?? 0,
                                max_scale: formData.serverless_config[service]?.max_scale ?? 1,
                              };
                            });
                            setFormData({ ...formData, serverless_config: newConfig });
                            setGlobalResourceVcpu(vcpu);
                            setGlobalResourceMemory(memory_mb);
                          };

                          return (
                            <div className="space-y-6 rounded-lg border p-4">
                              <div className="flex items-center gap-2">
                                <Cpu className="h-4 w-4" />
                                <h4 className="font-semibold">Service Resources</h4>
                              </div>

                              {/* Global vCPU and Memory Sliders */}
                              <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label>vCPU</Label>
                                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                                      {globalVcpu} vCPU
                                    </span>
                                  </div>
                                  <Slider
                                    value={[globalVcpuIndex >= 0 ? globalVcpuIndex : 0]}
                                    min={0}
                                    max={vcpuOptions.length - 1}
                                    step={1}
                                    onValueChange={(vals) => {
                                      updateAllServices(vcpuOptions[vals[0]], globalMemory);
                                    }}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{vcpuOptions[0]} vCPU</span>
                                    <span>{vcpuOptions[vcpuOptions.length - 1]} vCPU</span>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label>Memory</Label>
                                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                                      {formatMemory(globalMemory)}
                                    </span>
                                  </div>
                                  <Slider
                                    value={[globalMemoryIndex >= 0 ? globalMemoryIndex : 0]}
                                    min={0}
                                    max={memoryOptions.length - 1}
                                    step={1}
                                    onValueChange={(vals) => {
                                      updateAllServices(globalVcpu, memoryOptions[vals[0]]);
                                    }}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{formatMemory(memoryOptions[0])}</span>
                                    <span>{formatMemory(memoryOptions[memoryOptions.length - 1])}</span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                These values apply to all {services.length} services. Use advanced settings for per-service configuration.
                              </p>

                              {/* Advanced Per-Service Configuration */}
                              <div className="border-t pt-4">
                                <button
                                  type="button"
                                  onClick={() => setShowAdvancedResources(!showAdvancedResources)}
                                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <ChevronDown className={cn(
                                    "h-4 w-4 transition-transform",
                                    showAdvancedResources && "rotate-180"
                                  )} />
                                  Advanced: Per-service resources
                                </button>

                                {showAdvancedResources && (
                                  <div className="mt-4 space-y-6">
                                    {services.map((service) => {
                                      const currentVcpu = formData.serverless_config[service]?.vcpu ?? vcpuOptions[0];
                                      const currentMemory = formData.serverless_config[service]?.memory_mb ?? memoryOptions[0];
                                      const vcpuIndex = vcpuOptions.indexOf(currentVcpu);
                                      const memoryIndex = memoryOptions.indexOf(currentMemory);

                                      return (
                                        <div key={service} className="space-y-4 border-b pb-4 last:border-0">
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
                                                  const newConfig = { ...formData.serverless_config };
                                                  if (!newConfig[service]) {
                                                    newConfig[service] = { vcpu: 0, memory_mb: 0, min_scale: 0, max_scale: 1 };
                                                  }
                                                  newConfig[service].vcpu = vcpuOptions[vals[0]];
                                                  setFormData({ ...formData, serverless_config: newConfig });
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
                                                  const newConfig = { ...formData.serverless_config };
                                                  if (!newConfig[service]) {
                                                    newConfig[service] = { vcpu: 0, memory_mb: 0, min_scale: 0, max_scale: 1 };
                                                  }
                                                  newConfig[service].memory_mb = memoryOptions[vals[0]];
                                                  setFormData({ ...formData, serverless_config: newConfig });
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    )}
                </CardContent>
              )}
            </Card>
          )}
      </div>

      <Button
        type="submit"
        disabled={
          submitting ||
          !formData.compute_deployment_id ||
          !formData.compute_region
        }
        size="lg"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isBranchMode ? "Create Branch" : "Create Project"}
      </Button>
    </form>
  );
}
