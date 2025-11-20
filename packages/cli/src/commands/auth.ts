import { Command } from "commander";
import { execSync } from "child_process";
import axios from "axios";
import {
  resolveEnvironment,
  findOmnibaseRoot,
  getProjectName,
} from "../utils/environment";
import { getLocalServiceName } from "../config/services";

/**
 * Auth command class for managing authentication service operations
 */
export class AuthCommand {
  private serviceName = "auth";

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
