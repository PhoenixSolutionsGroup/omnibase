"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Server,
  Check,
  ChevronsUpDown,
  Globe,
  GeorgianLari,
  Settings2,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardAction,
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
import { Badge } from "./ui/badge";
import formatPrice from "@/lib/currency";
import { Checkbox } from "./ui/checkbox";
import { CheckboxCard } from "./ui/checkbox-card";

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
  regions: string[];
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

type Plan = {
  id: string;
  name: string;
  deployment_type: string;
  description: string;
  tier: string;
  price_cents: number;
  vcpus: number;
  memory_gb: number;
  database_storage_limit_gb: number;
  most_popular?: boolean;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    deployment_type: "Shared",
    description: "Perfect for small projects and prototypes.",
    tier: "Shared Free",
    price_cents: 199,
    vcpus: 1,
    memory_gb: 1,
    database_storage_limit_gb: 1,
    // 1 option - $3.99 billed annually, or $4.99 a month
  },

  {
    id: "basic",
    name: "Basic",
    deployment_type: "Scaled",
    description: "Perfect for medium projects.",
    most_popular: true,
    tier: "Scale 1 vCPU",
    price_cents: 499,
    vcpus: 1,
    memory_gb: 1,
    database_storage_limit_gb: 64,
    // scale (4 options - 1CPU 1GB $X dollars (idk yet), 2 CPU 2GB $Y dollars, 4CPU 4GB $Z)
  },

  {
    id: "pro",
    name: "Pro",
    deployment_type: "Dedicated",
    description: "Perfect for enterprise applications.",
    tier: "Dedicated 4 vCPU",
    price_cents: 2999,
    vcpus: 16,
    memory_gb: 32,
    database_storage_limit_gb: 156,
    // dedicated (we’d have a fuck tonne here)
    //       Like (btw it is CPU/RAM for the following):
    // * 1/2
    // * ⁠1/4
    // * ⁠2/4
    // * ⁠2/8
    // * ⁠4/8
    // * ⁠4/16
    // * ⁠8/16
    // * ⁠8/32
    // * ⁠192/1536 - absolute fuck tonne of money but we can offer it haha
  },
];

type PlanOptions = {
  id: string;
  title: string;
  description: string;
};

const planOptions: PlanOptions[] = [
  {
    id: "postgres",
    title: "Postgres",
    description: "Managed Postgres with connection pooling and backups.",
  },
  {
    id: "omnibase",
    title: "Omnibase",
    description:
      "Entire backend in one service. Email, storage, auth and payments  switch on the first time you use them.",
  },
  {
    id: "dataAPI",
    title: "Data API",
    description: "Instant REST API over your public schema.",
  },
  {
    id: "workers",
    title: "Workers",
    description: "Run function at the edge, close to your users.",
  },
];

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
    const typeDiff =
      TIER_ORDER[a.deployment_type] - TIER_ORDER[b.deployment_type];
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
      regionList.sort((a, b) => getLatencyValue(a.id) - getLatencyValue(b.id));
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
        const firstRegion =
          data.regions.find((r) => firstTier?.regions?.includes(r.id)) ??
          data.regions[0];
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

  const [selectedPlan, setSelectedPlan] = React.useState<Plan>(plans[1]);
  const selectedTier = React.useMemo(() => {
    if (!options) return null;
    return options.tiers.find((t) => t.id === formData.deployment_tier) || null;
  }, [options, formData.deployment_tier]);

  const availableRegions = React.useMemo(() => {
    if (!options) return [];
    if (!selectedTier?.regions?.length) return options.regions;
    return options.regions.filter((r) => selectedTier.regions.includes(r.id));
  }, [options, selectedTier]);

  const regionIds = React.useMemo(
    () => availableRegions.map((r) => r.id),
    [availableRegions],
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
        router.push(`/projects/${projectId}/${formData.branch_name}/dashboard`);
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
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectTier = (tier: Tier) => {
    const allowed = options
      ? options.regions.filter(
          (r) => !tier.regions?.length || tier.regions.includes(r.id),
        )
      : [];
    const region = allowed.some((r) => r.id === formData.region)
      ? formData.region
      : (allowed[0]?.id ?? "");
    setFormData({
      ...formData,
      deployment_tier: tier.id,
      region,
    });
  };

  // Like shared (1 option - $3.99 billed annually, or $4.99 a month), scale (4 options - 1CPU 1GB $X dollars (idk yet), 2 CPU 2GB $Y dollars, 4CPU 4GB $Z) then dedicated (we’d have a fuck tonne here)

  // const mappedPlans = plans.map((plan) => ({
  //   ...plan,
  //   tier: sortedTiers.find((tier) => tier.name === plan.tier),
  // }));

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

      {/* <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <h3 className="text-lg font-medium">Tier</h3>
        </div>

        {options && sortedTiers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative overflow-visible cursor-pointer hover:shadow-lg duration-300 border-2
                  ${tier.id === selectedTier?.id ? "border-primary" : "border-transparent"}`}
                onClick={() => {
                  selectTier(tier);
                }}
              >
                {tier.id === selectedTier?.id && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <span className="capitalize font-bold">
                    {tier.deployment_type}
                  </span>

                  <span className="text-sm">{tier.name}</span>
                  <span className="text-muted-foreground">
                    perfect to get started and for small prototypes.
                  </span>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">vCPU</div>
                    <div className="font-medium">{tier.vcpus} cores</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Memory</div>
                    <div className="font-medium">
                      {tier.memory_gb >= 1
                        ? `${tier.memory_gb} GB`
                        : `${tier.memory_gb * 1024} MB`}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">DB Storage</div>
                    <div className="font-medium">
                      {tier.database_storage_limit_gb} GB
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Object Storage</div>
                    <div className="font-medium">
                      {tier.object_storage_limit_gb} GB
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="mt-6"
                    variant={
                      tier.id === selectedTier?.id ? "default" : "outline"
                    }
                    onClick={() => {}}
                  >
                    Select {tier.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div> */}

      {/* <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <h3 className="text-lg font-medium">Tier</h3>
        </div>

        {options && sortedTiers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mappedPlans &&
              mappedPlans.map((plan) => (
                <Card
                  key={plan.tier.id}
                  className={`relative overflow-visible cursor-pointer hover:shadow-lg duration-300 border-2
                  ${plan.tier.id === selectedTier?.id ? "border-primary" : "border-transparent"}`}
                  onClick={() => {
                    selectTier(plan.tier);
                  }}
                >
                  {plan.most_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <span className="capitalize font-bold">
                      {plan.tier.deployment_type}
                    </span>

                    <span className="text-sm">{plan.name}</span>
                    <span className="text-muted-foreground">
                      {plan.description}
                    </span>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">vCPU</div>
                      <div className="font-medium">{plan.tier.vcpus} cores</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Memory</div>
                      <div className="font-medium">
                        {plan.tier.memory_gb >= 1
                          ? `${plan.tier.memory_gb} GB`
                          : `${plan.tier.memory_gb * 1024} MB`}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">DB Storage</div>
                      <div className="font-medium">
                        {plan.tier.database_storage_limit_gb} GB
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">
                        Object Storage
                      </div>
                      <div className="font-medium">
                        {plan.tier.object_storage_limit_gb} GB
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="mt-6"
                      variant={
                        plan.tier.id === selectedTier?.id
                          ? "default"
                          : "outline"
                      }
                      onClick={() => {}}
                    >
                      Select {plan.tier.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div> */}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <h3 className="text-lg font-medium">Tier</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-visible cursor-pointer hover:shadow-lg duration-300 border-2
                  ${plan.id === selectedPlan?.id ? "border-primary" : "border-transparent"}`}
              onClick={() => {
                setSelectedPlan(plan);
              }}
            >
              {plan.most_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between">
                  <span className="text-sm">{plan.name}</span>
                  <Badge variant="outline"> {plan.deployment_type}</Badge>
                </div>
                <span className="text-lg">
                  {formatPrice(plan.price_cents)} / month
                </span>
                <span className="text-muted-foreground">
                  {plan.description}
                </span>
                <Button
                  size="lg"
                  className="mt-2 cursor-pointer"
                  variant={plan.id === selectedPlan?.id ? "default" : "outline"}
                  onClick={() => {}}
                >
                  Select {plan.name}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm ">
                <span>Features</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">vCPU</div>
                  <div className="font-medium">{plan.vcpus} cores</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Memory</div>
                  <div className="font-medium">
                    {plan.memory_gb >= 1
                      ? `${plan.memory_gb} GB`
                      : `${plan.memory_gb * 1024} MB`}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">DB Storage</div>
                  <div className="font-medium">
                    {plan.database_storage_limit_gb} GB
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <h3 className="text-lg font-medium">Options</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {planOptions.map((option) => (
            <CheckboxCard key={option.id} {...option} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <h3 className="text-lg font-medium">Region</h3>
        </div>
        <RegionCombobox
          regions={availableRegions}
          value={formData.region}
          autoSelectLowestLatency
          onSelect={(id) => setFormData({ ...formData, region: id })}
        />
      </div>

      <Button
        type="submit"
        disabled={submitting || !formData.deployment_tier || !formData.region}
        size="lg"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isBranchMode ? "Create Branch" : "Create Project"}
      </Button>
    </form>
  );
}
