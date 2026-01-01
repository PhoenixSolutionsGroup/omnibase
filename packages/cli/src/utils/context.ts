import { Command } from "commander";
import { selectEnvironment, EnvironmentConfig } from "./environment";

export interface CommandContext {
  environment: string;
  mode: "dev" | "default";
}

export interface CommandContextWithEnv {
  env: EnvironmentConfig;
  mode: "dev" | "default";
}

/**
 * Get command context with raw flag values
 * Use this for local-only commands (start, stop)
 */
export function getCommandContext(program: Command): CommandContext {
  const opts = program.opts();
  return {
    environment: opts.env,
    mode: opts.mode || "default",
  };
}

/**
 * Get command context with resolved environment config
 * Shows interactive picker if no --env flag provided
 * Use this for remote commands (db push, permissions push, sync, etc.)
 */
export async function getCommandContextWithEnv(
  program: Command
): Promise<CommandContextWithEnv> {
  const opts = program.opts();
  const env = await selectEnvironment(opts.env);
  return {
    env,
    mode: opts.mode || "default",
  };
}
