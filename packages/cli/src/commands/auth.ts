import { Command } from "commander";
import { execSync } from "child_process";
import axios from "axios";
import * as readline from "readline";
import {
  resolveEnvironment,
  findOmnibaseRoot,
  getProjectName,
} from "../utils/environment";
import { getLocalServiceName } from "../config/services";
import {
  loadCredentials,
  saveCredentials,
  Profile,
} from "../utils/credentials";

/**
 * Auth command class for managing authentication service operations
 */
export class AuthCommand {
  private serviceName = "auth";

  /**
   * Login to OmniBase Cloud
   */
  async login(
    apiKey: string,
    options: { url?: string; name?: string }
  ): Promise<void> {
    const managedHostingUrl = options.url || "https://api.omnibase.io"; // Default URL, can be overridden

    console.log(`🔐 Verifying API key with ${managedHostingUrl}...`);

    try {
      const response = await axios.post(
        `${managedHostingUrl}/api/v1/api-keys/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const data = response.data;
      if (!data.valid) {
        throw new Error("Invalid API key");
      }

      console.log(`✅ Authenticated as ${data.tenant_name} (${data.key_name})`);

      const credentials = loadCredentials();
      const tenantSlug = data.tenant_name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      const keySlug = data.key_name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const profileName = options.name || `${tenantSlug}-${keySlug}`;

      const profile: Profile = {
        tenant_id: data.tenant_id,
        tenant_name: data.tenant_name,
        key_name: data.key_name,
        key_prefix: data.key_prefix,
        api_key: data.api_key, // Full key from response
        managed_hosting_url: managedHostingUrl,
      };

      credentials.profiles[profileName] = profile;
      credentials.active_profile = profileName;

      saveCredentials(credentials);

      console.log(`✨ Profile '${profileName}' saved and set as active.`);
    } catch (error: any) {
      console.error("❌ Authentication failed:");
      if (error.response?.data) {
        console.error(`   ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        console.error(`   ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Switch active profile
   */
  async switchProfile(profileName?: string): Promise<void> {
    const credentials = loadCredentials();
    const profiles = Object.keys(credentials.profiles);

    if (profiles.length === 0) {
      console.log("No profiles found. Run 'omnibase auth login' first.");
      return;
    }

    if (profileName) {
      if (!credentials.profiles[profileName]) {
        console.error(`❌ Profile '${profileName}' not found.`);
        console.log("Available profiles:");
        profiles.forEach((p) => console.log(`   - ${p}`));
        return;
      }

      credentials.active_profile = profileName;
      saveCredentials(credentials);
      console.log(`✅ Switched to profile '${profileName}'`);
      return;
    }

    // Interactive selection if no profile name provided
    console.log("Available profiles:");
    profiles.forEach((p) => {
      const active = p === credentials.active_profile ? "*" : " ";
      console.log(` [${active}] ${p} (${credentials.profiles[p].tenant_name})`);
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Enter profile name to switch to: ", (answer) => {
      rl.close();
      if (answer && credentials.profiles[answer]) {
        credentials.active_profile = answer;
        saveCredentials(credentials);
        console.log(`✅ Switched to profile '${answer}'`);
      } else if (answer) {
        console.error(`❌ Profile '${answer}' not found.`);
      }
    });
  }

  /**
   * List profiles
   */
  async listProfiles(): Promise<void> {
    const credentials = loadCredentials();
    const profiles = Object.keys(credentials.profiles);

    if (profiles.length === 0) {
      console.log("No profiles found.");
      return;
    }

    console.log("Profiles:");
    profiles.forEach((p) => {
      const profile = credentials.profiles[p];
      const active = p === credentials.active_profile ? "*" : " ";
      console.log(` [${active}] ${p}`);
      console.log(`      Tenant: ${profile.tenant_name}`);
      console.log(`      Key: ${profile.key_name} (${profile.key_prefix}...)`);
    });
  }

  /**
   * Reset the auth service (restart)
   */
  async reset(options: { env?: string }): Promise<void> {
    console.log("🔄 Resetting auth service...");

    if (options.env === "local") {
      await this.resetLocalService();
    } else {
      await this.resetManagedService(options.env);
    }

    console.log("✅ Auth service reset successfully!");
  }

  /**
   * Reset local Docker Compose service
   */
  private async resetLocalService(): Promise<void> {
    const dockerService = getLocalServiceName(this.serviceName);
    if (!dockerService) {
      throw new Error(`Unknown service: ${this.serviceName}`);
    }

    console.log(`🐳 Restarting Docker service: ${dockerService}...`);

    try {
      const projectRoot = findOmnibaseRoot();
      const projectName = getProjectName();
      const options = (global as any).__program_opts || {};
      const composeMode = options.mode || "default";
      const composeFileName =
        composeMode === "dev" ? "docker-compose.dev.yml" : "docker-compose.yml";
      const dockerComposePath = `${__dirname}/../../docker/${composeFileName}`;

      execSync(
        `docker compose --project-name ${projectName} -f ${dockerComposePath} restart ${dockerService}`,
        { stdio: "inherit", cwd: projectRoot }
      );

      console.log(`✅ Docker service ${dockerService} restarted`);
    } catch (error) {
      console.error("❌ Failed to restart Docker service");
      console.log(
        `   Please run manually: docker compose restart ${dockerService}`
      );
      throw error;
    }
  }

  /**
   * Reset managed Cloud Run service via API
   */
  private async resetManagedService(env?: string): Promise<void> {
    const envConfig = resolveEnvironment(env);

    console.log(`☁️  Restarting Cloud Run service via ${envConfig.name}...`);

    try {
      const response = await axios.post(
        `${envConfig.apiUrl}/api/v1/services/restart`,
        {
          service_name: this.serviceName,
        },
        {
          headers: {
            "X-Service-Key": envConfig.apiKey,
          },
        }
      );

      console.log(`✅ Service restarted: ${response.data.message}`);

      if (response.data.restarted_services) {
        console.log(
          `   Restarted ${response.data.restarted_services.length} service(s)`
        );
        response.data.restarted_services.forEach((svc: string) => {
          console.log(`   • ${svc}`);
        });
      }

      if (response.data.failed_services?.length > 0) {
        console.warn(
          `⚠️  ${response.data.failed_services.length} service(s) failed to restart`
        );
        response.data.failed_services.forEach((svc: string) => {
          console.warn(`   • ${svc}`);
        });
      }
    } catch (error: any) {
      console.error("❌ Failed to restart service:");
      if (error.response?.data) {
        console.error(`   ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        console.error(`   ${error.message}`);
      }
      throw error;
    }
  }
}

/**
 * Add auth commands to the CLI program
 */
export function addAuthCommands(program: Command): void {
  const auth = program
    .command("auth")
    .description("Manage authentication service");

  auth
    .command("login")
    .description("Login to OmniBase Cloud")
    .argument("<api_key>", "API Key")
    .option("--url <url>", "Managed hosting URL")
    .option("--name <name>", "Profile name")
    .action(async (apiKey, options) => {
      try {
        const authCmd = new AuthCommand();
        await authCmd.login(apiKey, options);
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  auth
    .command("switch")
    .description("Switch active profile")
    .argument("[profile]", "Profile name")
    .action(async (profile) => {
      try {
        const authCmd = new AuthCommand();
        await authCmd.switchProfile(profile);
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  auth
    .command("profiles")
    .description("List authentication profiles")
    .action(async () => {
      try {
        const authCmd = new AuthCommand();
        await authCmd.listProfiles();
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  auth
    .command("reset")
    .description("Reset (restart) the authentication service")
    .action(async () => {
      try {
        const options = program.opts();
        // Store options globally so reset() can access env flag
        (global as any).__program_opts = options;

        const authCmd = new AuthCommand();
        await authCmd.reset(options);
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}
