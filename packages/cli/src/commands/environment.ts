import { Command } from "commander";
import {
  getAvailableEnvironments,
  loadOmnibaseConfig,
  saveOmnibaseConfig,
  loadEnvironment,
} from "../utils/environment";

export function addEnvironmentCommands(program: Command): void {
  const env = program
    .command("env")
    .description("Manage environment configuration");

  env
    .command("set")
    .description("Set the default environment")
    .argument("<environment>", "Environment name (e.g., dev, staging, prod)")
    .action((environment: string) => {
      try {
        const available = getAvailableEnvironments();

        if (!available.includes(environment)) {
          console.error(`❌ Environment '${environment}' not found.`);
          console.log(`Available environments: ${available.join(", ")}`);
          process.exit(1);
        }

        // Test that the environment loads correctly
        loadEnvironment(environment);

        // Save as default
        const config = loadOmnibaseConfig();
        config.defaultEnvironment = environment;
        saveOmnibaseConfig(config);

        console.log(`✅ Default environment set to: ${environment}`);
      } catch (error) {
        console.error(
          "❌ Failed to set environment:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  env
    .command("get")
    .description("Show the current default environment")
    .action(() => {
      try {
        const config = loadOmnibaseConfig();
        const currentEnv = config.defaultEnvironment || "dev";
        console.log(`Current default environment: ${currentEnv}`);
      } catch (error) {
        console.error(
          "❌ Failed to get environment:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });

  env
    .command("list")
    .description("List all available environments")
    .action(() => {
      try {
        const available = getAvailableEnvironments();
        const config = loadOmnibaseConfig();
        const defaultEnv = config.defaultEnvironment || "dev";

        if (available.length === 0) {
          console.log("No environment files found in omnibase/environments/");
          return;
        }

        console.log("Available environments:");
        available.forEach((env) => {
          const isDefault = env === defaultEnv;
          const marker = isDefault ? " (default)" : "";
          console.log(`  • ${env}${marker}`);
        });
      } catch (error) {
        console.error(
          "❌ Failed to list environments:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });
}
