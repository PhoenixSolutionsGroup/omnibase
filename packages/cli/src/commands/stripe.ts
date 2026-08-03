import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { config as dotenvConfig } from "dotenv";
import { checkbox } from "@inquirer/prompts";
import {
  selectEnvironment,
  findOmnibaseRoot,
  resolveEnvFilePath,
} from "../utils/environment";
import { createOmnibaseSDKConfig } from "../utils/api-client";
import { logger } from "../utils/logger";
import {
  V1ConfigurationApi,
  V1StripeApi,
  ResponseError,
  type ConfigChanges,
  type Configuration,
  type ListStripeWebhooksRow,
} from "@omnibase/core-js";

async function extractErrorMessage(error: unknown): Promise<string> {
  if (error instanceof ResponseError) {
    try {
      const body = await error.response.json();
      return (
        body.error ||
        body.message ||
        `${error.response.status} - ${error.response.statusText}`
      );
    } catch {
      return `${error.response.status} - ${error.response.statusText}`;
    }
  }
  return error instanceof Error ? error.message : "Unknown error occurred";
}

function getStripeConfigPath(): string {
  const projectRoot = findOmnibaseRoot();
  return path.join(projectRoot, "omnibase", "stripe");
}

function findConfigFiles(dir: string): string[] {
  const files: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findConfigFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".config.json")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

interface WebhookConfig {
  id?: string;
  url: string;
  events: string[];
  connect?: boolean;
}

/**
 * Load raw environment variables from .env file for variable expansion
 */
function loadRawEnv(envName: string): Record<string, string> {
  const envPath = resolveEnvFilePath(envName);

  if (!fs.existsSync(envPath)) {
    return {};
  }

  const result = dotenvConfig({ path: envPath });
  return result.parsed || {};
}

/**
 * Expand ${VAR} patterns in a string using environment variables
 */
function expandEnvVars(str: string, env: Record<string, string>): string {
  return str.replace(/\$\{([^}]+)\}/g, (match, varName) => {
    const value = env[varName];
    if (value === undefined) {
      logger.warn(`Environment variable ${varName} is not defined`);
      return match; // Keep original if not found
    }
    return value;
  });
}

/**
 * Log configuration changes from the API response
 */
async function logConfigChanges(
  changes: ConfigChanges | undefined,
  sdkConfig: Configuration
): Promise<void> {
  if (!changes) return;

  let hasChanges = false;

  // Products
  if (changes.products?.created?.length) {
    hasChanges = true;
    logger.log(`Products created: ${changes.products.created.length}`);
    for (const p of changes.products.created) {
      logger.log(`   - ${p.productName} (${p.productId})`);
    }
  }
  if (changes.products?.updated?.length) {
    hasChanges = true;
    logger.log(`Products updated: ${changes.products.updated.length}`);
    for (const p of changes.products.updated) {
      logger.log(`   - ${p.productName} (${p.productId})`);
    }
  }
  if (changes.products?.archived?.length) {
    hasChanges = true;
    logger.log(`Products archived: ${changes.products.archived.length}`);
    for (const p of changes.products.archived) {
      logger.log(`   - ${p.productName} (${p.productId})`);
    }
  }

  // Prices
  if (changes.prices?.created?.length) {
    hasChanges = true;
    logger.log(`Prices created: ${changes.prices.created.length}`);
    for (const p of changes.prices.created) {
      logger.log(`   - ${p.priceId} (product: ${p.productId})`);
    }
  }
  if (changes.prices?.updated?.length) {
    hasChanges = true;
    logger.log(`Prices updated: ${changes.prices.updated.length}`);
    for (const p of changes.prices.updated) {
      logger.log(`   - ${p.priceId} (product: ${p.productId})`);
    }
  }
  if (changes.prices?.archived?.length) {
    hasChanges = true;
    logger.log(`Prices archived: ${changes.prices.archived.length}`);
    for (const p of changes.prices.archived) {
      logger.log(`   - ${p.priceId} (product: ${p.productId})`);
    }
  }

  // Meters
  if (changes.meters?.created?.length) {
    hasChanges = true;
    logger.log(`Meters created: ${changes.meters.created.length}`);
    for (const m of changes.meters.created) {
      logger.log(`   - ${m.displayName} (${m.meterId})`);
    }
  }
  if (changes.meters?.updated?.length) {
    hasChanges = true;
    logger.log(`Meters updated: ${changes.meters.updated.length}`);
    for (const m of changes.meters.updated) {
      logger.log(`   - ${m.displayName} (${m.meterId})`);
    }
  }
  if (changes.meters?.archived?.length) {
    hasChanges = true;
    logger.log(`Meters archived: ${changes.meters.archived.length}`);
    for (const m of changes.meters.archived) {
      logger.log(`   - ${m.displayName} (${m.meterId})`);
    }
  }

  // Coupons
  if (changes.coupons?.created?.length) {
    hasChanges = true;
    logger.log(`Coupons created: ${changes.coupons.created.length}`);
  }
  if (changes.coupons?.updated?.length) {
    hasChanges = true;
    logger.log(`Coupons updated: ${changes.coupons.updated.length}`);
  }
  if (changes.coupons?.archived?.length) {
    hasChanges = true;
    logger.log(`Coupons archived: ${changes.coupons.archived.length}`);
  }

  // Promotion Codes
  if (changes.promotionCodes?.created?.length) {
    hasChanges = true;
    logger.log(
      `Promotion codes created: ${changes.promotionCodes.created.length}`
    );
  }
  if (changes.promotionCodes?.updated?.length) {
    hasChanges = true;
    logger.log(
      `Promotion codes updated: ${changes.promotionCodes.updated.length}`
    );
  }
  if (changes.promotionCodes?.deactivated?.length) {
    hasChanges = true;
    logger.log(
      `Promotion codes deactivated: ${changes.promotionCodes.deactivated.length}`
    );
  }

  // Webhooks
  if (changes.webhooks?.created?.length) {
    hasChanges = true;
    logger.log(`Webhooks created: ${changes.webhooks.created.length}`);
    for (const w of changes.webhooks.created) {
      logger.log(`   - ${w.url}`);
    }

    // Fetch and display webhook secrets for newly created webhooks
    logger.newline();
    logger.start("Retrieving webhook secrets...");
    try {
      const stripeApi = new V1StripeApi(sdkConfig);
      const secretResponse = await stripeApi.listWebhooks();
      const webhooks = secretResponse.webhooks || [];
      logger.succeed("Webhook secrets retrieved");
      logger.newline();
      logger.warn("IMPORTANT: Save these webhook secrets!");
      for (const webhook of webhooks) {
        logger.log(`  ${webhook.url}:`);
        logger.log(`    STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
      }
    } catch {
      logger.warn(
        "Could not retrieve webhook secrets. Run `omni stripe webhook secret` to get them."
      );
    }
  }
  if (changes.webhooks?.updated?.length) {
    hasChanges = true;
    logger.log(`Webhooks updated: ${changes.webhooks.updated.length}`);
    for (const w of changes.webhooks.updated) {
      logger.log(`   - ${w.url}`);
    }
  }

  if (!hasChanges) {
    logger.log("No changes detected");
  }
}

interface MergedConfig {
  version: string;
  webhooks: WebhookConfig[];
  meters: any[];
  products: any[];
}

function mergeConfigs(paymentsDir: string): MergedConfig {
  const merged: MergedConfig = {
    version: "1.0.0",
    webhooks: [],
    meters: [],
    products: [],
  };

  const configFiles = findConfigFiles(paymentsDir);

  for (const file of configFiles) {
    const config = JSON.parse(fs.readFileSync(file, "utf8"));

    if (config.version && merged.version === "1.0.0") {
      merged.version = config.version;
    }

    // Merge webhooks array
    if (config.webhooks && Array.isArray(config.webhooks)) {
      for (const webhook of config.webhooks) {
        const existing = merged.webhooks.find((w) => w.url === webhook.url);
        if (existing) {
          // Merge events if webhook with same URL already exists
          const existingEvents = new Set(existing.events);
          for (const event of webhook.events) {
            existingEvents.add(event);
          }
          existing.events = Array.from(existingEvents);
        } else {
          merged.webhooks.push({
            id: webhook.id,
            url: webhook.url,
            events: [...webhook.events],
            connect: webhook.connect ?? false,
          });
        }
      }
    }

    if (config.meters) {
      merged.meters.push(...config.meters);
    }

    if (config.products) {
      for (const product of config.products) {
        const existing = merged.products.find((p: any) => p.id === product.id);

        if (existing) {
          existing.prices.push(...product.prices);
        } else {
          merged.products.push(product);
        }
      }
    }
  }

  return merged;
}

function loadStripeConfig(): any {
  const configPath = getStripeConfigPath();

  if (!fs.existsSync(configPath)) {
    throw new Error(`Stripe config directory not found at: ${configPath}`);
  }

  if (!fs.statSync(configPath).isDirectory()) {
    throw new Error(`Expected directory at: ${configPath}, but found a file`);
  }

  return mergeConfigs(configPath);
}

/**
 * Push Stripe configuration to API (exported for sync command)
 */
export async function pushStripeConfig(envOverride?: string): Promise<void> {
  logger.start("Loading stripe.config.json...");
  const config = loadStripeConfig();

  const envConfig = await selectEnvironment(envOverride);
  const rawEnv = loadRawEnv(envConfig.name);
  const sdkConfig = createOmnibaseSDKConfig(envConfig);
  const configApi = new V1ConfigurationApi(sdkConfig);

  // Expand environment variables in webhook URLs before pushing
  if (config.webhooks && Array.isArray(config.webhooks)) {
    config.webhooks = config.webhooks.map((webhook: WebhookConfig) => ({
      ...webhook,
      url: expandEnvVars(webhook.url, rawEnv),
    }));
  }

  logger.succeed("Successfully loaded config");
  logger.start("Pushing to Stripe...");

  try {
    const response = await configApi.updateStripeConfig({
      body: config,
    });

    logger.succeed("Stripe configuration uploaded successfully");
    logger.newline();
    await logConfigChanges(response.changes, sdkConfig);
  } catch (error) {
    throw new Error(
      `Stripe upload failed: ${await extractErrorMessage(error)}`
    );
  }
}

export function addStripeCommands(program: Command): void {
  const stripe = program
    .command("stripe")
    .description("Manage Stripe configuration");

  stripe
    .command("validate")
    .description("Validate the local stripe.config.json file")
    .option("--env <environment>", "Override environment for this command")
    .action(async (options) => {
      try {
        logger.start("Loading stripe.config.json...");
        const config = loadStripeConfig();

        logger.succeed("Successfully loaded config");
        logger.start("Validating with API...");

        const envOverride = options.env || program.opts().env;
        const envConfig = await selectEnvironment(envOverride);
        const sdkConfig = createOmnibaseSDKConfig(envConfig);
        const configApi = new V1ConfigurationApi(sdkConfig);

        await configApi.validateStripeConfig({
          body: config,
        });

        logger.succeed("Configuration is valid!");
      } catch (error) {
        const errorMsg = await extractErrorMessage(error);
        logger.fail(`Validation failed: ${errorMsg}`);
        process.exit(1);
      }
    });

  stripe
    .command("push")
    .description("Push the local config to Stripe")
    .option("--env <environment>", "Override environment for this command")
    .action(async (options) => {
      try {
        logger.start("Loading stripe.config.json...");
        const config = loadStripeConfig();

        const envOverride = options.env || program.opts().env;
        const envConfig = await selectEnvironment(envOverride);
        const rawEnv = loadRawEnv(envConfig.name);
        const sdkConfig = createOmnibaseSDKConfig(envConfig);
        const configApi = new V1ConfigurationApi(sdkConfig);

        // Expand environment variables in webhook URLs before pushing
        if (config.webhooks && Array.isArray(config.webhooks)) {
          config.webhooks = config.webhooks.map((webhook: WebhookConfig) => ({
            ...webhook,
            url: expandEnvVars(webhook.url, rawEnv),
          }));
        }

        logger.succeed("Successfully loaded config");
        logger.start("Pushing configuration to Stripe...");

        try {
          const response = await configApi.updateStripeConfig({
            body: config,
          });

          logger.succeed("Configuration uploaded successfully!");
          logger.newline();
          await logConfigChanges(response.changes, sdkConfig);
        } catch (error) {
          const errorMsg = await extractErrorMessage(error);
          logger.fail(`Upload failed: ${errorMsg}`);
          process.exit(1);
        }
      } catch (error) {
        logger.fail(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  stripe
    .command("get")
    .description("Get the current Stripe configuration")
    .option("--env <environment>", "Override environment for this command")
    .option("--output <file>", "Save output to file")
    .action(async (options) => {
      try {
        logger.start("Fetching current Stripe configuration...");

        const envOverride = options.env || program.opts().env;
        const envConfig = await selectEnvironment(envOverride);
        const sdkConfig = createOmnibaseSDKConfig(envConfig);
        const stripeApi = new V1StripeApi(sdkConfig);

        const response = await stripeApi.getStripeConfig();
        logger.succeed("Configuration retrieved successfully!");

        const configData = {
          id: response.id,
          version: response.version,
          created_at: response.createdAt,
          updated_at: response.updatedAt,
          config: response.config,
        };

        if (options.output) {
          fs.writeFileSync(options.output, JSON.stringify(configData, null, 2));
          logger.log(`Configuration saved to: ${options.output}`);
        } else {
          logger.newline();
          logger.log("Current Configuration:");
          logger.log(JSON.stringify(configData, null, 2));
        }
      } catch (error) {
        const errorMsg = await extractErrorMessage(error);
        logger.fail(`Failed to retrieve configuration: ${errorMsg}`);
        process.exit(1);
      }
    });

  stripe
    .command("history")
    .description("Get the Stripe configuration history")
    .option("--env <environment>", "Override environment for this command")
    .option(
      "--limit <number>",
      "Number of records to fetch (default: 10)",
      "10"
    )
    .option("--offset <number>", "Number of records to skip (default: 0)", "0")
    .option("--output <file>", "Save output to file")
    .action(async (options) => {
      try {
        logger.start("Fetching Stripe configuration history...");

        const envOverride = options.env || program.opts().env;
        const envConfig = await selectEnvironment(envOverride);
        const sdkConfig = createOmnibaseSDKConfig(envConfig);
        const configApi = new V1ConfigurationApi(sdkConfig);

        const response = await configApi.getStripeConfigHistory({
          limit: parseInt(options.limit),
          offset: parseInt(options.offset),
        });

        logger.succeed("Configuration history retrieved successfully!");
        const historyData = response;

        if (options.output) {
          fs.writeFileSync(
            options.output,
            JSON.stringify(historyData, null, 2)
          );
          logger.log(`History saved to: ${options.output}`);
        } else {
          logger.newline();
          logger.log(
            `Configuration History (${historyData?.pagination?.total || 0} total):`
          );
          logger.log(
            `Page ${historyData?.pagination?.page || 1} of ${historyData?.pagination?.totalPages || 1}`
          );

          historyData?.configs?.forEach((config, index) => {
            logger.newline();
            logger.log(`${index + 1}. Config ID: ${config.id}`);
            logger.log(`   Version: ${config.version}`);
            logger.log(
              `   Created: ${new Date(config.createdAt || "").toLocaleString()}`
            );
            logger.log(
              `   Updated: ${new Date(config.updatedAt || "").toLocaleString()}`
            );
          });

          if (historyData?.pagination?.hasNext) {
            logger.newline();
            logger.log(
              `Tip: Use --offset ${
                parseInt(options.offset) + parseInt(options.limit)
              } to see more results`
            );
          }
        }
      } catch (error) {
        const errorMsg = await extractErrorMessage(error);
        logger.fail(`Failed to retrieve configuration history: ${errorMsg}`);
        process.exit(1);
      }
    });

  stripe
    .command("pull")
    .description("Pull the current Stripe configuration from Stripe API")
    .option("--env <environment>", "Override environment for this command")
    .option(
      "--output <file>",
      "Save output to file (default: stripe.config.json)"
    )
    .action(async (options) => {
      try {
        logger.start("Pulling configuration from Stripe...");

        const envOverride = options.env || program.opts().env;
        const envConfig = await selectEnvironment(envOverride);
        const sdkConfig = createOmnibaseSDKConfig(envConfig);
        const configApi = new V1ConfigurationApi(sdkConfig);

        const response = await configApi.pullStripeConfig();
        logger.succeed("Configuration pulled successfully from Stripe!");

        const projectRoot = findOmnibaseRoot();
        const outputPath =
          options.output ||
          (fs.existsSync(path.join(projectRoot, "omnibase", "stripe"))
            ? path.join(projectRoot, "omnibase", "stripe", "pulled.config.json")
            : "stripe.config.json");
        const configData = response;

        fs.writeFileSync(outputPath, JSON.stringify(configData, null, 2));
        logger.log(`Configuration saved to: ${outputPath}`);

        logger.newline();
        logger.log("Summary:");
        logger.log(`  Version: ${configData?.version}`);
        logger.log(`  Webhooks: ${configData?.webhooks?.length || 0}`);
        logger.log(`  Products: ${configData?.products?.length || 0}`);
        logger.log(`  Meters: ${configData?.meters?.length || 0}`);

        logger.newline();
        logger.log(
          "Tip: Review the pulled configuration and commit changes if needed"
        );
      } catch (error) {
        const errorMsg = await extractErrorMessage(error);
        logger.fail(`Failed to pull configuration: ${errorMsg}`);
        process.exit(1);
      }
    });

  // Webhook subcommand group
  const webhook = stripe
    .command("webhook")
    .description("Manage Stripe webhook configuration");

  webhook
    .command("secret")
    .description("Retrieve webhook signing secrets")
    .option("--env <environment>", "Override environment for this command")
    .action(async (options) => {
      try {
        logger.start("Retrieving webhooks...");

        const envOverride = options.env || program.opts().env;
        const envConfig = await selectEnvironment(envOverride);
        const sdkConfig = createOmnibaseSDKConfig(envConfig);
        const stripeApi = new V1StripeApi(sdkConfig);

        const response = await stripeApi.listWebhooks();
        const webhooks = response.webhooks || [];

        logger.succeed("Webhooks retrieved successfully!");

        if (webhooks.length === 0) {
          logger.newline();
          logger.warn("No webhooks configured.");
          logger.log(
            "Configure webhooks in your stripe.config.json and run `omni stripe push`"
          );
          return;
        }

        let selectedWebhooks: ListStripeWebhooksRow[];

        if (webhooks.length === 1) {
          // Single webhook - display directly
          selectedWebhooks = webhooks;
        } else {
          // Multiple webhooks - interactive selection
          logger.newline();
          const choices = webhooks.map((w) => ({
            name: `${w.url} (${w.connect ? "connect" : "account"})`,
            value: w,
            checked: true,
          }));

          selectedWebhooks = await checkbox({
            message: "Select webhooks to display:",
            choices,
          });

          if (selectedWebhooks.length === 0) {
            logger.warn("No webhooks selected");
            return;
          }
        }

        // Display selected webhooks
        for (const webhook of selectedWebhooks) {
          logger.newline();
          logger.log("─".repeat(60));
          logger.log(`URL: ${webhook.url}`);
          logger.log(`Stripe ID: ${webhook.stripeId}`);
          logger.log(`Connect: ${webhook.connect ? "Yes" : "No"}`);
          logger.log(`Events: ${webhook.events?.join(", ") || "none"}`);
          logger.log(`Secret: ${webhook.secret}`);
          logger.newline();
          logger.log("Environment variable:");
          logger.log(`  STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("User force closed")
        ) {
          logger.warn("Selection cancelled");
          return;
        }
        const errorMsg = await extractErrorMessage(error);
        logger.fail(`Failed to retrieve webhooks: ${errorMsg}`);
        process.exit(1);
      }
    });

  stripe
    .command("reset")
    .description("Archive all Stripe resources and clear local config")
    .option("--env <environment>", "Override environment for this command")
    .option("-y, --yes", "Skip confirmation prompt")
    .action(async (options) => {
      try {
        if (!options.yes) {
          const readline = await import("readline");
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const answer = await new Promise<string>((resolve) => {
            rl.question(
              "Are you sure you want to archive ALL Stripe resources and clear the local config? This action cannot be undone. (y/N): ",
              resolve
            );
          });

          rl.close();

          if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
            logger.warn("Operation cancelled.");
            return;
          }
        }

        logger.start(
          "Archiving all Stripe resources and clearing local config..."
        );

        const envOverride = options.env || program.opts().env;
        const envConfig = await selectEnvironment(envOverride);
        const sdkConfig = createOmnibaseSDKConfig(envConfig);
        const configApi = new V1ConfigurationApi(sdkConfig);

        const response = await configApi.archiveAllStripeConfig();
        const data = response;

        logger.succeed("Successfully completed Stripe reset!");
        logger.newline();

        if (data?.totalArchived && data.totalArchived > 0) {
          logger.log("Summary:");
          logger.log(`  Total archived: ${data.totalArchived}`);
          logger.log(`  Total errors: ${data.totalErrors || 0}`);
          logger.newline();

          if (data.archivedItems && data.archivedItems.length > 0) {
            logger.log("Archived items:");
            data.archivedItems.forEach((item) => {
              logger.log(`  - ${item}`);
            });
            logger.newline();
          }

          if (data.archiveErrors && data.archiveErrors.length > 0) {
            logger.log("Errors:");
            data.archiveErrors.forEach((error) => {
              logger.log(`  - ${error}`);
            });
            logger.newline();
          }
        } else {
          logger.info("No active Stripe resources found to archive.");
        }

        if (data?.warning) {
          logger.warn(data.warning);
        }

        logger.succeed("Local config has been cleared successfully.");
      } catch (error) {
        const errorMsg = await extractErrorMessage(error);
        logger.fail(`Failed to reset Stripe configuration: ${errorMsg}`);
        process.exit(1);
      }
    });
}
