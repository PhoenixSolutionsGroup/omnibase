"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectGroupId?: string; // If provided, we're creating a branch
  projectName?: string; // For branch creation, show the parent project name
}

interface Region {
  label: string;
  value: string;
  cloudrun_region: string;
  neon_region: string;
}

const REGIONS: Region[] = [
  {
    label: "US East",
    value: "us-east",
    cloudrun_region: "us-east1",
    neon_region: "aws-us-east-1",
  },
  {
    label: "US Central",
    value: "us-central",
    cloudrun_region: "us-central1",
    neon_region: "aws-us-west-2",
  },
  {
    label: "US West",
    value: "us-west",
    cloudrun_region: "us-west1",
    neon_region: "aws-us-west-2",
  },
  {
    label: "Sydney",
    value: "sydney",
    cloudrun_region: "australia-southeast1",
    neon_region: "aws-ap-southeast-2",
  },
];

export function CreateProjectModal({
  open,
  onOpenChange,
  projectGroupId,
  projectName: parentProjectName,
}: CreateProjectModalProps) {
  const router = useRouter();
  const isBranchMode = !!projectGroupId;

  const [projectName, setProjectName] = React.useState("");
  const [branchName, setBranchName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedRegion = REGIONS.find((r) => r.value === region);
    if (!selectedRegion) {
      console.error("No region selected");
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = isBranchMode
        ? {
            name: parentProjectName || projectName,
            branch_name: branchName,
            project_group_id: projectGroupId,
            region: selectedRegion.value,
            email,
            cloudrun_region: selectedRegion.cloudrun_region,
            neon_region: selectedRegion.neon_region,
            r2_region: "auto",
            website_url: websiteUrl,
          }
        : {
            name: projectName,
            region: selectedRegion.value,
            email,
            cloudrun_region: selectedRegion.cloudrun_region,
            neon_region: selectedRegion.neon_region,
            r2_region: "auto",
            website_url: websiteUrl,
          };

      const response = await fetch("/api/provision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.project_id) {
        // Reset form
        setProjectName("");
        setBranchName("");
        setEmail("");
        setRegion("");
        setWebsiteUrl("");
        onOpenChange(false);

        // Navigate to the project dashboard using new routing structure
        router.push(
          `/projects/${data.project_group_id}/${data.branch_name}/dashboard`
        );
        router.refresh();
      }
    } catch (error) {
      console.error("Error provisioning project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isBranchMode ? "Create New Branch" : "Create New Project"}
          </DialogTitle>
          <DialogDescription>
            {isBranchMode
              ? `Create a new branch for ${parentProjectName}. All fields are required.`
              : "Configure your new project. All fields are required."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {isBranchMode ? (
              <div className="grid gap-2">
                <Label htmlFor="branch_name">Branch Name</Label>
                <Input
                  id="branch_name"
                  type="text"
                  placeholder="feature-branch"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="project_name">Project Name</Label>
                <Input
                  id="project_name"
                  type="text"
                  placeholder="My Awesome Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="region">Region</Label>
              <Select value={region} onValueChange={setRegion} required>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                (isBranchMode
                  ? !branchName || !email || !region || !websiteUrl
                  : !projectName || !email || !region || !websiteUrl)
              }
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading
                ? "Creating..."
                : isBranchMode
                ? "Create Branch"
                : "Create Project"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
