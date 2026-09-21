"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Globe, Loader2, Plus, Trash2 } from "lucide-react";

interface Worker {
  id: string;
  name: string;
  worker_url?: string;
}

interface AccountDomain {
  id: string;
  hostname: string;
  is_wildcard: boolean;
  status: string;
}

interface AttachedDomain {
  id: string;
  hostname: string;
  account_domain_id: string;
  status: string;
}

interface WorkerDomainsProps {
  branchId: string;
}

export function WorkerDomains({ branchId }: WorkerDomainsProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [domains, setDomains] = useState<AccountDomain[]>([]);
  const [attachedByWorker, setAttachedByWorker] = useState<
    Record<string, AttachedDomain[]>
  >({});
  const [selectedDomainByWorker, setSelectedDomainByWorker] = useState<
    Record<string, string>
  >({});
  const [subdomainByWorker, setSubdomainByWorker] = useState<
    Record<string, string>
  >({});
  const [attachingWorker, setAttachingWorker] = useState<string | null>(null);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const res = await fetch(`/api/project_branches/${branchId}/workers`);
        if (res.ok) {
          const data = await res.json();
          setWorkers(data);
        }
      } catch (error) {
        console.error("Failed to load workers:", error);
      } finally {
        setLoadingWorkers(false);
      }
    };
    loadWorkers();
  }, [branchId]);

  const loadDomains = useCallback(async () => {
    try {
      const res = await fetch("/api/domains");
      if (res.ok) {
        const data = await res.json();
        setDomains(data.filter((d: AccountDomain) => d.status === "active"));
      }
    } catch (error) {
      console.error("Failed to load domains:", error);
    }
  }, []);

  const loadAttached = useCallback(
    async (workerName: string) => {
      try {
        const res = await fetch(
          `/api/project_branches/${branchId}/workers/${workerName}/domains`
        );
        if (res.ok) {
          const data = await res.json();
          setAttachedByWorker((prev) => ({ ...prev, [workerName]: data }));
        }
      } catch (error) {
        console.error("Failed to load attached domains:", error);
      }
    },
    [branchId]
  );

  useEffect(() => {
    loadDomains();
  }, [loadDomains]);

  useEffect(() => {
    for (const w of workers) {
      loadAttached(w.name);
    }
  }, [workers, loadAttached]);

  const handleAttach = async (workerName: string) => {
    const domainId = selectedDomainByWorker[workerName];
    if (!domainId) return;
    const domain = domains.find((d) => d.id === domainId);
    if (!domain) return;

    let target = domain.hostname;
    if (domain.is_wildcard) {
      const sub = subdomainByWorker[workerName]?.trim();
      if (!sub) {
        toast.error("Enter the subdomain to attach");
        return;
      }
      target = sub.toLowerCase();
    }

    setAttachingWorker(workerName);
    try {
      const res = await fetch(
        `/api/project_branches/${branchId}/workers/${workerName}/domains`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account_domain_id: domain.id, hostname: target }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || data?.message || "Failed to attach domain");
        return;
      }
      toast.success(`${target} attached to ${workerName}`);
      setSelectedDomainByWorker((prev) => ({ ...prev, [workerName]: "" }));
      setSubdomainByWorker((prev) => ({ ...prev, [workerName]: "" }));
      loadAttached(workerName);
    } catch (error) {
      toast.error("Failed to attach domain");
    } finally {
      setAttachingWorker(null);
    }
  };

  const handleDetach = async (workerName: string, domainId: string, hostname: string) => {
    try {
      const res = await fetch(
        `/api/project_branches/${branchId}/worker-domains/${domainId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success(`${hostname} detached from ${workerName}`);
        loadAttached(workerName);
      } else {
        toast.error("Failed to detach domain");
      }
    } catch (error) {
      toast.error("Failed to detach domain");
    }
  };

  if (loadingWorkers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Worker Domains
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading workers...
        </CardContent>
      </Card>
    );
  }

  if (workers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Worker Domains
          </CardTitle>
          <CardDescription>
            Attach a verified domain to this branch's workers. Add and verify
            domains from the organization-level Domains page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No workers deployed yet. Deploy a worker first to attach a domain.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="worker-domains">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Worker Domains
        </CardTitle>
        <CardDescription>
          Attach a verified domain to this branch's workers. Add and verify
          domains from the organization-level Domains page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {domains.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No verified domains available. Add one on the organization-level
            Domains page first.
          </p>
        )}

        {workers.map((worker) => {
          const attached = attachedByWorker[worker.name] ?? [];
          const selectedDomainId = selectedDomainByWorker[worker.name] ?? "";
          const selectedDomain = domains.find(
            (d) => d.id === selectedDomainId
          );
          const attaching = attachingWorker === worker.name;

          return (
            <div key={worker.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{worker.name}</p>
                {worker.worker_url && (
                  <span className="text-xs text-muted-foreground">
                    {worker.worker_url}
                  </span>
                )}
              </div>

              {attached.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attached.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded border bg-muted/40 px-3 py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{d.hostname}</span>
                        <span className="text-xs text-muted-foreground">
                          {d.status}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          handleDetach(worker.name, d.id, d.hostname)
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="min-w-56 flex-1 space-y-1">
                  <label
                    htmlFor={`domain-${worker.id}`}
                    className="text-xs font-medium"
                  >
                    Select a verified domain
                  </label>
                  <select
                    id={`domain-${worker.id}`}
                    value={selectedDomainId}
                    onChange={(e) =>
                      setSelectedDomainByWorker((prev) => ({
                        ...prev,
                        [worker.name]: e.target.value,
                      }))
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select a domain...</option>
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.hostname}
                        {d.is_wildcard ? " (wildcard)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedDomain?.is_wildcard && (
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={`sub-${worker.id}`}
                      className="text-xs font-medium"
                    >
                      Subdomain
                    </label>
                    <Input
                      id={`sub-${worker.id}`}
                      value={subdomainByWorker[worker.name] ?? ""}
                      onChange={(e) =>
                        setSubdomainByWorker((prev) => ({
                          ...prev,
                          [worker.name]: e.target.value,
                        }))
                      }
                      placeholder={
                        selectedDomain
                          ? `app.${selectedDomain.hostname.replace("*.", "")}`
                          : ""
                      }
                      className="h-9"
                    />
                  </div>
                )}
                <Button
                  size="sm"
                  onClick={() => handleAttach(worker.name)}
                  disabled={attaching || !selectedDomainId}
                >
                  {attaching ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="mr-1 h-3 w-3" />
                  )}
                  Attach
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}