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
  selectEnvironment,
  findOmnibaseRoot,
  getProjectName,
  EnvironmentConfig,
} from "../utils/environment";
import {
  createManagedHostingClient,
  createOmnibaseClient,
} from "../utils/api-client";
import { logger } from "../utils/logger";
import { formatHttpError } from "../utils/errors";
import { getCommandContextWithEnv } from "../utils/context";

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

  private getEnvFilePath(envName: string): string {
    const projectRoot = findOmnibaseRoot();
    return path.join(
      projectRoot,
      "omnibase",
      "environments",
      `.env.${envName}`
    );
  }

  async push(env: EnvironmentConfig, mode?: string): Promise<void> {
    logger.start("Pushing permissions...");

    const permissionsDir = path.join(process.cwd(), "omnibase", "permissions");

    if (!fs.existsSync(permissionsDir)) {
      logger.fail("Permissions directory not found: omnibase/permissions/");
      process.exit(1);
    }

    const files = fs
      .readdirSync(permissionsDir)
      .filter((file) => file.endsWith(".ts") && file !== "types.ts");

    if (files.length === 0) {
      logger.warn("No namespace files found");
      return;
    }

    let mergedContent = "";

    files.forEach((file) => {
      const content = fs.readFileSync(path.join(permissionsDir, file), "utf-8");
      const withoutImports = content
        .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "")
        .replace(/^export\s+(class\s+)/gm, "$1")
        .replace(/\r\n/g, "\n");

      mergedContent += withoutImports + "\n\n";
    });

    const rolesConfigPath = path.join(permissionsDir, "roles.config.json");
    const hasRolesConfig = fs.existsSync(rolesConfigPath);

    if (hasRolesConfig) {
      logger.log("   Found roles.config.json");
    }

    const JSZip = require("jszip");
    const zip = new JSZip();

    const timestamp = new Date().toISOString();
    zip.file(`${timestamp}-permissions.ts`, mergedContent, {
      binary: false,
      createFolders: false,
      unixPermissions: 0o644,
    });

    if (hasRolesConfig) {
      const rolesConfigContent = fs.readFileSync(rolesConfigPath, "utf-8");
      zip.file("roles.config.json", rolesConfigContent, {
        binary: false,
        createFolders: false,
        unixPermissions: 0o644,
      });
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
      platform: "UNIX",
    });

    logger.update(`Uploading to ${env.omnibaseApiUrl}...`);

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

      if (env.omnibaseServiceKey) {
        headers["X-Service-Key"] = env.omnibaseServiceKey;
      }

      const response = await axios.post(
        `${env.omnibaseApiUrl}/api/v1/permissions/namespaces`,
        formData,
        { headers }
      );

      const result = response.data.data;

      logger.succeed("Namespaces deployed successfully");

      if (result.roles_synced) {
        logger.log(
          `   Synced ${result.roles_synced} system role(s) to database`
        );
      }

      if (result.managed_mode) {
        logger.log("   Managed hosting service is restarting...");

        const apiClient = createManagedHostingClient(env);
        try {
          await Promise.all([
            apiClient.post(
              `/api/v1/projects/${env.projectId}/services/perm-read/restart`
            ),
            apiClient.post(
              `/api/v1/projects/${env.projectId}/services/perm-write/restart`
            ),
          ]);
        } catch (error) {
          logger.warn(`Failed to restart services: ${formatHttpError(error)}`);
        }

        logger.log("   Permissions will load new namespaces automatically");
      } else {
        logger.log("   Restarting permissions service...");
        try {
          const projectRoot = findOmnibaseRoot();
          const projectName = getProjectName();
          const composeMode = mode || "default";
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

          const envConfig = await selectEnvironment("local");
          const envFilePath = this.getEnvFilePath(envConfig.name);
          const envVars = { ...process.env, OMNIBASE_ENV_FILE: envFilePath };

          execSync(
            `docker compose --project-name ${projectName} -f ${dockerComposePath} restart permissions`,
            { stdio: "ignore", cwd: projectRoot, env: envVars }
          );
          logger.log("   Permissions restarted successfully");
        } catch (error) {
          logger.warn("Failed to restart permissions automatically");
          logger.log(
            "   Please run manually: docker compose restart permissions"
          );
        }
      }

      logger.newline();
      logger.succeed("Permissions pushed successfully");
    } catch (error) {
      logger.fail(`Failed to deploy namespaces: ${formatHttpError(error)}`);
      process.exit(1);
    }
  }

  async validate(): Promise<boolean> {
    logger.start("Validating namespace files...");

    const permissionsDir = path.join(process.cwd(), "omnibase", "permissions");

    if (!fs.existsSync(permissionsDir)) {
      logger.fail("Permissions directory not found: omnibase/permissions/");
      return false;
    }

    const files = fs
      .readdirSync(permissionsDir)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => path.join(permissionsDir, file));

    if (files.length === 0) {
      logger.warn("No TypeScript namespace files found");
      return true;
    }

    logger.log(`   Validating ${files.length} file(s)...`);

    try {
      for (const file of files) {
        logger.log(`   Checking ${path.basename(file)}...`);
        try {
          execSync(`bun build ${file} --no-bundle --target=node`, {
            stdio: "pipe",
            cwd: process.cwd(),
          });
        } catch (error) {
          logger.fail(`Syntax error in ${path.basename(file)}`);
          logger.log(error instanceof Error ? error.message : String(error));
          return false;
        }
      }

      logger.succeed("All namespace files are valid");
      return true;
    } catch (error) {
      logger.fail("Validation failed - TypeScript syntax errors found");
      return false;
    }
  }

  async check(
    subject: string,
    object: string,
    relation: string
  ): Promise<void> {
    logger.start(`Checking permission: ${subject} -> ${object}#${relation}`);

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
        logger.succeed("Permission GRANTED");
      } else {
        logger.fail("Permission DENIED");
      }
    } catch (error: any) {
      logger.fail(`Failed to check permission: ${formatHttpError(error)}`);
    }
  }

  async set(subject: string, object: string, relation: string): Promise<void> {
    logger.start(`Setting permission: ${subject} -> ${object}#${relation}`);

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
      logger.succeed("Permission set successfully");
      logger.log(
        `   Created relationship: ${response.data.namespace}:${response.data.object}#${response.data.relation}@${response.data.subject_id}`
      );
    } catch (error: any) {
      logger.fail(`Failed to set permission: ${formatHttpError(error)}`);
    }
  }
}

/**
 * Push permissions (exported for sync command)
 */
export async function pushPermissions(
  envOverride?: string,
  mode?: string
): Promise<void> {
  const envConfig = await selectEnvironment(envOverride);
  const permissionsCmd = new PermissionsCommand(envConfig.omnibaseApiUrl);
  await permissionsCmd.push(envConfig, mode);
}

export function addPermissionsCommands(program: Command): void {
  const permissions = program
    .command("permissions")
    .description("Manage Ory Keto permissions");

  permissions
    .command("push")
    .description("Deploy namespace files to API")
    .action(async () => {
      try {
        const ctx = await getCommandContextWithEnv(program);
        const permissionsCmd = new PermissionsCommand(ctx.env.omnibaseApiUrl);

        logger.info(`Using environment: ${ctx.env.name}`);
        await permissionsCmd.push(ctx.env, ctx.mode);
      } catch (error) {
        logger.fail(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  permissions
    .command("validate")
    .description("Validate TypeScript namespace syntax")
    .action(async () => {
      try {
        const ctx = await getCommandContextWithEnv(program);
        const permissionsCmd = new PermissionsCommand(ctx.env.omnibaseApiUrl);

        logger.info(`Using environment: ${ctx.env.name}`);
        const isValid = await permissionsCmd.validate();
        process.exit(isValid ? 0 : 1);
      } catch (error) {
        logger.fail(error instanceof Error ? error.message : String(error));
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
        const ctx = await getCommandContextWithEnv(program);
        const permissionsCmd = new PermissionsCommand(ctx.env.omnibaseApiUrl);

        logger.info(`Using environment: ${ctx.env.name}`);
        await permissionsCmd.check(subject, object, relation);
      } catch (error) {
        logger.fail(error instanceof Error ? error.message : String(error));
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
        const ctx = await getCommandContextWithEnv(program);
        const permissionsCmd = new PermissionsCommand(ctx.env.omnibaseApiUrl);

        logger.info(`Using environment: ${ctx.env.name}`);
        await permissionsCmd.set(subject, object, relation);
      } catch (error) {
        logger.fail(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
