"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Server, Check, ChevronsUpDown } from "lucide-react";

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

// --- Types matching backend response ---

type PriceInfo = {
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
};

type PriceConfig = {
  id: string;
  enabled: boolean;
  unit: string;
  price?: PriceInfo;
};

type ComputePrices = {
  hourly?: PriceConfig;
};

type DatabasePrices = {
  compute_hour?: PriceConfig;
  gb_hour?: PriceConfig;
};

type StoragePrices = {
  gb_month?: PriceConfig;
  class_a_op?: PriceConfig;
  class_b_op?: PriceConfig;
};

type RegionInfo = {
  id: string;
  name: string;
  country: string;
  continent: string;
};

// VKS compute deployment
type ComputeDeployment = {
  id: string;
  name: string;
  regions: RegionInfo[];
  vcpus: number;
  memory_gb: number;
  database_storage_limit_gb: number;
  object_storage_limit_gb: number;
  worker_requests_included: number;
  valid_database_ids?: string[];
  valid_storage_ids?: string[];
  prices: ComputePrices;
};

type DatabaseDeployment = {
  id: string;
  provider: string;
  region: string;
  name: string;
  country: string;
  continent: string;
  location_name: string;
  prices: DatabasePrices;
};

type StorageDeployment = {
  id: string;
  provider: string;
  name: string;
  prices: StoragePrices;
};

type DeploymentOptions = {
  deployments: ComputeDeployment[];
  database_options: DatabaseDeployment[];
  storage_options: StorageDeployment[];
};

type FormData = {
  name: string;
  branch_name?: string;
  website_url: string;
  billing_email: string;
  compute_deployment_id: string;
  compute_region: string;
  database_deployment_id: string;
  storage_deployment_id: string;
};

interface ProvisioningFormProps {
  mode: "project" | "branch";
  projectGroupId?: string;
  projectName?: string;
}

// --- Helper: Format price from PriceConfig ---

const UNIT_DISPLAY: Record<string, string> = {
  hour: "hr",
  compute_hour: "compute-hr",
  gb_hour: "GB-hr",
  gb_month: "GB/mo",
  class_a_op: "write op",
  class_b_op: "read op",
};

function formatPriceConfig(
  config: PriceConfig | undefined,
  fallback?: string
): string {
  if (!config?.enabled || !config.price) return fallback || "Free";
  if (config.price.amount === 0) return "Free";

  const amount = config.price.amount / 100;
  const unitDisplay = UNIT_DISPLAY[config.unit] || config.unit;

  if (amount < 0.01) return `$${amount.toFixed(4)}/${unitDisplay}`;
  if (amount < 1) return `$${amount.toFixed(3)}/${unitDisplay}`;
  return `$${amount.toFixed(2)}/${unitDisplay}`;
}

function formatHourlyAsMonthly(
  config: PriceConfig | undefined,
  fallback?: string
): string {
  if (!config?.enabled || !config.price) return fallback || "Free";
  if (config.price.amount === 0) return "Free";

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
  disabled?: boolean;
  autoSelectLowestLatency?: boolean;
}

function RegionCombobox({
  regions,
  value,
  onSelect,
  disabled,
  autoSelectLowestLatency = false,
}: RegionComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [hasAutoSelected, setHasAutoSelected] = React.useState(false);

  const regionIds = React.useMemo(() => regions.map((r) => r.id), [regions]);
  const latencies = useRegionLatency(regionIds, "vultr");

  const regionKey = regionIds.join(",");
  React.useEffect(() => {
    setHasAutoSelected(false);
  }, [regionKey]);

  const recommendedRegions = React.useMemo(
    () => getTopRegionsByLatency(regions, latencies, 3),
    [regions, latencies]
  );

  React.useEffect(() => {
    if (!autoSelectLowestLatency || hasAutoSelected) return;
    if (regions.length === 0) return;
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
    regions.length,
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

  const groupedRegions = React.useMemo(() => {
    const groups = new Map<string, RegionInfo[]>();
    for (const region of regions) {
      const continent = region.continent || "Other";
      if (!groups.has(continent)) {
        groups.set(continent, []);
      }
      groups.get(continent)!.push(region);
    }

    for (const [, regionList] of groups) {
      regionList.sort((a, b) => getLatencyValue(a.id) - getLatencyValue(b.id));
    }

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

  const [formData, setFormData] = React.useState<FormData>({
    name: isBranchMode ? projectName || "" : "",
    branch_name: "",
    website_url: "",
    billing_email: "",
    compute_deployment_id: "",
    compute_region: "",
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

        // Set defaults
        const firstDeployment = data.deployments[0];
        if (firstDeployment) {
          const vpsDb = data.database_options.find(
            (d) => d.provider === "vps_postgres"
          );
          const vpsMinio = data.storage_options.find(
            (s) => s.provider === "vps_minio"
          );

          setFormData((prev) => ({
            ...prev,
            compute_deployment_id: firstDeployment.id,
            compute_region: firstDeployment.regions[0]?.id || "",
            database_deployment_id: vpsDb?.id || data.database_options[0]?.id || "",
            storage_deployment_id: vpsMinio?.id || data.storage_options[0]?.id || "",
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

  // Get selected compute deployment
  const selectedCompute = React.useMemo(() => {
    if (!options || !formData.compute_deployment_id) return null;
    return options.deployments.find(
      (d) => d.id === formData.compute_deployment_id
    );
  }, [options, formData.compute_deployment_id]);

  // Get region IDs for latency measurement
  const regionIds = React.useMemo(() => {
    if (!selectedCompute) return [];
    return selectedCompute.regions.map((r) => r.id);
  }, [selectedCompute]);

  const latencies = useRegionLatency(regionIds, "vultr");

  const isLatenciesLoading = React.useMemo(() => {
    if (regionIds.length === 0) return false;
    const finishedCount = Array.from(latencies.values()).filter(
      (l) => l.status === "done" || l.status === "error"
    ).length;
    return finishedCount === 0;
  }, [latencies, regionIds.length]);

  // Filter database options based on compute selection
  const availableDatabaseOptions = React.useMemo(() => {
    if (!options) return [];
    if (selectedCompute?.valid_database_ids?.length) {
      return options.database_options.filter((d) =>
        selectedCompute.valid_database_ids!.includes(d.id)
      );
    }
    return options.database_options;
  }, [options, selectedCompute]);

  // Filter storage options based on compute selection
  const availableStorageOptions = React.useMemo(() => {
    if (!options) return [];
    if (selectedCompute?.valid_storage_ids?.length) {
      return options.storage_options.filter((s) =>
        selectedCompute.valid_storage_ids!.includes(s.id)
      );
    }
    return options.storage_options;
  }, [options, selectedCompute]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        website_url: formData.website_url,
        billing_email: formData.billing_email,
        providers: {
          compute: {
            id: formData.compute_deployment_id,
            region: formData.compute_region,
          },
          database: formData.database_deployment_id,
          storage: formData.storage_deployment_id,
        },
      };

      if (isBranchMode) {
        payload.branch_name = formData.branch_name;
        payload.project_group_id = projectGroupId;
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

      {/* Infrastructure */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <h3 className="text-lg font-medium">Infrastructure</h3>
        </div>

        {options && (
          <Card>
            <CardHeader>
              <CardTitle>Compute Tier</CardTitle>
              <CardDescription>
                Select the resources for your project. All tiers include
                PostgreSQL database and MinIO object storage.
              </CardDescription>
            </CardHeader>
            {isLatenciesLoading ? (
              <CardContent className="grid gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-6 w-20 rounded" />
                  </div>
                  <Skeleton className="h-5 w-full rounded" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Measuring region latencies...</span>
                </div>
              </CardContent>
            ) : (
              <CardContent className="grid gap-6">
                {/* Compute Tier Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Tier</Label>
                    {selectedCompute && (
                      <span className="text-lg font-semibold text-primary">
                        {formatHourlyAsMonthly(selectedCompute.prices.hourly)}
                      </span>
                    )}
                  </div>

                  {options.deployments.length > 0 && (
                    <>
                      <div className="px-2">
                        <Slider
                          value={[
                            Math.max(
                              0,
                              options.deployments.findIndex(
                                (d) => d.id === formData.compute_deployment_id
                              )
                            ),
                          ]}
                          min={0}
                          max={options.deployments.length - 1}
                          step={1}
                          onValueChange={(vals) => {
                            const deployment = options.deployments[vals[0]];
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
                          <span>{options.deployments[0]?.name}</span>
                          <span>
                            {options.deployments[options.deployments.length - 1]?.name}
                          </span>
                        </div>
                      </div>

                      {/* Selected Tier Summary */}
                      {selectedCompute && (
                        <Card className="border-primary bg-primary/5">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                {selectedCompute.name}
                              </CardTitle>
                              <span className="text-lg font-semibold text-primary">
                                {formatHourlyAsMonthly(selectedCompute.prices.hourly)}
                              </span>
                            </div>
                            <CardDescription>
                              Kubernetes-hosted with auto-scaling
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">vCPU</div>
                                <div className="font-medium">
                                  {selectedCompute.vcpus} cores
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Memory</div>
                                <div className="font-medium">
                                  {selectedCompute.memory_gb >= 1
                                    ? `${selectedCompute.memory_gb} GB`
                                    : `${selectedCompute.memory_gb * 1024} MB`}
                                </div>
                              </div>
                              {selectedCompute.database_storage_limit_gb > 0 && (
                                <div>
                                  <div className="text-muted-foreground">
                                    DB Storage
                                  </div>
                                  <div className="font-medium">
                                    {selectedCompute.database_storage_limit_gb} GB
                                  </div>
                                </div>
                              )}
                              {selectedCompute.object_storage_limit_gb > 0 && (
                                <div>
                                  <div className="text-muted-foreground">
                                    Object Storage
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

                {/* Region Selection */}
                {selectedCompute && (
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <RegionCombobox
                      regions={selectedCompute.regions}
                      value={formData.compute_region}
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
                            ? "Included"
                            : "Managed (Additional Cost)"
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
                            ? "Included"
                            : "Managed (Additional Cost)"
                        }
                      />
                    </div>
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
