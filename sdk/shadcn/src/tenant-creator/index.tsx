"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

export interface TenantCreatorConfig {
  createOrganizationText?: string;
  joinOrganizationText?: string;
  defaultMode?: "create" | "join";
  createForm?: {
    organizationName?: {
      label?: string;
      placeholder?: string;
      defaultValue?: string;
    };
    billingEmail?: {
      label?: string;
      placeholder?: string;
      defaultValue?: string;
    };
  };
  joinForm?: {
    token?: {
      label?: string;
      placeholder?: string;
    };
  };
}

export interface TenantCreatorFormActions {
  createOrganizationAction?: (formData: FormData) => void | Promise<void>;
  joinOrganizationAction?: (formData: FormData) => void | Promise<void>;
}

export interface TenantCreatorProps {
  config?: TenantCreatorConfig;
  formActions?: TenantCreatorFormActions;
  className?: string;
}

export function TenantCreator({
  config = {},
  formActions = {},
  className,
}: TenantCreatorProps) {
  const [mode, setMode] = useState<"create" | "join">(
    config.defaultMode || "create"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Form state for create organization
  const [organizationName, setOrganizationName] = useState(
    config.createForm?.organizationName?.defaultValue || ""
  );
  const [billingEmail, setBillingEmail] = useState(
    config.createForm?.billingEmail?.defaultValue || ""
  );

  // Form state for join organization
  const [token, setToken] = useState("");

  // Auto-fill invite token from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get("invite_token");

    if (inviteToken) {
      setToken(inviteToken);
      setMode("join"); // Auto-switch to join mode when invite token is present
    }
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formActions.createOrganizationAction) return;

    setIsLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await formActions.createOrganizationAction(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formActions.joinOrganizationAction) return;

    setIsLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await formActions.joinOrganizationAction(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader>
        <CardTitle>Organization Setup</CardTitle>
        <CardDescription>
          Choose how you want to get started with your organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="grid grid-cols-2 rounded-lg bg-muted p-1">
          <label
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all",
              mode === "create"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              isLoading && "pointer-events-none opacity-50"
            )}
          >
            <input
              type="radio"
              name="mode"
              value="create"
              checked={mode === "create"}
              onChange={() => setMode("create")}
              className="sr-only"
              disabled={isLoading}
            />
            {config.createOrganizationText || "Create Organization"}
          </label>
          <label
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all",
              mode === "join"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              isLoading && "pointer-events-none opacity-50"
            )}
          >
            <input
              type="radio"
              name="mode"
              value="join"
              checked={mode === "join"}
              onChange={() => setMode("join")}
              className="sr-only"
              disabled={isLoading}
            />
            {config.joinOrganizationText || "Join Organization"}
          </label>
        </div>

        {/* Create Organization Form */}
        {mode === "create" && (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">
                {config.createForm?.organizationName?.label ||
                  "Organization Name"}
              </Label>
              <Input
                id="organizationName"
                name="organizationName"
                type="text"
                placeholder={
                  config.createForm?.organizationName?.placeholder ||
                  "Enter organization name"
                }
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingEmail">
                {config.createForm?.billingEmail?.label || "Billing Email"}
              </Label>
              <Input
                id="billingEmail"
                name="billingEmail"
                type="email"
                placeholder={
                  config.createForm?.billingEmail?.placeholder ||
                  "Enter billing email"
                }
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        )}

        {/* Join Organization Form */}
        {mode === "join" && (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">
                {config.joinForm?.token?.label || "Invitation Token"}
              </Label>
              <Input
                id="token"
                name="token"
                type="text"
                placeholder={
                  config.joinForm?.token?.placeholder ||
                  "Enter invitation token"
                }
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Joining..." : "Join Organization"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default TenantCreator;
