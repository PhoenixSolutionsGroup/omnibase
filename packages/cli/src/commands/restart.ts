import { Command } from "commander";
import { checkbox } from "@inquirer/prompts";
import { EnvironmentConfig } from "../utils/environment";
import { getCommandContextWithEnv } from "../utils/context";
import { createManagedHostingClient } from "../utils/api-client";
import { logger } from "../utils/logger";
import { formatHttpError, handleCommandError } from "../utils/errors";
import { restartDockerService } from "../utils/docker";

interface RestartableService {
  name: string;
  label: string;
  description: string;
  localDockerService: string;
  cloudServiceTypes: string[];
  localOnly?: boolean;
}

const SERVICES: RestartableService[] = [
  {
    name: "api",
    label: "API",
    description: "Main OmniBase REST API",
    localDockerService: "rest-api",
    cloudServiceTypes: ["api"],
  },
  {
    name: "auth",
    label: "Auth",
    description: "Omnibase Auth Service",
    localDockerService: "auth",
    cloudServiceTypes: ["auth-pub", "auth-adm"],
  },
  {
    name: "permissions",
    label: "Permissions",
    description: "Ory Keto permissions service",
    localDockerService: "permissions",
    cloudServiceTypes: ["perm-read", "perm-write"],
  },
  {
    name: "postgrest",
    label: "PostgREST",
    description: "Auto-generated REST API from schema",
    localDockerService: "postgrest",
    cloudServiceTypes: ["postgrest"],
  },
  {
    name: "postgres",
    label: "PostgreSQL",
    description: "Database server (local)",
    localDockerService: "postgres",
    cloudServiceTypes: [],
    localOnly: true,
  },
  {
    name: "mailpit",
    label: "Mailpit",
    description: "Email SMTP server (local)",
    localDockerService: "mailpit",
    cloudServiceTypes: [],
    localOnly: true,
  },
  {
    name: "minio",
    label: "MinIO",
    description: "Object storage server (local)",
    localDockerService: "minio",
    cloudServiceTypes: [],
    localOnly: true,
  },
];

async function restartLocalService(
  dockerService: string,
  env: EnvironmentConfig,
  mode: string
): Promise<boolean> {
  try {
    await restartDockerService(dockerService, { mode, envConfig: env });
    return true;
  } catch (error: any) {
    const message = error.message || "Unknown error";
    logger.warn(`   ${message}`);
    return false;
  }
}

async function restartCloudService(
  env: EnvironmentConfig,
  serviceTypes: string[]
): Promise<boolean> {
  if (!env.projectId) {
    throw new Error("OMNIBASE_PROJECT_ID required for cloud restarts");
  }

  const apiClient = createManagedHostingClient(env);

  try {
    await Promise.all(
      serviceTypes.map((type) =>
        apiClient.post(
          `/api/v1/projects/${env.projectId}/services/${type}/restart`
        )
      )
    );
    return true;
  } catch (error) {
    logger.warn(`Failed to restart: ${formatHttpError(error)}`);
    return false;
  }
}

async function runRestart(
  services: string[],
  env: EnvironmentConfig,
  mode: string
): Promise<void> {
  const isLocal = env.name === "local";

  const servicesToRestart = services
    .map((name) => SERVICES.find((s) => s.name === name))
    .filter((service): service is RestartableService => {
      if (!service) return false;
      if (!isLocal && service.localOnly) {
        logger.warn(`${service.label} is only available locally, skipping`);
        return false;
      }
      return true;
    });

  if (servicesToRestart.length === 0) {
    logger.warn("No services to restart");
    return;
  }

  logger.info(`Restarting ${servicesToRestart.length} service(s) concurrently...`);

  const restartPromises = servicesToRestart.map(async (service) => {
    const success = isLocal
      ? await restartLocalService(service.localDockerService, env, mode)
      : await restartCloudService(env, service.cloudServiceTypes);
    return { service, success };
  });

  const settledResults = await Promise.allSettled(restartPromises);

  const results = settledResults.map((result, index) => {
    const service = servicesToRestart[index];
    if (result.status === "fulfilled") {
      return { service: service.name, label: service.label, success: result.value.success };
    }
    return { service: service.name, label: service.label, success: false };
  });

  // Log individual results
  for (const result of results) {
    if (result.success) {
      logger.succeed(`${result.label} restarted`);
    } else {
      logger.fail(`${result.label} restart failed`);
    }
  }

  // Summary
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  logger.newline();
  if (successful.length > 0) {
    logger.succeed(`${successful.length} service(s) restarted`);
  }
  if (failed.length > 0) {
    logger.fail(`${failed.length} service(s) failed`);
    process.exit(1);
  }
}

export function addRestartCommands(program: Command): void {
  program
    .command("restart [services...]")
    .description("Restart services (interactive if none specified)")
    .option("--all", "Restart all services")
    .action(async (services: string[], options) => {
      try {
        const ctx = await getCommandContextWithEnv(program);
        const isLocal = ctx.env.name === "local";

        logger.info(`Using environment: ${ctx.env.name}`);

        // Filter services based on environment
        const availableServices = SERVICES.filter(
          (s) => isLocal || !s.localOnly
        );

        let selectedServices: string[];

        if (options.all) {
          selectedServices = availableServices.map((s) => s.name);
        } else if (services.length === 0) {
          // Interactive mode
          const choices = availableServices.map((s) => ({
            name: `${s.label} - ${s.description}`,
            value: s.name,
          }));

          selectedServices = await checkbox({
            message: "Select services to restart:",
            choices,
          });

          if (selectedServices.length === 0) {
            logger.warn("No services selected");
            return;
          }
        } else {
          // Validate provided services
          const validNames = availableServices.map((s) => s.name);
          const invalid = services.filter((s) => !validNames.includes(s));

          if (invalid.length > 0) {
            logger.fail(`Unknown service(s): ${invalid.join(", ")}`);
            logger.log(`Available: ${validNames.join(", ")}`);
            process.exit(1);
          }

          selectedServices = services;
        }

        await runRestart(selectedServices, ctx.env, ctx.mode);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("User force closed")
        ) {
          logger.warn("Restart cancelled");
          return;
        }
        handleCommandError(error);
      }
    });
}
