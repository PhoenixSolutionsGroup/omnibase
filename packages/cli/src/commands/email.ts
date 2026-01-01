import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { selectEnvironment, findOmnibaseRoot } from "../utils/environment";
import { logger } from "../utils/logger";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function makeApiRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: any,
  envOverride?: string
): Promise<ApiResponse> {
  const envConfig = await selectEnvironment(envOverride);
  const url = `${envConfig.omnibaseApiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (envConfig.omnibaseServiceKey) {
    headers["X-Service-Key"] = envConfig.omnibaseServiceKey;
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
        error: data.error || `${response.status} - ${response.statusText}`,
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

function getEmailTemplatesPath(): string {
  const projectRoot = findOmnibaseRoot();
  return path.join(projectRoot, "omnibase", "email");
}

function loadEmailTemplates(
  fileName?: string
): Map<string, { subject: string; htmlBody: string }> {
  const templatesPath = getEmailTemplatesPath();
  const templates = new Map<string, { subject: string; htmlBody: string }>();

  if (!fs.existsSync(templatesPath)) {
    throw new Error(`Email templates directory not found at: ${templatesPath}`);
  }

  const files = fs.readdirSync(templatesPath);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));

  const filesToProcess = fileName
    ? htmlFiles.filter(
        (file) => file === `${fileName}.html` || file === fileName
      )
    : htmlFiles;

  if (filesToProcess.length === 0) {
    if (fileName) {
      throw new Error(`Template file not found: ${fileName}`);
    }
    throw new Error(`No HTML template files found in: ${templatesPath}`);
  }

  for (const file of filesToProcess) {
    const filePath = path.join(templatesPath, file);
    const htmlContent = fs.readFileSync(filePath, "utf8");

    const templateType = file.replace(".html", "");

    const subject = templateType
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    templates.set(templateType, {
      subject,
      htmlBody: htmlContent,
    });
  }

  return templates;
}

/**
 * Push email templates to API (exported for sync command)
 */
export async function pushEmailTemplates(envOverride?: string): Promise<void> {
  logger.start("Loading email templates...");
  const templates = loadEmailTemplates();

  logger.succeed(`Found ${templates.size} template(s) to upload`);

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const [type, template] of templates.entries()) {
    logger.start(`Uploading template: ${type}...`);

    const response = await makeApiRequest(
      "/api/v1/email/templates",
      "POST",
      {
        type,
        subject: template.subject,
        html_body: template.htmlBody,
      },
      envOverride
    );

    if (response.success) {
      logger.succeed(`Uploaded: ${type}`);
      successCount++;
    } else {
      logger.fail(`Failed to upload ${type}: ${response.error}`);
      errors.push(`${type}: ${response.error}`);
      errorCount++;
    }
  }

  logger.log(`Email templates: ${successCount} successful, ${errorCount} failed`);

  if (errors.length > 0) {
    throw new Error(`Email upload failed for: ${errors.join(", ")}`);
  }
}

export function addEmailCommands(program: Command): void {
  const email = program.command("email").description("Manage email templates");

  email
    .command("push [filename]")
    .description(
      "Push email templates to PostgreSQL database (leave empty to push all templates)"
    )
    .option("--env <environment>", "Override environment for this command")
    .action(async (filename: string | undefined, options) => {
      try {
        logger.start("Loading email templates...");
        const templates = loadEmailTemplates(filename);

        logger.succeed(`Found ${templates.size} template(s) to upload`);

        const envOverride = options.env || program.opts().env;
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const [type, template] of templates.entries()) {
          logger.start(`Uploading template: ${type}...`);

          const response = await makeApiRequest(
            "/api/v1/email/templates",
            "POST",
            {
              type,
              subject: template.subject,
              html_body: template.htmlBody,
            },
            envOverride
          );

          if (response.success) {
            logger.succeed(`Uploaded: ${type}`);
            successCount++;
          } else {
            logger.fail(`Failed to upload ${type}: ${response.error}`);
            errors.push(`${type}: ${response.error}`);
            errorCount++;
          }
        }

        logger.newline();
        logger.log("Summary:");
        logger.log(`  Successful: ${successCount}`);
        logger.log(`  Failed: ${errorCount}`);

        if (errors.length > 0) {
          logger.newline();
          logger.log("Errors:");
          errors.forEach((error) => {
            logger.log(`  - ${error}`);
          });
          process.exit(1);
        }
      } catch (error) {
        logger.fail(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  email
    .command("list")
    .description("List all email templates in the project")
    .action(() => {
      try {
        const templatesPath = getEmailTemplatesPath();

        if (!fs.existsSync(templatesPath)) {
          logger.warn(`No email templates directory found at: ${templatesPath}`);
          logger.log("Tip: Create the directory and add .html templates");
          return;
        }

        const files = fs.readdirSync(templatesPath);
        const htmlFiles = files.filter((file) => file.endsWith(".html"));

        if (htmlFiles.length === 0) {
          logger.warn("No email templates found");
          return;
        }

        logger.log(`Found ${htmlFiles.length} email template(s):`);
        logger.newline();
        htmlFiles.forEach((file, index) => {
          const templateType = file.replace(".html", "");
          logger.log(`  ${index + 1}. ${templateType} (${file})`);
        });
      } catch (error) {
        logger.fail(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
