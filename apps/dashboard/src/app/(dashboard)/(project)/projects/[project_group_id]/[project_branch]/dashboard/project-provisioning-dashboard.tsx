"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { EventsClient } from "@omnibase/core-js/database";
import { cn } from "@/lib/utils";
import { Database } from "@/types/database";

export type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectProvisioningDashboardProps {
  project: Project;
}

interface ProvisioningStep {
  id: string;
  label: string;
  isComplete: (project: Project) => boolean;
}

const PROVISIONING_STEPS: ProvisioningStep[] = [
  {
    id: "database",
    label: "Database",
    isComplete: (p) => !!p.database_host,
  },
  {
    id: "storage",
    label: "Storage (R2)",
    isComplete: (p) => !!p.r2_bucket_name,
  },
  {
    id: "authentication",
    label: "Authentication",
    isComplete: (p) => !!p.auth_public_url && !!p.auth_admin_url,
  },
  {
    id: "permissions",
    label: "Permissions",
    isComplete: (p) => !!p.keto_read_url && !!p.keto_write_url,
  },
  {
    id: "postgrest",
    label: "Database API",
    isComplete: (p) => !!p.postgrest_url,
  },
  {
    id: "api",
    label: "Core API",
    isComplete: (p) => !!p.api_url,
  },
];

export function ProjectProvisioningDashboard({
  project: initialProject,
}: ProjectProvisioningDashboardProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Check Stripe onboarding when project updates
  useEffect(() => {
    const checkStripeOnboarding = async () => {
      if (project.stripe_customer_id && !project.stripe_onboarding_complete) {
        try {
          const returnTo = encodeURIComponent(window.location.href);
          const response = await fetch(
            `/api/projects/${project.id}/stripe-onboarding?return_to=${returnTo}`
          );
          const data = await response.json();

          if (data.onboarding_required && data.url) {
            // Redirect to Stripe onboarding
            window.location.href = data.url;
          }
        } catch (error) {
          console.error("Failed to check Stripe onboarding:", error);
        }
      }
    };

    checkStripeOnboarding();
  }, [
    project.id,
    project.stripe_customer_id,
    project.stripe_onboarding_complete,
  ]);

  useEffect(() => {
    const eventsUrl = "ws://localhost:8080/api/v1/events/ws";
    const jwt =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("omnibase_postgrest_jwt="))
        ?.split("=")[1] || "";

    if (!eventsUrl || !jwt) {
      return;
    }

    const eventsClient = new EventsClient(eventsUrl, jwt);

    eventsClient.subscribe("projects", {
      rowId: initialProject.id,
      onChange: (data) => {
        setProject((prev) => ({ ...prev, ...data }));
      },
    });

    return () => {
      eventsClient.close();
    };
  }, [initialProject.id]);

  useEffect(() => {
    const completedSteps = PROVISIONING_STEPS.filter((step) =>
      step.isComplete(project)
    ).length;
    setCurrentStepIndex(completedSteps);
  }, [project]);

  const totalSteps = PROVISIONING_STEPS.length;
  const progressPercentage = (currentStepIndex / totalSteps) * 100;

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {currentStepIndex}/{totalSteps}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Provisioning {project.name}
            </h1>
            <p className="text-muted-foreground">
              Setting up your project infrastructure. This usually takes a few
              minutes.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mx-auto max-w-md">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deployment Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PROVISIONING_STEPS.map((step, index) => {
              const isComplete = step.isComplete(project);
              const isActive = index === currentStepIndex && !isComplete;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg p-3 transition-all duration-300",
                    isComplete && "bg-primary/5",
                    isActive && "bg-primary/10 ring-2 ring-primary/20"
                  )}
                >
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isComplete && "text-primary",
                        isActive && "text-primary",
                        !isComplete && !isActive && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                  </div>

                  {isComplete && (
                    <div className="flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        Ready
                      </span>
                    </div>
                  )}

                  {isActive && (
                    <div className="flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        Deploying...
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          This page will automatically refresh when your project is ready.
        </p>
      </div>
    </div>
  );
}
