"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Database, Link as LinkIcon } from "lucide-react";
import { Project } from "./project-provisioning-dashboard";

interface ProjectDashboardClientProps {
  project: Project;
}

export function ProjectDashboardClient({
  project,
}: ProjectDashboardClientProps) {
  const apiEndpoints = [
    {
      name: "Auth Public URL",
      value: project.auth_public_url,
      description: "Public authentication endpoint for user operations",
    },
    {
      name: "Auth Admin URL",
      value: project.auth_admin_url,
      description: "Admin authentication endpoint for management operations",
    },

    {
      name: "PostgREST URL",
      value: project.postgrest_url,
      description: "RESTful API endpoint for database access",
    },
    {
      name: "API URL",
      value: project.api_url,
      description: "Main API endpoint",
    },
  ].filter((endpoint) => endpoint.value);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Welcome Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to {project.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {project.region} • Created{" "}
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* API Endpoints Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">API Endpoints</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your project's service URLs for integration
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {apiEndpoints.map((endpoint) => (
                <Card key={endpoint.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <LinkIcon className="h-4 w-4 text-primary" />
                      {endpoint.name}
                    </CardTitle>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono break-all">
                        {endpoint.value}
                      </code>
                      <button
                        className="flex-shrink-0 rounded p-2 hover:bg-muted"
                        onClick={() => handleCopy(endpoint.value || "")}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Database Information */}
          {project.database_host && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Database Information</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connection details for your database
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="h-4 w-4 text-primary" />
                    Database Connection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Host
                      </p>
                      <p className="mt-1 font-mono text-sm">
                        {project.database_host}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Database Name
                      </p>
                      <p className="mt-1 font-mono text-sm">
                        {project.database_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Username
                      </p>
                      <p className="mt-1 font-mono text-sm">
                        {project.database_username}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Port
                      </p>
                      <p className="mt-1 font-mono text-sm">
                        {project.database_port}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
