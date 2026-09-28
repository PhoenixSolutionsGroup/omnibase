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
  EnvironmentConfig,
} from "../utils/environment";
import { V1ConfigurationApi } from "@omnibase/core-js";
import {
  createManagedHostingClient,
  createOmnibaseSDKConfig,
} from "../utils/api-client";
import { logger } from "../utils/logger";
import { extractApiError, formatHttpError } from "../utils/errors";
import { getCommandContextWithEnv } from "../utils/context";
import { runDockerComposeCommand } from "../utils/docker";

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

    try {
      const sdkConfig = createOmnibaseSDKConfig(env);
      const configApi = new V1ConfigurationApi(sdkConfig);

      const result = await configApi.deployPermissionNamespaces({
        namespaces: new Blob([zipBuffer], { type: "application/zip" }),
      });

      logger.succeed("Namespaces deployed successfully");

      if (result.rolesSynced) {
        logger.log(
          `   Synced ${result.rolesSynced} system role(s) to database`
        );
      }

      if (result.managedMode) {
        logger.log("   Managed hosting service is restarting...");

        const apiClient = createManagedHostingClient(env);
        try {
          await Promise.all([
            apiClient.post(
              `/api/v1/projects/${env.branchId}/services/perm-read/restart`
            ),
            apiClient.post(
              `/api/v1/projects/${env.branchId}/services/perm-write/restart`
            ),
          ]);
        } catch (error) {
          logger.warn(`Failed to restart services: ${formatHttpError(error)}`);
        }

        logger.log("   Permissions will load new namespaces automatically");
      } else {
        logger.log("   Restarting permissions service...");
        try {
          const localEnvConfig = await selectEnvironment("local");
          runDockerComposeCommand("restart", ["permissions"], {
            mode,
            envConfig: localEnvConfig,
            stdio: "ignore",
          });
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
      logger.fail(`Failed to deploy namespaces: ${await extractApiError(error)}`);
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
    .summary("Manage Ory Keto permissions")
    .description(
      "Manage the Ory Keto permission namespaces and relationships.\n\n" +
      "`push` deploys the namespace files in `omnibase/permissions/` to the " +
      "API, `validate` checks their TypeScript syntax locally, `check` asks " +
      "whether a subject has a permission, and `set` grants one."
    );

  permissions
    .command("push")
    .summary("Deploy namespace files to the API")
    .description(
      "Deploy the permission namespace files in `omnibase/permissions/` to " +
      "the selected environment's API.\n\n" +
      "All `*.ts` namespace files (except `types.ts`) are merged into a " +
      "single bundle — imports and `export class` prefixes are stripped — " +
      "and uploaded alongside `roles.config.json` if present. The API " +
      "deploys the namespaces and syncs any system roles.\n\n" +
      "After a successful deploy the permissions services are restarted: " +
      "locally via `docker compose restart permissions`, or in managed mode " +
      "via the managed-hosting restart endpoints.\n\n" +
      "Before: `omnibase/permissions/` must exist with at least one namespace " +
      "file, and a running API is required.\n\n" +
      "```bash\n" +
      "omnibase permissions push\n" +
      "omnibase permissions push --env dev\n" +
      "```"
    )
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
    .summary("Validate namespace TypeScript syntax")
    .description(
      "Type-check every namespace file in `omnibase/permissions/` locally by " +
      "running `bun build --no-bundle --target=node` on each.\n\n" +
      "No changes are sent to the API. Exits non-zero if any file has syntax " +
      "errors. Use this before `push`.\n\n" +
      "```bash\n" +
      "omnibase permissions validate\n" +
      "```"
    )
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
    .summary("Check if a subject has permission")
    .description(
      "Check whether a subject holds a relation on an object in the " +
      "permission system, reporting GRANTED or DENIED.\n\n" +
      "`<subject>` and `<object>` may be `namespace:id` pairs or bare ids — a " +
      "bare subject defaults to the `User` namespace and a bare object to the " +
      "`Tenant` namespace.\n\n" +
      "```bash\n" +
      "omnibase permissions check user:123 tenant:456 view\n" +
      "omnibase permissions check 123 456 invite\n" +
      "omnibase permissions check 123 456 delete --env dev\n" +
      "```"
    )
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
    .summary("Grant a permission relation")
    .description(
      "Create a relationship granting a subject a relation on an object.\n\n" +
      "As with `check`, `<subject>` and `<object>` accept `namespace:id` " +
      "pairs or bare ids defaulting to the `User` and `Tenant` namespaces.\n\n" +
      "```bash\n" +
      "omnibase permissions set user:123 tenant:456 owners\n" +
      "omnibase permissions set 123 456 can_invite\n" +
      "omnibase permissions set user:123 tenant:456 admins --env dev\n" +
      "```"
    )
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
