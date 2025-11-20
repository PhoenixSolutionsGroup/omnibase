"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TenantsCreateTenantUserInviteRequest } from "@omnibase/core-js";

interface UserInviteProps {
  roles: string[];
  onInvite?: (
    inviteData: TenantsCreateTenantUserInviteRequest
  ) => void | Promise<void>;
}

export function UserInvite({ roles, onInvite }: UserInviteProps) {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const isFormValid = (): boolean => {
    return email.trim() !== "" && isValidEmail(email) && selectedRole !== "";
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid()) {
      setError("Please fill in all fields with valid data");
      return;
    }

    setIsSubmitting(true);

    try {
      const inviteData: TenantsCreateTenantUserInviteRequest = {
        email: email.trim(),
        role: selectedRole,
        inviteUrl: "",
      };

      await onInvite?.(inviteData);

      // Reset form on success
      setEmail("");
      setSelectedRole("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send invitation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setEmail("");
    setSelectedRole("");
    setError(null);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Invite User</CardTitle>
        <CardDescription>
          Send an invitation to a new user to join your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={email !== "" && !isValidEmail(email)}
            />
            {email !== "" && !isValidEmail(email) && (
              <p className="text-xs text-destructive">
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-roles" disabled>
                    No roles available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The role determines what permissions the user will have
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" disabled={!isFormValid() || isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
