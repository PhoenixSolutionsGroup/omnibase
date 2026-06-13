import { Command } from "commander";
import { checkbox } from "@inquirer/prompts";
import { logger } from "../utils/logger";
import { getCommandContextWithEnv } from "../utils/context";
import { pushPermissions } from "./permissions";
import { pushEmailTemplates } from "./email";
import { pushStripeConfig } from "./stripe";
import { pushEnvConfig } from "./cloud";
import { DatabaseMigrationService } from "../services/db/migrate";
import { selectEnvironment } from "../utils/environment";

interface SyncService {
  name: string;
  label: string;
  description: string;
  push: (envOverride?: string, mode?: string) => Promise<void>;
  cloudOnly?: boolean;
}

const SERVICES: SyncService[] = [
  {
    name: "permissions",
    label: "Permissions",
    description: "Ory Keto namespace files",
    push: pushPermissions,
  },
  {
    name: "db",
    label: "Database",
    description: "SQL migration files",
    push: async (env) =>
      new DatabaseMigrationService().push(
        "omnibase/db/migrations",
        await selectEnvironment(env),
      ),
  },
  {
    name: "email",
    label: "Email",
    description: "HTML email templates",
    push: pushEmailTemplates,
  },
  {
    name: "stripe",
    label: "Stripe",
    description: "Stripe product/price configuration",
    push: pushStripeConfig,
  },
  {
    name: "env",
    label: "Environment",
    description: "Environment configuration (cloud only)",
    push: pushEnvConfig,
    cloudOnly: true,
  },
];

async function runSync(
  services: string[],
  envOverride?: string,
  mode?: string,
): Promise<void> {
  const results: { service: string; success: boolean; error?: string }[] = [];

  for (const serviceName of services) {
    const service = SERVICES.find((s) => s.name === serviceName);
    if (!service) {
      logger.warn(`Unknown service: ${serviceName}`);
      continue;
    }

    logger.newline();
    logger.info(`Syncing ${service.label}...`);

    try {
      await service.push(envOverride, mode);
      results.push({ service: service.name, success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      results.push({
        service: service.name,
        success: false,
        error: errorMessage,
      });
      logger.fail(`${service.label} sync failed: ${errorMessage}`);
    }
  }

  // Summary
  logger.newline();
  logger.log("Sync Summary:");
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (successful.length > 0) {
    logger.succeed(`${successful.length} service(s) synced successfully`);
    successful.forEach((r) => logger.log(`   - ${r.service}`));
  }

  if (failed.length > 0) {
    logger.fail(`${failed.length} service(s) failed`);
    failed.forEach((r) => logger.log(`   - ${r.service}: ${r.error}`));
    process.exit(1);
  }
}

export function addSyncCommands(program: Command): void {
  program
    .command("sync [services...]")
    .description("Sync local configuration to remote environment")
    .action(async (services: string[]) => {
      try {
        const ctx = await getCommandContextWithEnv(program);
        logger.info(`Using environment: ${ctx.env.name}`);

        const isLocal = ctx.env.name === "local";

        // Filter services based on environment
        const availableServices = SERVICES.filter(
          (s) => !s.cloudOnly || !isLocal,
        );

        let selectedServices: string[];

        if (services.length === 0) {
          // Interactive mode
          const choices = availableServices.map((s) => ({
            name: `${s.label} - ${s.description}`,
            value: s.name,
            checked: true,
          }));

          selectedServices = await checkbox({
            message: "Select services to sync:",
            choices,
          });

          if (selectedServices.length === 0) {
            logger.warn("No services selected");
            return;
          }
        } else if (services.includes("all")) {
          // All services (filtered by environment)
          selectedServices = availableServices.map((s) => s.name);
        } else {
          // Specific services
          selectedServices = services;

          // Validate service names
          const validNames = availableServices.map((s) => s.name);
          const invalid = selectedServices.filter(
            (s) => !validNames.includes(s),
          );
          if (invalid.length > 0) {
            // Check if they're trying to use cloud-only services locally
            const cloudOnlyAttempts = invalid.filter((s) =>
              SERVICES.find((svc) => svc.name === s && svc.cloudOnly),
            );
            if (cloudOnlyAttempts.length > 0 && isLocal) {
              logger.fail(
                `Service(s) not available for local environment: ${cloudOnlyAttempts.join(", ")}`,
              );
              logger.log("Use --env flag to specify a cloud environment");
            } else {
              logger.fail(`Unknown service(s): ${invalid.join(", ")}`);
              logger.log(`Available: ${validNames.join(", ")}`);
            }
            process.exit(1);
          }
        }

        await runSync(selectedServices, ctx.env.name, ctx.mode);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("User force closed")
        ) {
          logger.warn("Sync cancelled");
          return;
        }
        logger.fail(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
