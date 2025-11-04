import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { resolveEnvironment, findOmnibaseRoot } from "../utils/environment";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ConfigHistoryItem {
  id: string;
  config: any;
  version: string;
  created_at: string;
  updated_at: string;
}

interface ConfigHistoryResponse {
  configs: ConfigHistoryItem[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

async function makeApiRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: any,
  envOverride?: string
): Promise<ApiResponse> {
  const envConfig = resolveEnvironment(envOverride);
  const url = `${envConfig.apiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add API key if available
  if (envConfig.apiKey) {
    headers["x-api-key"] = envConfig.apiKey;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

function getStripeConfigPath(): string {
  const projectRoot = findOmnibaseRoot();
  return path.join(projectRoot, "omnibase", "payments");
}

function findConfigFiles(dir: string): string[] {
  const files: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subdirectories
      files.push(...findConfigFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".config.json")) {
      files.push(fullPath);
    }
  }

  return files.sort(); // Deterministic order
}

function mergeConfigs(paymentsDir: string): any {
  const merged = {
    version: "1.0.0",
    meters: [],
    products: [],
  };

  // Recursively find all *.config.json files
  const configFiles = findConfigFiles(paymentsDir);

  for (const file of configFiles) {
    const config = JSON.parse(fs.readFileSync(file, "utf8"));

    // Use version from first config file if available
    if (config.version && merged.version === "1.0.0") {
      merged.version = config.version;
    }

    // Merge meters
    if (config.meters) {
      (merged.meters as any[]).push(...config.meters);
    }

    // Merge products (with price merging support)
    if (config.products) {
      for (const product of config.products) {
        const existing = (merged.products as any[]).find(
          (p: any) => p.id === product.id
        );

        if (existing) {
          // Merge prices into existing product
          existing.prices.push(...product.prices);
        } else {
          // Add new product
          (merged.products as any[]).push(product);
        }
      }
    }
  }

  return merged;
}

function loadStripeConfig(): any {
  const configPath = getStripeConfigPath();

  if (!fs.existsSync(configPath)) {
    throw new Error(`Stripe payments directory not found at: ${configPath}`);
  }

  if (!fs.statSync(configPath).isDirectory()) {
    throw new Error(`Expected directory at: ${configPath}, but found a file`);
  }

  return mergeConfigs(configPath);
}

export function addStripeCommands(program: Command): void {
  const stripe = program
    .command("stripe")
    .description("Manage Stripe configuration");

  // Validate config command
  stripe
    .command("validate")
    .description("Validate the local stripe.config.json file")
    .option("--env <environment>", "Override environment for this command")
    .action(async (options) => {
      try {
        console.log("🔍 Loading stripe.config.json...");
        const config = loadStripeConfig();

        console.log("✅ Successfully loaded config");
        console.log("🚀 Validating with API...");

        const envOverride = options.env || program.opts().env;
        const response = await makeApiRequest(
          "/api/v1/stripe/admin/config/validate",
          "POST",
          config,
          envOverride
        );

        if (response.success) {
          console.log("✅ Configuration is valid!");
        } else {
          console.error("❌ Validation failed:");
          console.error(response.error);
          process.exit(1);
        }
      } catch (error) {
        console.error(
          "❌ Error:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  // Upload config command
  stripe
    .command("push")
    .description("Push the local stripe.config.json to Stripe")
    .option("--env <environment>", "Override environment for this command")
    .action(async (options) => {
      try {
        console.log("🔍 Loading stripe.config.json...");
        const config = loadStripeConfig();

        console.log("✅ Successfully loaded config");
        console.log("🚀 Pushing to Stripe...");

        const envOverride = options.env || program.opts().env;
        const response = await makeApiRequest(
          "/api/v1/stripe/admin/config",
          "POST",
          config,
          envOverride
        );

        if (response.success) {
          console.log("✅ Configuration uploaded successfully!");
          if (response.data?.details) {
            console.log("\n📋 Details:");
            response.data.details.forEach((detail: string) => {
              console.log(`  • ${detail}`);
            });
          }
        } else {
          console.error("❌ Upload failed:");
          console.error(response.error);
          process.exit(1);
        }
      } catch (error) {
        console.error(
          "❌ Error:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  // Get config command
  stripe
    .command("get")
    .description("Get the current Stripe configuration")
    .option("--env <environment>", "Override environment for this command")
    .option("--output <file>", "Save output to file")
    .action(async (options) => {
      try {
        console.log("🔍 Fetching current Stripe configuration...");

        const envOverride = options.env || program.opts().env;
        const response = await makeApiRequest(
          "/api/v1/stripe/config",
          "GET",
          undefined,
          envOverride
        );

        if (response.success) {
          console.log("✅ Configuration retrieved successfully!");

          const configData = {
            id: response.data.id,
            version: response.data.version,
            created_at: response.data.created_at,
            updated_at: response.data.updated_at,
            config: response.data.config,
          };

          if (options.output) {
            fs.writeFileSync(
              options.output,
              JSON.stringify(configData, null, 2)
            );
            console.log(`💾 Configuration saved to: ${options.output}`);
          } else {
            console.log("\n📋 Current Configuration:");
            console.log(JSON.stringify(configData, null, 2));
          }
        } else {
          console.error("❌ Failed to retrieve configuration:");
          console.error(response.error);
          process.exit(1);
        }
      } catch (error) {
        console.error(
          "❌ Error:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  // Get config history command
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
        console.log("🔍 Fetching Stripe configuration history...");

        const envOverride = options.env || program.opts().env;
        const queryParams = new URLSearchParams({
          limit: options.limit,
          offset: options.offset,
        });

        const response = await makeApiRequest(
          `/api/v1/stripe/admin/config/history?${queryParams}`,
          "GET",
          undefined,
          envOverride
        );

        if (response.success) {
          const historyData = response.data as ConfigHistoryResponse;
          console.log("✅ Configuration history retrieved successfully!");

          if (options.output) {
            fs.writeFileSync(
              options.output,
              JSON.stringify(historyData, null, 2)
            );
            console.log(`💾 History saved to: ${options.output}`);
          } else {
            console.log(
              `\n📋 Configuration History (${historyData.pagination.total} total):`
            );
            console.log(
              `📄 Page ${historyData.pagination.page} of ${historyData.pagination.total_pages}`
            );

            historyData.configs.forEach((config, index) => {
              console.log(`\n${index + 1}. Config ID: ${config.id}`);
              console.log(`   Version: ${config.version}`);
              console.log(
                `   Created: ${new Date(config.created_at).toLocaleString()}`
              );
              console.log(
                `   Updated: ${new Date(config.updated_at).toLocaleString()}`
              );
            });

            if (historyData.pagination.has_next) {
              console.log(
                `\n💡 Use --offset ${
                  parseInt(options.offset) + parseInt(options.limit)
                } to see more results`
              );
            }
          }
        } else {
          console.error("❌ Failed to retrieve configuration history:");
          console.error(response.error);
          process.exit(1);
        }
      } catch (error) {
        console.error(
          "❌ Error:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  // Pull config command
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
        console.log("🔍 Pulling configuration from Stripe...");

        const envOverride = options.env || program.opts().env;
        const response = await makeApiRequest(
          "/api/v1/stripe/admin/config/pull",
          "GET",
          undefined,
          envOverride
        );

        if (response.success) {
          console.log("✅ Configuration pulled successfully from Stripe!");

          const projectRoot = findOmnibaseRoot();
          const outputPath =
            options.output ||
            (fs.existsSync(path.join(projectRoot, "omnibase", "payments"))
              ? path.join(
                  projectRoot,
                  "omnibase",
                  "payments",
                  "pulled.config.json"
                )
              : "stripe.config.json");
          const configData = response.data;

          fs.writeFileSync(outputPath, JSON.stringify(configData, null, 2));
          console.log(`💾 Configuration saved to: ${outputPath}`);

          console.log("\n📋 Summary:");
          console.log(`  • Version: ${configData.version}`);
          console.log(`  • Products: ${configData.products?.length || 0}`);
          console.log(`  • Meters: ${configData.meters?.length || 0}`);

          console.log(
            "\n💡 Tip: Review the pulled configuration and commit changes if needed"
          );
        } else {
          console.error("❌ Failed to pull configuration:");
          console.error(response.error);
          process.exit(1);
        }
      } catch (error) {
        console.error(
          "❌ Error:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  // Reset command - Archive all Stripe resources and clear local config
  stripe
    .command("reset")
    .description("Archive all Stripe resources and clear local config")
    .option("--env <environment>", "Override environment for this command")
    .option("-y, --yes", "Skip confirmation prompt")
    .action(async (options) => {
      try {
        if (!options.yes) {
          // Simple confirmation prompt without external dependencies
          const readline = await import("readline");
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const answer = await new Promise<string>((resolve) => {
            rl.question(
              "⚠️  Are you sure you want to archive ALL Stripe resources and clear the local config? This action cannot be undone. (y/N): ",
              resolve
            );
          });

          rl.close();

          if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
            console.log("🚫 Operation cancelled.");
            return;
          }
        }

        console.log(
          "🔄 Archiving all Stripe resources and clearing local config..."
        );

        const envOverride = options.env || program.opts().env;
        const response = await makeApiRequest(
          "/api/v1/stripe/admin/config/archive-all",
          "POST",
          {},
          envOverride
        );

        if (response.success) {
          const data = response.data;

          console.log("✅ Successfully completed Stripe reset!");
          console.log();

          if (data.total_archived > 0) {
            console.log("📊 Summary:");
            console.log(`  • Total archived: ${data.total_archived}`);
            console.log(`  • Total errors: ${data.total_errors}`);
            console.log();

            if (data.archived_items && data.archived_items.length > 0) {
              console.log("✅ Archived items:");
              data.archived_items.forEach((item: string) => {
                console.log(`  • ${item}`);
              });
              console.log();
            }

            if (data.archive_errors && data.archive_errors.length > 0) {
              console.log("❌ Errors:");
              data.archive_errors.forEach((error: string) => {
                console.log(`  • ${error}`);
              });
              console.log();
            }
          } else {
            console.log("ℹ️  No active Stripe resources found to archive.");
          }

          if (data.warning) {
            console.log(`⚠️  ${data.warning}`);
          }

          console.log("✅ Local config has been cleared successfully.");
        } else {
          console.error("❌ Failed to reset Stripe configuration");
          if (response.error) {
            console.error(`Error: ${response.error}`);
          }
          process.exit(1);
        }
      } catch (error) {
        console.error("❌ Error during Stripe reset:");

        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        } else {
          console.error("An unknown error occurred");
        }

        process.exit(1);
      }
    });
}
