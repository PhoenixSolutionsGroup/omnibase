"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, UserX } from "lucide-react";
import type { TenantsTenantUserResponse } from "@omnibase/core-js";

interface UserViewerProps {
  users: TenantsTenantUserResponse[];
  availableRoles: string[];
  canEditUsers: boolean;
  onRoleUpdate?: (userId: string, newRole: string) => void | Promise<void>;
  onRemoveUser?: (userId: string) => void | Promise<void>;
}

export function UserViewer({
  users,
  availableRoles,
  canEditUsers,
  onRoleUpdate,
  onRemoveUser,
}: UserViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Handle role update
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    if (!onRoleUpdate) return;

    setIsUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      await onRoleUpdate(userId, newRole);
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Handle user removal
  const handleRemoveUser = async (userId: string) => {
    if (!onRemoveUser) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this user from the organization?"
    );
    if (!confirmed) return;

    setIsUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      await onRemoveUser(userId);
    } catch (error) {
      console.error("Failed to remove user:", error);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          {canEditUsers
            ? "View and manage users in your organization"
            : "View users in your organization"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-6">
          <Label htmlFor="search" className="sr-only">
            Search users
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>

        {/* Users Table */}
        {filteredUsers.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[180px]">Role</TableHead>
                  {canEditUsers && onRemoveUser && (
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.userId}>
                    {/* User Info */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground md:hidden">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="hidden md:table-cell">
                      {user.email}
                    </TableCell>

                    {/* Role Selector */}
                    <TableCell>
                      {canEditUsers && onRoleUpdate ? (
                        <Select
                          value={user.role}
                          onValueChange={(newRole) =>
                            handleRoleUpdate(user.userId, newRole)
                          }
                          disabled={isUpdating[user.userId]}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="capitalize text-sm font-medium">
                          {user.role}
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    {canEditUsers && onRemoveUser && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveUser(user.userId)}
                          disabled={isUpdating[user.userId]}
                          className="h-8 w-8"
                        >
                          <UserX className="h-4 w-4" />
                          <span className="sr-only">Remove user</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No users found matching your search"
                : "No users in this organization yet"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
