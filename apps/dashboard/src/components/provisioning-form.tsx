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

type Tier = {
  id: string;
  name: string;
  vcpus: number;
  memory_gb: number;
  deployment_type: "shared" | "scale" | "dedicated";
  pool: "shared" | "dedicated";
  zeropod_enabled: boolean;
  zeropod_scaledown_sec: number;
  cnpg_instances: number;
  database_storage_limit_gb: number;
  object_storage_limit_gb: number;
  worker_requests_included: number;
  stripe_price_hourly_id: string;
};

type Region = {
  id: string;
  name: string;
  country: string;
  continent: string;
  active: boolean;
};

type OptionsResponse = {
  cluster_provider: string;
  tiers: Tier[];
  regions: Region[];
};

type FormData = {
  name: string;
  branch_name: string;
  billing_email: string;
  deployment_tier: string;
  region: string;
};

interface ProvisioningFormProps {
  mode: "project" | "branch";
  projectId?: string;
  projectName?: string;
}

const TIER_ORDER: Record<Tier["deployment_type"], number> = {
  shared: 0,
  scale: 1,
  dedicated: 2,
};

function sortTiers(tiers: Tier[]): Tier[] {
  return [...tiers].sort((a, b) => {
    const typeDiff = TIER_ORDER[a.deployment_type] - TIER_ORDER[b.deployment_type];
    if (typeDiff !== 0) return typeDiff;
    return a.vcpus - b.vcpus;
  });
}

interface RegionComboboxProps {
  regions: Region[];
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
    [regions, latencies],
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
    [latencies],
  );

  const groupedRegions = React.useMemo(() => {
    const groups = new Map<string, Region[]>();
    for (const region of regions) {
      const continent = region.continent || "Other";
      if (!groups.has(continent)) {
        groups.set(continent, []);
      }
      groups.get(continent)!.push(region);
    }

    for (const [, regionList] of groups) {
      regionList.sort(
        (a, b) => getLatencyValue(a.id) - getLatencyValue(b.id),
      );
    }

    const sortedEntries = Array.from(groups.entries()).sort(
      ([, regionsA], [, regionsB]) => {
        const minLatencyA = Math.min(
          ...regionsA.map((r) => getLatencyValue(r.id)),
        );
        const minLatencyB = Math.min(
          ...regionsB.map((r) => getLatencyValue(r.id)),
        );
        return minLatencyA - minLatencyB;
      },
    );

    return new Map(sortedEntries);
  }, [regions, getLatencyValue]);

  const renderRegionItem = (region: Region, keyPrefix: string = "") => {
    const latencyResult = latencies.get(region.id);
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
              value === region.id ? "opacity-100" : "opacity-0",
            )}
          />
          <span>{region.name}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{region.country}</span>
          <span
            className={cn(
              "min-w-20 text-right font-mono text-xs",
              latencyResult?.status === "measuring" && "animate-pulse",
              getLatencyColorClass(latencyResult),
            )}
          >
            {formatLatency(latencyResult)}
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
                  renderRegionItem(region, "recommended-"),
                )}
              </CommandGroup>
            )}
            {Array.from(groupedRegions.entries()).map(
              ([continent, continentRegions]) => (
                <CommandGroup key={continent} heading={continent}>
                  {continentRegions.map((region) => renderRegionItem(region))}
                </CommandGroup>
              ),
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ProvisioningForm({
  mode,
  projectId,
  projectName,
}: ProvisioningFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [options, setOptions] = React.useState<OptionsResponse | null>(null);

  const isBranchMode = mode === "branch";

  const [formData, setFormData] = React.useState<FormData>({
    name: isBranchMode ? projectName || "" : "",
    branch_name: "",
    billing_email: "",
    deployment_tier: "",
    region: "",
  });

  const managed_hosting_url = process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL;
  if (!managed_hosting_url) {
    throw new Error("Must set NEXT_PUBLIC_MANAGED_HOSTING_API_URL");
  }

  const sortedTiers = React.useMemo(
    () => (options ? sortTiers(options.tiers) : []),
    [options],
  );

  React.useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch(managed_hosting_url + "/api/v1/options", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch options");
        const data: OptionsResponse = await res.json();
        setOptions(data);

        const tiers = sortTiers(data.tiers);
        const firstTier = tiers[0];
        const firstRegion = data.regions[0];
        if (firstTier) {
          setFormData((prev) => ({
            ...prev,
            deployment_tier: firstTier.id,
            region: firstRegion?.id || "",
          }));
        }
      } catch {
        toast.error("Failed to load deployment options");
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, [managed_hosting_url]);

  const selectedTier = React.useMemo(() => {
    if (!options) return null;
    return options.tiers.find((t) => t.id === formData.deployment_tier) || null;
  }, [options, formData.deployment_tier]);

  const regionIds = React.useMemo(
    () => (options ? options.regions.map((r) => r.id) : []),
    [options],
  );
  const latencies = useRegionLatency(regionIds, "vultr");

  const isLatenciesLoading = React.useMemo(() => {
    if (regionIds.length === 0) return false;
    const finishedCount = Array.from(latencies.values()).filter(
      (l) => l.status === "done" || l.status === "error",
    ).length;
    return finishedCount === 0;
  }, [latencies, regionIds.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isBranchMode) {
        if (!projectId) throw new Error("Missing project id");
        const res = await fetch(
          managed_hosting_url + "/api/v1/project_branches",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project_id: projectId,
              branch_name: formData.branch_name,
              region: formData.region,
              deployment_tier: formData.deployment_tier,
              billing_email: formData.billing_email,
            }),
            credentials: "include",
          },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || "Branch creation failed");
        }
        toast.success("Branch creation initiated!");
        router.push(
          `/projects/${projectId}/${formData.branch_name}/dashboard`,
        );
      } else {
        const res = await fetch(managed_hosting_url + "/api/v1/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            region: formData.region,
            deployment_tier: formData.deployment_tier,
            billing_email: formData.billing_email,
          }),
          credentials: "include",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error || err.message || "Project creation failed",
          );
        }
        const result = await res.json();
        toast.success("Project creation initiated!");
        router.push(`/projects/${result.project_id}/main/dashboard`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
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

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <h3 className="text-lg font-medium">Infrastructure</h3>
        </div>

        {options && sortedTiers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Deployment Tier</CardTitle>
              <CardDescription>
                Pick the resources for your project. All tiers include
                PostgreSQL + object storage + edge workers.
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Tier</Label>
                  </div>

                  <div className="px-2">
                    <Slider
                      value={[
                        Math.max(
                          0,
                          sortedTiers.findIndex(
                            (t) => t.id === formData.deployment_tier,
                          ),
                        ),
                      ]}
                      min={0}
                      max={sortedTiers.length - 1}
                      step={1}
                      onValueChange={(vals) => {
                        const tier = sortedTiers[vals[0]];
                        if (tier) {
                          setFormData({
                            ...formData,
                            deployment_tier: tier.id,
                          });
                        }
                      }}
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>{sortedTiers[0]?.name}</span>
                      <span>{sortedTiers[sortedTiers.length - 1]?.name}</span>
                    </div>
                  </div>

                  {selectedTier && (
                    <Card className="border-primary bg-primary/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {selectedTier.name}
                          </CardTitle>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            {selectedTier.deployment_type}
                          </span>
                        </div>
                        <CardDescription>
                          {selectedTier.pool === "dedicated"
                            ? "Dedicated node pool — guaranteed resources"
                            : selectedTier.zeropod_enabled
                              ? `Auto-scales to zero after ${selectedTier.zeropod_scaledown_sec}s idle`
                              : "Shared pool — always-on"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">vCPU</div>
                            <div className="font-medium">
                              {selectedTier.vcpus} cores
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Memory</div>
                            <div className="font-medium">
                              {selectedTier.memory_gb >= 1
                                ? `${selectedTier.memory_gb} GB`
                                : `${selectedTier.memory_gb * 1024} MB`}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              DB Storage
                            </div>
                            <div className="font-medium">
                              {selectedTier.database_storage_limit_gb} GB
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Object Storage
                            </div>
                            <div className="font-medium">
                              {selectedTier.object_storage_limit_gb} GB
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Region</Label>
                  <RegionCombobox
                    regions={options.regions}
                    value={formData.region}
                    autoSelectLowestLatency
                    onSelect={(id) =>
                      setFormData({ ...formData, region: id })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      <Button
        type="submit"
        disabled={
          submitting || !formData.deployment_tier || !formData.region
        }
        size="lg"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isBranchMode ? "Create Branch" : "Create Project"}
      </Button>
    </form>
  );
}
