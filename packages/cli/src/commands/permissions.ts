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
import {
  resolveEnvironment,
  findOmnibaseRoot,
  getProjectName,
} from "../utils/environment";
import chalk from "chalk";
import { AxiosInstance } from "axios";
import { createApiClient } from "../utils/api-client";
import { loadEnvFile } from "process";

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
  /**
   * Get the path to the environment file for the current environment
   */
  private getEnvFilePath(envName: string): string {
    const projectRoot = findOmnibaseRoot();
    return path.join(
      projectRoot,
      "omnibase",
      "environments",
      `.env.${envName}`
    );
  }

  async push(apiUrl: string, apiKey?: string): Promise<void> {
    console.log(chalk.gray("Pushing permissions..."));

    const permissionsDir = path.join(process.cwd(), "omnibase", "permissions");

    if (!fs.existsSync(permissionsDir)) {
      console.error(
        chalk.red("✗ Permissions directory not found: omnibase/permissions/")
      );
      process.exit(1);
    }

    // Read all .ts files from permissions directory (excluding types.ts)
    const files = fs
      .readdirSync(permissionsDir)
      .filter((file) => file.endsWith(".ts") && file !== "types.ts");

    if (files.length === 0) {
      console.log(chalk.yellow("⚠ No namespace files found"));
      return;
    }

    // Merge all namespace files into a single permissions.ts
    let mergedContent = "";

    files.forEach((file) => {
      const content = fs.readFileSync(path.join(permissionsDir, file), "utf-8");
      // Remove import statements and export keywords from class declarations
      const withoutImports = content
        .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "")
        .replace(/^export\s+(class\s+)/gm, "$1")
        .replace(/\r\n/g, "\n"); // ✅ Normalize CRLF → LF

      mergedContent += withoutImports + "\n\n";
    });

    // Check for roles.config.json
    const rolesConfigPath = path.join(permissionsDir, "roles.config.json");
    const hasRolesConfig = fs.existsSync(rolesConfigPath);

    if (hasRolesConfig) {
      console.log(chalk.gray("  Found roles.config.json"));
    }

    // Create zip archive with JSZip for better encoding control
    const JSZip = require("jszip");
    const zip = new JSZip();

    const timestamp = new Date().toISOString();
    // Add merged permissions.ts with explicit UTF-8 encoding and Unix line endings
    zip.file(`${timestamp}-permissions.ts`, mergedContent, {
      binary: false,
      createFolders: false,
      unixPermissions: 0o644,
    });

    // Add roles.config.json if it exists
    if (hasRolesConfig) {
      const rolesConfigContent = fs.readFileSync(rolesConfigPath, "utf-8");
      zip.file("roles.config.json", rolesConfigContent, {
        binary: false,
        createFolders: false,
        unixPermissions: 0o644,
      });
    }

    // Generate zip with explicit settings
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
      platform: "UNIX", // Force Unix-style zip
    });

    console.log(chalk.gray(`  Uploading to ${apiUrl}...`));

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

      // Add API key for backend authentication
      if (apiKey) {
        headers["X-Service-Key"] = apiKey;
      }

      const response = await axios.post(
        `${apiUrl}/api/v1/permissions/namespaces`,
        formData,
        { headers }
      );

      const result = response.data;

      console.log(chalk.green("✓ Namespaces deployed successfully"));

      if (result.roles_synced) {
        console.log(
          chalk.gray(
            `  Synced ${result.roles_synced} system role(s) to database`
          )
        );
      }

      if (result.managed_mode) {
        console.log(chalk.gray("  Managed hosting service is restarting..."));

        // Need to load env flag from `--env ENV`
        const env = resolveEnvironment();

        // Need to load env flag from `--env ENV`
        const apiClient = createApiClient();
        try {
          await apiClient.post(
            `/api/v1/projects/${env.projectId}/services/perm-read/restart`
          );

          await apiClient.post(
            `/api/v1/projects/${env.projectId}/services/perm-write/restart`
          );
        } catch (error) {
          console.log(error);
        }

        console.log(
          chalk.gray("  Permissions will load new namespaces automatically")
        );
      } else {
        console.log(chalk.gray("  Restarting permissions service..."));
        try {
          const projectRoot = findOmnibaseRoot();
          const projectName = getProjectName();
          const options = (global as any).__program_opts || {};
          const composeMode = options.mode || "default";
          const composeFileName =
            composeMode === "dev"
              ? "docker-compose.dev.yml"
              : "docker-compose.yml";
          const dockerComposePath = path.join(
            __dirname,
            "..",
            "..",
            "docker",
            composeFileName
          );

          // Get the environment config to determine which env file to use
          const envConfig = resolveEnvironment(options.env);

          // Set OMNIBASE_ENV_FILE environment variable for docker-compose
          const envFilePath = this.getEnvFilePath(envConfig.name);
          const env = { ...process.env, OMNIBASE_ENV_FILE: envFilePath };

          execSync(
            `docker compose --project-name ${projectName} -f ${dockerComposePath} restart permissions`,
            { stdio: "ignore", cwd: projectRoot, env }
          );
          console.log(chalk.gray("  Permissions restarted successfully"));
        } catch (error) {
          console.log(
            chalk.yellow("⚠ Failed to restart permissions automatically")
          );
          console.log(
            chalk.gray(
              "  Please run manually: docker compose restart permissions"
            )
          );
        }
      }

      console.log("");
      console.log(chalk.green("✓ Permissions pushed successfully"));
    } catch (error) {
      console.error(chalk.red("✗ Failed to deploy namespaces:"));
      console.error(error);
      process.exit(1);
    }
  }

  /**
   * Validate namespace TypeScript syntax
   */
  async validate(): Promise<boolean> {
    console.log(chalk.gray("Validating namespace files..."));

    const permissionsDir = path.join(process.cwd(), "omnibase", "permissions");

    if (!fs.existsSync(permissionsDir)) {
      console.error(
        chalk.red("✗ Permissions directory not found: omnibase/permissions/")
      );
      return false;
    }

    const files = fs
      .readdirSync(permissionsDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => path.join(permissionsDir, file));

    if (files.length === 0) {
      console.log(chalk.yellow("⚠ No TypeScript namespace files found"));
      return true;
    }

    console.log(chalk.gray(`  Validating ${files.length} file(s)...`));

    try {
      // Use bun to check TypeScript syntax (faster than tsc)
      for (const file of files) {
        console.log(chalk.gray(`    • Checking ${path.basename(file)}...`));
        try {
          // Just compile without output to check syntax
          execSync(`bun build ${file} --no-bundle --target=node`, {
            stdio: "pipe",
            cwd: process.cwd(),
          });
        } catch (error) {
          console.error(chalk.red(`✗ Syntax error in ${path.basename(file)}`));
          console.error(error instanceof Error ? error.message : String(error));
          return false;
        }
      }

      console.log(chalk.green("✓ All namespace files are valid"));
      return true;
    } catch (error) {
      console.error(
        chalk.red("✗ Validation failed - TypeScript syntax errors found")
      );
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
    console.log(
      chalk.gray(`Checking permission: ${subject} -> ${object}#${relation}`)
    );

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
        console.log(chalk.green("✓ Permission GRANTED"));
      } else {
        console.log(chalk.red("✗ Permission DENIED"));
      }
    } catch (error: any) {
      console.error(chalk.red("✗ Failed to check permission:"));
      console.error(extractErrorMessage(error));
    }
  }

  /**
   * Set a permission relation
   */
  async set(subject: string, object: string, relation: string): Promise<void> {
    console.log(
      chalk.gray(`Setting permission: ${subject} -> ${object}#${relation}`)
    );

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
      console.log(chalk.green("✓ Permission set successfully"));
      console.log(
        chalk.gray(
          `  Created relationship: ${response.data.namespace}:${response.data.object}#${response.data.relation}@${response.data.subject_id}`
        )
      );
    } catch (error: any) {
      console.error(chalk.red("✗ Failed to set permission:"));
      console.error(extractErrorMessage(error));
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
        // Store options globally so push() can access mode flag
        (global as any).__program_opts = options;
        const envConfig = resolveEnvironment(options.env);
        const permissionsCmd = new PermissionsCommand(envConfig.apiUrl);

        console.log(chalk.gray(`Using environment: ${envConfig.name}`));
        await permissionsCmd.push(envConfig.apiUrl, envConfig.apiKey);
      } catch (error) {
        console.error(chalk.red("✗ Error:"));
        console.error(error instanceof Error ? error.message : error);
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

        console.log(chalk.gray(`Using environment: ${envConfig.name}`));
        const isValid = await permissionsCmd.validate();
        process.exit(isValid ? 0 : 1);
      } catch (error) {
        console.error(chalk.red("✗ Error:"));
        console.error(error instanceof Error ? error.message : error);
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

        console.log(chalk.gray(`Using environment: ${envConfig.name}`));
        await permissionsCmd.check(subject, object, relation);
      } catch (error) {
        console.error(chalk.red("✗ Error:"));
        console.error(error instanceof Error ? error.message : error);
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

        console.log(chalk.gray(`Using environment: ${envConfig.name}`));
        await permissionsCmd.set(subject, object, relation);
      } catch (error) {
        console.error(chalk.red("✗ Error:"));
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}
