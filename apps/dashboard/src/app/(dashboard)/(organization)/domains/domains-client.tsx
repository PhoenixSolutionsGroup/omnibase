"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Globe,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

interface Domain {
  id: string;
  hostname: string;
  is_wildcard: boolean;
  status: string;
  ssl_status?: string;
  dcv_record_name?: string;
  dcv_record_value?: string;
  cname_target: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600">
        <Check className="h-3 w-3" /> Active
      </Badge>
    );
  }
  if (status === "pending" || status === "pending_validation") {
    return (
      <Badge variant="secondary" className="bg-amber-500/15 text-amber-600">
        <Loader2 className="h-3 w-3 animate-spin" /> Pending
      </Badge>
    );
  }
  return <Badge variant="destructive">{status}</Badge>;
}

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex items-center gap-2 rounded bg-background px-3 py-1.5 font-mono text-xs text-foreground ring-1 ring-border transition-colors hover:ring-ring"
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
      <span className="sr-only">Copy {label}</span>
    </button>
  );
}

function DnsRow({
  type,
  name,
  value,
  showStatus,
}: {
  type: string;
  name: string;
  value: string;
  showStatus?: boolean;
}) {
  return (
    <div className="grid grid-cols-[64px_1fr_1.5fr_auto] items-center gap-3 px-4 py-2.5 text-sm">
      <span className="font-mono text-xs text-muted-foreground">{type}</span>
      <CopyValue value={name} label={type} />
      <CopyValue value={value} label={type} />
      {showStatus && <span />}
    </div>
  );
}

function DomainCard({
  domain,
  onStatus,
  onRetry,
  onDelete,
}: {
  domain: Domain;
  onStatus: (d: Domain) => Promise<void>;
  onRetry: (d: Domain) => Promise<void>;
  onDelete: (d: Domain) => Promise<void>;
}) {
  const baseHostname = domain.is_wildcard
    ? domain.hostname.replace("*.", "")
    : domain.hostname;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{domain.hostname}</span>
              {domain.is_wildcard && (
                <Badge variant="outline">Wildcard</Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Point your DNS at{" "}
              <span className="font-mono">{domain.cname_target}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={domain.status} />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onDelete(domain)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {domain.status !== "active" && (
          <div className="mt-4 space-y-3">
            <div className="divide-y rounded-md border bg-muted/40">
              <div className="grid grid-cols-[64px_1fr_1.5fr_auto] gap-3 bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <span>Type</span>
                <span>Name</span>
                <span>Value</span>
                <span />
              </div>
              <DnsRow type="CNAME" name={domain.hostname} value={domain.cname_target} />
              {domain.dcv_record_name && domain.dcv_record_value && (
                <DnsRow
                  type="TXT"
                  name={domain.dcv_record_name}
                  value={domain.dcv_record_value}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatus(domain)}
              >
                Check Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetry(domain)}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Retry Validation
              </Button>
            </div>
          </div>
        )}

        {domain.status === "active" && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            DNS verified and certificate issued — attach this domain to a
            worker from the project's Configuration page.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [hostname, setHostname] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadDomains = useCallback(async () => {
    try {
      const res = await fetch("/api/domains");
      if (res.ok) setDomains(await res.json());
    } catch (error) {
      console.error("Failed to load domains:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDomains();
  }, [loadDomains]);

  useEffect(() => {
    if (domains.length === 0) return;
    if (domains.every((d) => d.status === "active")) return;

    const interval = setInterval(async () => {
      const refreshed = await Promise.all(
        domains
          .filter((d) => d.status !== "active")
          .map(async (d) => {
            try {
              const res = await fetch(`/api/domains/${d.id}/status`);
              if (res.ok) return (await res.json()) as Domain;
            } catch {
              return d;
            }
            return d;
          })
      );
      setDomains((prev) =>
        prev.map((d) => {
          const match = refreshed.find((r) => r?.id === d.id);
          return match ? { ...d, ...match } : d;
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [domains]);

  const handleAdd = async () => {
    if (!hostname.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: hostname.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || data?.message || "Failed to add domain");
        return;
      }
      toast.success("Domain added — set up the DNS records below");
      setHostname("");
      loadDomains();
    } catch (error) {
      toast.error("Failed to add domain");
    } finally {
      setAdding(false);
    }
  };

  const handleStatus = async (d: Domain) => {
    try {
      const res = await fetch(`/api/domains/${d.id}/status`);
      if (res.ok) {
        const data = (await res.json()) as Domain;
        setDomains((prev) => prev.map((p) => (p.id === d.id ? data : p)));
        if (data.status === "active") toast.success(`${d.hostname} is active`);
      }
    } catch (error) {
      toast.error("Failed to check status");
    }
  };

  const handleRetry = async (d: Domain) => {
    try {
      const res = await fetch(`/api/domains/${d.id}/retry`, { method: "POST" });
      if (res.ok) {
        toast.success("Validation retrying");
      } else {
        toast.error("Failed to retry validation");
      }
    } catch (error) {
      toast.error("Failed to retry validation");
    }
  };

  const handleDelete = async (d: Domain) => {
    try {
      const res = await fetch(`/api/domains/${d.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`${d.hostname} removed`);
        loadDomains();
      } else {
        toast.error("Failed to remove domain");
      }
    } catch (error) {
      toast.error("Failed to remove domain");
    }
  };

  return (
    <div className="my-8 mx-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domains</h1>
          <p className="mt-1 text-muted-foreground">
            Add a domain once, verify it, then attach it to any worker.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="flex items-end gap-3 p-4">
          <div className="space-y-1">
            <label htmlFor="domain-input" className="text-sm font-medium">
              Domain
            </label>
            <Input
              id="domain-input"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="example.com or *.example.com"
              className="w-80"
            />
            <p className="text-xs text-muted-foreground">
              Use <span className="font-mono">*.example.com</span> to cover all
              subdomains with one certificate.
            </p>
          </div>
          <Button onClick={handleAdd} disabled={adding || !hostname.trim()}>
            {adding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add Domain
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading domains...
        </div>
      ) : domains.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-16 text-center">
          <Globe className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No domains yet. Add one above to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((d) => (
            <DomainCard
              key={d.id}
              domain={d}
              onStatus={handleStatus}
              onRetry={handleRetry}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}