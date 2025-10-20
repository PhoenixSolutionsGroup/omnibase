import { Command } from "commander";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  RelationshipApi,
  PermissionApi,
  CreateRelationshipBody,
  PostCheckPermissionBody,
} from "@ory/client";
import { findOmnibaseRoot, resolveEnvironment } from "../utils/environment";

// Helper function to extract meaningful error messages from API responses
function extractErrorMessage(error: any): string {
  if (error.response?.data?.error) {
    // Extract the actual error message from the API response
    return typeof error.response.data.error === "string"
      ? error.response.data.error
      : JSON.stringify(error.response.data.error);
  } else if (error.response?.status) {
    // Fallback to HTTP status information
    return `HTTP ${error.response.status}: ${
      error.response.statusText || "Request failed"
    }`;
  } else if (error.message) {
    // Fallback to error message
    return error.message;
  }
  return "Unknown error";
}

export class PermissionsCommand {
  private relationshipApi: RelationshipApi;
  private permissionApi: PermissionApi;

  constructor(apiUrl: string) {
    this.relationshipApi = new RelationshipApi(
      undefined,
      `${apiUrl}/api/v1/permissions/write`
    );
    this.permissionApi = new PermissionApi(
      undefined,
      `${apiUrl}/api/v1/permissions/read`
    );
  }

  /**
   * Push all namespace files to API
   */
  async push(apiUrl: string, token?: string): Promise<void> {
    console.log("🚀 Pushing permissions...");

    const permissionsDir = path.join(process.cwd(), "omnibase", "permissions");

    if (!fs.existsSync(permissionsDir)) {
      console.error(
        "❌ Permissions directory not found: omnibase/permissions/"
      );
      process.exit(1);
    }

    // Read all .ts files from permissions directory
    const files = fs
      .readdirSync(permissionsDir)
      .filter((file) => file.endsWith(".ts") && file !== "types.ts");

    if (files.length === 0) {
      console.log("⚠️  No namespace files found");
      return;
    }

    console.log(`📁 Found ${files.length} namespace file(s):`);
    files.forEach((f) => console.log(`   • ${f}`));

    // Create zip archive
    const AdmZip = require("adm-zip");
    const zip = new AdmZip();

    files.forEach((f) => {
      zip.addLocalFile(path.join(permissionsDir, f));
    });

    const zipBuffer = zip.toBuffer();

    console.log(`📤 Uploading to ${apiUrl}...`);

    const FormData = require("form-data");
    const axios = require("axios");

    const formData = new FormData();
    formData.append("namespaces", zipBuffer, {
      filename: "namespaces.zip",
      contentType: "application/zip",
    });

    try {
      const headers: Record<string, string> = {
        ...formData.getHeaders(),
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${apiUrl}/api/v1/permissions/deploy`,
        formData,
        { headers }
      );

      const result = response.data;

      console.log("✅ Namespaces deployed successfully!");

      if (result.managed_mode) {
        console.log("🔄 Managed hosting service is restarting...");
        console.log("✅ Keto will load new namespaces automatically");
      } else {
        console.log("ℹ️  Local mode: Restart docker-compose to apply changes");
        console.log("   Run: docker compose restart keto");
      }

      console.log("🎉 Permissions pushed successfully!");
    } catch (error) {
      console.error("❌ Failed to deploy namespaces:", error);
      process.exit(1);
    }
  }

  /**
   * Get auth token from config or environment
   */
  public getToken(): string | undefined {
    return process.env.OMNIBASE_TOKEN || undefined;
  }

  /**
   * Validate namespace TypeScript syntax
   */
  async validate(): Promise<boolean> {
    console.log("🔍 Validating namespace files...");

    const permissionsDir = path.join(process.cwd(), "omnibase", "permissions");

    if (!fs.existsSync(permissionsDir)) {
      console.error(
        "❌ Permissions directory not found: omnibase/permissions/"
      );
      return false;
    }

    const files = fs
      .readdirSync(permissionsDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => path.join(permissionsDir, file));

    if (files.length === 0) {
      console.log("⚠️  No TypeScript namespace files found");
      return true;
    }

    console.log(`📁 Validating ${files.length} file(s)...`);

    try {
      // Use bun to check TypeScript syntax (faster than tsc)
      for (const file of files) {
        console.log(`   • Checking ${path.basename(file)}...`);
        try {
          // Just compile without output to check syntax
          execSync(`bun build ${file} --no-bundle --target=node`, {
            stdio: "pipe",
            cwd: process.cwd(),
          });
        } catch (error) {
          console.error(`❌ Syntax error in ${path.basename(file)}`);
          console.error(error instanceof Error ? error.message : String(error));
          return false;
        }
      }

      console.log("✅ All namespace files are valid!");
      return true;
    } catch (error) {
      console.error("❌ Validation failed - TypeScript syntax errors found");
      return false;
    }
  }

  /**
   * Check if a subject has permission
   */
  async check(
    subject: string,
    object: string,
    relation: string
  ): Promise<void> {
    console.log(`🔍 Checking permission: ${subject} -> ${object}#${relation}`);

    // Parse subject to get namespace and ID
    const [namespace, subjectId] = subject.includes(":")
      ? subject.split(":")
      : ["User", subject];
    const [objectNamespace, objectId] = object.includes(":")
      ? object.split(":")
      : ["Tenant", object];

    const checkRequest: PostCheckPermissionBody = {
      namespace: objectNamespace,
      object: objectId,
      relation: relation,
      subject_id: subjectId,
    };

    try {
      const response = await this.permissionApi.postCheckPermission({
        maxDepth: undefined,
        postCheckPermissionBody: checkRequest,
      });

      if (response.data.allowed) {
        console.log("✅ Permission GRANTED");
      } else {
        console.log("❌ Permission DENIED");
      }
    } catch (error: any) {
      console.error(
        "❌ Failed to check permission:",
        extractErrorMessage(error)
      );
    }
  }

  /**
   * Set a permission relation
   */
  async set(subject: string, object: string, relation: string): Promise<void> {
    console.log(`⚡ Setting permission: ${subject} -> ${object}#${relation}`);

    // Parse subject and object
    const [namespace, subjectId] = subject.includes(":")
      ? subject.split(":")
      : ["User", subject];
    const [objectNamespace, objectId] = object.includes(":")
      ? object.split(":")
      : ["Tenant", object];

    const createRelationshipBody: CreateRelationshipBody = {
      namespace: objectNamespace,
      object: objectId,
      relation: relation,
      subject_id: subjectId,
    };

    try {
      const response = await this.relationshipApi.createRelationship({
        createRelationshipBody: createRelationshipBody,
      });
      console.log("✅ Permission set successfully");
      console.log(
        `   Created relationship: ${response.data.namespace}:${response.data.object}#${response.data.relation}@${response.data.subject_id}`
      );
    } catch (error: any) {
      console.error("❌ Failed to set permission:", extractErrorMessage(error));
    }
  }
}

// CLI command definitions
export function addPermissionsCommands(program: Command): void {
  const permissions = program
    .command("permissions")
    .description("Manage Ory Keto permissions");

  permissions
    .command("push")
    .description("Deploy namespace files to API")
    .action(async () => {
      try {
        const options = program.opts();
        const envConfig = resolveEnvironment(options.env);
        const permissionsCmd = new PermissionsCommand(envConfig.apiUrl);

        console.log(`Using environment: ${envConfig.name}`);
        await permissionsCmd.push(envConfig.apiUrl, permissionsCmd.getToken());
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  permissions
    .command("validate")
    .description("Validate TypeScript namespace syntax")
    .action(async () => {
      try {
        const options = program.opts();
        const envConfig = resolveEnvironment(options.env);
        const permissionsCmd = new PermissionsCommand(envConfig.apiUrl);

        console.log(`Using environment: ${envConfig.name}`);
        const isValid = await permissionsCmd.validate();
        process.exit(isValid ? 0 : 1);
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  permissions
    .command("check")
    .description("Check if subject has permission")
    .argument("<subject>", "Subject (e.g., user:123 or just 123)")
    .argument("<object>", "Object (e.g., tenant:456 or just 456)")
    .argument("<relation>", "Relation (e.g., invite, delete, view)")
    .action(async (subject: string, object: string, relation: string) => {
      try {
        const options = program.opts();
        const envConfig = resolveEnvironment(options.env);
        const permissionsCmd = new PermissionsCommand(envConfig.apiUrl);

        console.log(`Using environment: ${envConfig.name}`);
        await permissionsCmd.check(subject, object, relation);
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  permissions
    .command("set")
    .description("Set a permission relation")
    .argument("<subject>", "Subject (e.g., user:123 or just 123)")
    .argument("<object>", "Object (e.g., tenant:456 or just 456)")
    .argument("<relation>", "Relation (e.g., owners, admins, can_invite)")
    .action(async (subject: string, object: string, relation: string) => {
      try {
        const options = program.opts();
        const envConfig = resolveEnvironment(options.env);
        const permissionsCmd = new PermissionsCommand(envConfig.apiUrl);

        console.log(`Using environment: ${envConfig.name}`);
        await permissionsCmd.set(subject, object, relation);
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}
