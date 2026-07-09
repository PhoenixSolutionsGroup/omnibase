"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  fetchTenants,
  fetchTenantUsers,
  getTenantJWT,
  Tenant,
  TenantUser,
} from "@/app/(dashboard)/(project)/projects/[project_id]/[project_branch]/studio/actions";
import { cn } from "@/lib/utils";

interface RLSSimulatorProps {
  project: {
    project_id: string;
    branch_name: string;
  };
  onSimulate: (token: string | null) => void;
}

export function RLSSimulator({ project, onSimulate }: RLSSimulatorProps) {
  const [userId, setUserId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch tenants when expanded (lazy load)
  useEffect(() => {
    if (expanded && tenants.length === 0 && !loadingTenants) {
      loadTenants();
    }
  }, [expanded]);

  // Fetch users when tenant changes
  useEffect(() => {
    if (tenantId) {
      loadUsers(tenantId);
    } else {
      setUsers([]);
      setUserId("");
    }
  }, [tenantId]);

  const loadTenants = async () => {
    setLoadingTenants(true);
    try {
      const result = await fetchTenants(project.project_id, project.branch_name);
      if (result.success && result.tenants) {
        setTenants(result.tenants);
      } else {
        toast.error(result.error || "Failed to load tenants");
      }
    } catch (e: any) {
      toast.error("Failed to load tenants");
    } finally {
      setLoadingTenants(false);
    }
  };

  const loadUsers = async (tid: string) => {
    setLoadingUsers(true);
    setUserId("");
    try {
      const result = await fetchTenantUsers(project.project_id, project.branch_name, tid);
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        toast.error(result.error || "Failed to load users");
      }
    } catch (e: any) {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSimulate = async () => {
    if (!userId || !tenantId) {
      toast.error("Please provide both Tenant ID and User ID");
      return;
    }
    setLoading(true);
    try {
      const result = await getTenantJWT(
        project.project_id,
        project.branch_name,
        tenantId,
        userId
      );

      if (!result.success || !result.token) {
        throw new Error(result.error || "Failed to get JWT");
      }

      onSimulate(result.token);
      toast.success("RLS Simulation active");
      setIsActive(true);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate simulation token");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    onSimulate(null);
    setIsActive(false);
    setTenantId("");
    setUserId("");
    toast.info("RLS Simulation cleared");
  };

  return (
    <div className="border-t bg-muted/5" data-testid="rls-simulation">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between h-10 rounded-none px-4"
        onClick={() => setExpanded(!expanded)}
        data-testid="rls-simulation-toggle"
      >
        <span className="font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          RLS Simulation {isActive && <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Active</span>}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      <div className={cn("overflow-hidden transition-all", expanded ? "max-h-[400px]" : "max-h-0")}>
        <div className="p-4 pt-2 space-y-4">
          <p className="text-sm text-muted-foreground">
            Preview data as a specific user and tenant.
          </p>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Tenant</Label>
              <Select value={tenantId} onValueChange={setTenantId} disabled={loadingTenants}>
                <SelectTrigger data-testid="tenant-select">
                  {loadingTenants ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading tenants...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select tenant" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>User</Label>
              <Select value={userId} onValueChange={setUserId} disabled={!tenantId || loadingUsers}>
                <SelectTrigger data-testid="user-select">
                  {loadingUsers ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading users...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder={tenantId ? "Select user" : "Select a tenant first"} />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            {isActive ? (
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Clear Simulation
              </Button>
            ) : (
              <Button
                onClick={handleSimulate}
                disabled={loading || !tenantId || !userId}
                className="flex-1"
                data-testid="simulate-button"
              >
                {loading ? "Generating..." : "Simulate"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
