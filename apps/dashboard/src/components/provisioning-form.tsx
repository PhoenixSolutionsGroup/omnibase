"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Server,
  Check,
  ChevronsUpDown,
  Globe,
  Database,
  ShieldCheck,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useRegionLatency,
  getTopRegionsByLatency,
  formatLatency,
  getLatencyColorClass,
} from "@/lib/region-latency";
import formatPrice from "@/lib/currency";
import { RadioChoiceCard } from "./ui/radio-choice-card";
import { RadioGroup } from "./ui/radio-group";
import { ButtonGroup } from "./ui/button-group";
import { V1PaymentsApi } from "@omnibase/core-js";

type Feature = {
  feature_name: string;
  value: string;
};

type Price = {
  id: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
};

type Region = {
  id: string;
  name: string;
  country: string;
  continent: string;
  active: boolean;
};

// Mirrors the Go `Postgres` and `Availability` structs (identical shape).
type PlanOption = {
  name: string;
  description: string;
  included: boolean;
  prices: Price[];
};

// Mirrors the Go `Tier` struct returned by /api/v1/projects/plans.
type Plan = {
  id: string;
  name: string;
  display_name: string;
  description: string;
  features: Feature[];
  features_summary: string;
  postgres: PlanOption[];
  availability: PlanOption[];
  prices: Price[];
  provider: string;
  regions: Region[];
};

type PlansResponse = {
  tiers: Plan[];
};

type PaymentInterval = Price["interval"];

type FormData = {
  name: string;
  branch_name: string;
  billing_email: string;
  plan_id: string;
  region: string;
  postgres: string; // option name, "" = none selected
  availability: string; // option name, "" = none selected
};

const NO_AVAILABILITY = "none";

interface ProvisioningFormProps {
  mode: "project" | "branch";
  projectId?: string;
  projectName?: string;
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

function SummaryRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="grid grid-cols-4">
      <span
        className={cn(
          "text-sm font-medium col-span-2",
          muted && "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-medium text-end col-span-2",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function priceFor(
  option: PlanOption | undefined,
  interval: PaymentInterval,
): Price | undefined {
  return option?.prices.find((p) => p.interval === interval);
}

function OptionPriceLabel({
  option,
  interval,
}: {
  option: PlanOption;
  interval: PaymentInterval;
}) {
  if (option.included) {
    return <span className="text-sm">Included</span>;
  }
  const price = priceFor(option, interval);
  if (!price) return null;
  return (
    <span className="text-sm">
      +{formatPrice(price.amount)} / {price.interval}
    </span>
  );
}

interface OptionGroupProps {
  idPrefix: string;
  options: PlanOption[];
  value: string;
  onChange: (name: string) => void;
  interval: PaymentInterval;
  noneLabel?: string; // when set, adds a "no option" card
  noneDescription?: string;
}

function OptionGroup({
  idPrefix,
  options,
  value,
  onChange,
  interval,
  noneLabel,
  noneDescription,
}: OptionGroupProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="flex flex-col gap-2"
    >
      {noneLabel && (
        <RadioChoiceCard
          id={`${idPrefix}-${NO_AVAILABILITY}`}
          value={NO_AVAILABILITY}
          title={noneLabel}
          description={noneDescription}
        />
      )}
      {options.map((option) => (
        <RadioChoiceCard
          key={option.name}
          id={`${idPrefix}-${option.name}`}
          value={option.name}
          title={
            <div className="flex justify-between w-full">
              <span className="text-sm">{option.name}</span>
              <OptionPriceLabel option={option} interval={interval} />
            </div>
          }
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {option.description}
            </span>
          </div>
        </RadioChoiceCard>
      ))}
    </RadioGroup>
  );
}

function defaultPostgres(plan: Plan): string {
  return (
    plan.postgres.find((o) => o.included)?.name ?? plan.postgres[0]?.name ?? ""
  );
}

export function ProvisioningForm({
  mode,
  projectId,
  projectName,
}: ProvisioningFormProps) {
  const client = new V1PaymentsApi(); // TODO: add cookie

  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [paymentInterval, setPaymentInterval] =
    React.useState<PaymentInterval>("month");

  const isBranchMode = mode === "branch";

  const [formData, setFormData] = React.useState<FormData>({
    name: isBranchMode ? projectName || "" : "",
    branch_name: "",
    billing_email: "",
    plan_id: "",
    region: "",
    postgres: "",
    availability: "",
  });

  const managed_hosting_url = process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL;
  if (!managed_hosting_url) {
    throw new Error("Must set NEXT_PUBLIC_MANAGED_HOSTING_API_URL");
  }

  React.useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch(
          managed_hosting_url + "/api/v1/projects/plans",
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data: PlansResponse = await res.json();

        // Go serializes nil slices as null, so normalize them here.
        const tiers = (data.tiers ?? []).map((t) => ({
          ...t,
          features: t.features ?? [],
          postgres: t.postgres ?? [],
          availability: t.availability ?? [],
          regions: t.regions ?? [],
        }));
        setPlans(tiers);

        const firstPlan = tiers[0];
        if (firstPlan) {
          setFormData((prev) => ({
            ...prev,
            plan_id: firstPlan.id,
            region: firstPlan.regions[0]?.id ?? "",
            postgres: defaultPostgres(firstPlan),
            availability: "",
          }));
        }
      } catch (e) {
        toast.error(
          "Failed to load plans" + (e instanceof Error ? `: ${e.message}` : ""),
        );
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, [managed_hosting_url]);

  const selectedPlan = React.useMemo(
    () => plans.find((p) => p.id === formData.plan_id) ?? null,
    [plans, formData.plan_id],
  );

  const selectedPrice = React.useMemo(
    () =>
      selectedPlan?.prices.find((p) => p.interval === paymentInterval) ?? null,
    [selectedPlan, paymentInterval],
  );

  const availableRegions = React.useMemo(
    () => selectedPlan?.regions ?? [],
    [selectedPlan],
  );

  const postgresOptions = selectedPlan?.postgres ?? [];
  const availabilityOptions = selectedPlan?.availability ?? [];

  const selectedPostgres = postgresOptions.find(
    (o) => o.name === formData.postgres,
  );
  const selectedAvailability = availabilityOptions.find(
    (o) => o.name === formData.availability,
  );

  const selectedRegion = availableRegions.find((r) => r.id === formData.region);

  // Plan price + selected add-ons, for a given interval.
  const totalFor = React.useCallback(
    (interval: PaymentInterval): number | null => {
      const base = selectedPlan?.prices.find((p) => p.interval === interval);
      if (!base) return null;
      return (
        base.amount +
        (priceFor(selectedPostgres, interval)?.amount ?? 0) +
        (priceFor(selectedAvailability, interval)?.amount ?? 0)
      );
    },
    [selectedPlan, selectedPostgres, selectedAvailability],
  );

  const totalPrice = totalFor(paymentInterval);
  const monthlyTotal = totalFor("month");

  const selectPlan = (plan: Plan) => {
    setFormData((prev) => ({
      ...prev,
      plan_id: plan.id,
      region: plan.regions.some((r) => r.id === prev.region)
        ? prev.region
        : (plan.regions[0]?.id ?? ""),
      // Options belong to a tier, so reset them when the tier changes.
      postgres: defaultPostgres(plan),
      availability: "",
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);

    // TODO: client.createCheckout({createCheckoutRequest: {priceId: "shared_starter_monthly" }})

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
              deployment_tier: selectedPlan.id,
              billing_email: formData.billing_email,
              postgres: formData.postgres,
              availability: formData.availability,
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
            deployment_tier: selectedPlan.id,
            billing_email: formData.billing_email,
            postgres: formData.postgres,
            availability: formData.availability,
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

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <div className="col-span-2 space-y-8">
        <div className="space-y-2 ">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <h3 className="text-base font-medium">Details</h3>
          </div>

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
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <h3 className="text-base font-medium">Tier</h3>
          </div>

          <RadioGroup
            value={formData.plan_id}
            onValueChange={(planId) => {
              const plan = plans.find((p) => p.id === planId);
              if (plan) selectPlan(plan);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {plans.map((plan) => {
              const price = plan.prices.find(
                (p) => p.interval === paymentInterval,
              );
              return (
                <RadioChoiceCard
                  key={plan.id}
                  id={`plan-${plan.id}`}
                  value={plan.id}
                  title={
                    <div className="flex justify-between w-full">
                      <span className="text-sm">{plan.display_name} </span>
                      {price && (
                        <span className="text-sm">
                          {formatPrice(price.amount)} / {price.interval}
                        </span>
                      )}
                    </div>
                  }
                >
                  <div className="flex flex-col">
                    {/* <span className="text-xs text-muted-foreground mt-1">
                      {plan.description}
                    </span> */}
                    <span className="text-xs text-muted-foreground mt-1">
                      {plan.features_summary}
                    </span>

                    {/* <div className="flex flex-col gap-2 text-sm mt-3">
                      {plan.features.map((feature) => (
                        <div
                          key={feature.feature_name}
                          className="flex justify-between gap-2"
                        >
                          <span className="text-muted-foreground">
                            {feature.feature_name}
                          </span>
                          <span className="font-medium">{feature.value}</span>
                        </div>
                      ))}
                    </div> */}
                  </div>
                </RadioChoiceCard>
              );
            })}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <h3 className="text-base font-medium">Region</h3>
          </div>

          <RadioGroup
            value={formData.region}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, region: value }))
            }
            className="grid grid-cols-1 md:grid-cols-3 gap-2"
          >
            {availableRegions.map((region) => (
              <RadioChoiceCard
                key={region.id}
                id={region.id}
                title={region.name}
                description={region.country}
              />
            ))}
          </RadioGroup>
        </div>

        {postgresOptions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <h3 className="text-base font-medium">Postgres</h3>
            </div>

            <OptionGroup
              idPrefix="postgres"
              options={postgresOptions}
              value={formData.postgres}
              onChange={(name) =>
                setFormData((prev) => ({ ...prev, postgres: name }))
              }
              interval={paymentInterval}
            />
          </div>
        )}

        {availabilityOptions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-base font-medium">Availability</h3>
            </div>

            <OptionGroup
              idPrefix="availability"
              options={availabilityOptions}
              value={formData.availability || NO_AVAILABILITY}
              onChange={(name) =>
                setFormData((prev) => ({
                  ...prev,
                  availability: name === NO_AVAILABILITY ? "" : name,
                }))
              }
              interval={paymentInterval}
              noneLabel="None"
              noneDescription="No standby"
            />
          </div>
        )}
      </div>
      {/* Summary */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="grid grid-cols-4">
                <span className="text-sm font-medium col-span-2">Summary</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4 flex flex-col">
            <Separator />

            <div className="flex flex-col gap-2">
              <SummaryRow
                label="Tier"
                value={selectedPlan?.display_name ?? "-"}
              />

              <SummaryRow
                label="Region"
                value={
                  selectedRegion
                    ? `${selectedRegion.name}, ${selectedRegion.country}`
                    : "-"
                }
              />
              {postgresOptions.length > 0 && (
                <SummaryRow
                  label="Postgres"
                  value={selectedPostgres?.name ?? "-"}
                />
              )}
              {availabilityOptions.length > 0 && (
                <SummaryRow
                  label="Availability"
                  value={selectedAvailability?.name ?? "None"}
                />
              )}
            </div>
            <Separator />

            <div className="grid grid-cols-4">
              <span className="col-span-2 text-sm">Estimated cost</span>
              <div className="col-span-2 flex justify-end gap-2">
                {paymentInterval === "year" && monthlyTotal !== null && (
                  <span className="text-sm line-through text-muted-foreground">
                    {formatPrice(monthlyTotal * 12)}
                  </span>
                )}
                <span className="text-sm font-medium text-end ">
                  {totalPrice !== null ? formatPrice(totalPrice) : "-"}
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <ButtonGroup>
                <Button
                  type="button"
                  variant={paymentInterval === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentInterval("month")}
                >
                  Monthly
                </Button>
                <Button
                  type="button"
                  variant={paymentInterval === "year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentInterval("year")}
                >
                  Yearly
                </Button>
              </ButtonGroup>
            </div>
            <div className="flex">
              <Button
                type="submit"
                disabled={submitting || !formData.plan_id || !formData.region}
                size="lg"
                className="w-full"
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isBranchMode ? "Create Branch" : "Create Project"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
