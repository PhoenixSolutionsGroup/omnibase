import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { resolveEnvironment, findOmnibaseRoot } from "../utils/environment";

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
  const envConfig = resolveEnvironment(envOverride);
  const url = `${envConfig.apiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add API key if available
  if (envConfig.apiKey) {
    headers["X-Service-Key"] = envConfig.apiKey;
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

  // If fileName is specified, filter to just that file
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

    // Extract template type from filename (remove .html extension)
    const templateType = file.replace(".html", "");

    // Use filename as subject (this matches your requirement: filename -> subject)
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

export function addEmailCommands(program: Command): void {
  const email = program.command("email").description("Manage email templates");

  // Push email templates command
  email
    .command("push [filename]")
    .description(
      "Push email templates to PostgreSQL database (leave empty to push all templates)"
    )
    .option("--env <environment>", "Override environment for this command")
    .action(async (filename: string | undefined, options) => {
      try {
        console.log("🔍 Loading email templates...");
        const templates = loadEmailTemplates(filename);

        console.log(`✅ Found ${templates.size} template(s) to upload`);

        const envOverride = options.env || program.opts().env;
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const [type, template] of templates.entries()) {
          console.log(`📤 Uploading template: ${type}...`);

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
            console.log(`  ✅ Successfully uploaded: ${type}`);
            successCount++;
          } else {
            console.error(`  ❌ Failed to upload ${type}: ${response.error}`);
            errors.push(`${type}: ${response.error}`);
            errorCount++;
          }
        }

        console.log("\n📊 Summary:");
        console.log(`  ✅ Successful: ${successCount}`);
        console.log(`  ❌ Failed: ${errorCount}`);

        if (errors.length > 0) {
          console.log("\n❌ Errors:");
          errors.forEach((error) => {
            console.log(`  • ${error}`);
          });
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

  // List email templates command
  email
    .command("list")
    .description("List all email templates in the project")
    .action(() => {
      try {
        const templatesPath = getEmailTemplatesPath();

        if (!fs.existsSync(templatesPath)) {
          console.log(
            `No email templates directory found at: ${templatesPath}`
          );
          console.log("💡 Tip: Create the directory and add .html templates");
          return;
        }

        const files = fs.readdirSync(templatesPath);
        const htmlFiles = files.filter((file) => file.endsWith(".html"));

        if (htmlFiles.length === 0) {
          console.log("No email templates found");
          return;
        }

        console.log(`📧 Found ${htmlFiles.length} email template(s):\n`);
        htmlFiles.forEach((file, index) => {
          const templateType = file.replace(".html", "");
          console.log(`  ${index + 1}. ${templateType} (${file})`);
        });
      } catch (error) {
        console.error(
          "❌ Error:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });
}
