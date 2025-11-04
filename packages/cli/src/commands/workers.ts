import { Command } from "commander";
import { execSync } from "child_process";
import { readFile } from "fs/promises";
import FormData from "form-data";
import axios from "axios";
import * as path from "path";
import { findOmnibaseRoot, resolveEnvironment } from "../utils/environment";

export function addWorkersCommands(program: Command) {
  const workers = program
    .command("workers")
    .description("Manage Cloudflare Workers (HTTP, cron, queues)");

  workers
    .command("deploy")
    .description("Deploy workers to Cloudflare")
    .action(async () => {
      const globalOptions = program.opts();
      await deployWorkers(globalOptions.env);
    });
}

async function deployWorkers(envFlag?: string) {
  const root = findOmnibaseRoot();
  const workersDir = path.join(root, "omnibase/workers");

  // Load environment configuration
  const env = resolveEnvironment(envFlag);

  // For local environment, skip deployment (no managed hosting)
  if (env.name === "local") {
    console.log(
      "⚠️  Workers deployment is not available for local environment."
    );
    console.log("💡 Use 'npm run dev' in omnibase/workers for local testing.");
    console.log("💡 Or deploy to a cloud environment with --env flag:");
    console.log("   omnibase workers deploy --env dev");
    console.log("   omnibase workers deploy --env staging");
    console.log("   omnibase workers deploy --env production");
    return;
  }

  // Validate required configuration for non-local environments
  if (!env.projectId) {
    throw new Error(
      `OMNIBASE_PROJECT_ID not set in environment file.\n` +
        `Please add it to omnibase/environments/.env.${env.name}`
    );
  }

  if (!env.managedHostingUrl) {
    throw new Error(
      `MANAGED_HOSTING_URL not set in environment file.\n` +
        `Please add it to omnibase/environments/.env.${env.name}`
    );
  }

  console.log(`📦 Building workers for ${env.name} environment...`);

  // Run build script (works with npm/bun/yarn/pnpm)
  try {
    execSync("npm run build", {
      cwd: workersDir,
      stdio: "inherit",
    });
  } catch (error) {
    throw new Error("Build failed. Check the output above for details.");
  }

  // Read built file
  const scriptPath = path.join(workersDir, "dist/worker.js");
  const script = await readFile(scriptPath, "utf-8");
  console.log(`✅ Bundled workers → ${(script.length / 1024).toFixed(1)} KB`);

  // Read config
  const config = await readFile(
    path.join(workersDir, "wrangler.toml"),
    "utf-8"
  );

  // Read environment file for worker env vars
  const envFilePath = path.join(
    root,
    "omnibase/environments",
    `.env.${env.name}`
  );
  const envFile = await readFile(envFilePath, "utf-8");

  // Upload to managed hosting
  console.log("🚀 Deploying to Cloudflare Workers...");
  const result = await uploadToManagedHosting(
    env.managedHostingUrl,
    env.projectId,
    script,
    config,
    envFile
  );

  console.log("✅ Workers deployed successfully");
  console.log(`🌐 URL: ${result.url}`);
}

async function uploadToManagedHosting(
  managedHostingUrl: string,
  projectId: string,
  script: string,
  config: string,
  envFile: string
) {
  const form = new FormData();
  form.append("script", Buffer.from(script), {
    filename: "worker.js",
    contentType: "application/javascript",
  });
  form.append("config", Buffer.from(config), {
    filename: "wrangler.toml",
    contentType: "text/plain",
  });
  form.append("env", Buffer.from(envFile), {
    filename: ".env",
    contentType: "text/plain",
  });

  try {
    const response = await axios.post(
      `${managedHostingUrl}/api/v1/projects/${projectId}/workers/deploy`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          // Auth handled by managed hosting (session-based)
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error(
          "Authentication failed. Please check your credentials."
        );
      } else if (error.response?.status === 400) {
        throw new Error(
          `Invalid worker code or config: ${error.response.data.error}`
        );
      } else if (error.response?.status === 500) {
        throw new Error(
          `Deployment failed: ${
            error.response.data.error || "Internal server error"
          }`
        );
      }
    }
    throw new Error(`Deployment failed: ${(error as Error).message}`);
  }
}
