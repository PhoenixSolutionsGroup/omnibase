import { Metadata } from "next";
import { ProvisioningForm } from "@/components/provisioning-form";

export const metadata: Metadata = {
  title: "New Project | OmniBase",
  description: "Create a new project",
};

export default function NewProjectPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Project
        </h1>
        <p className="text-muted-foreground">
          Deploy a new project to OmniBase managed infrastructure.
        </p>
      </div>
      <ProvisioningForm mode="project" />
    </div>
  );
}
