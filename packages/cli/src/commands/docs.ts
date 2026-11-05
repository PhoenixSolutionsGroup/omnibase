import { Command } from "commander";
import { DocsService } from "../services/docs/client";
import { handleCommandError } from "../utils/errors";
import { logger } from "../utils/logger";

function writeJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function addDocsCommands(program: Command): void {
  const docs = program
    .command("docs")
    .summary("Search and read the Omnibase documentation")
    .description(
      "Query the public Omnibase documentation from the terminal.\n\n" +
        "The commands use the docs site's `llms.json` feed, cache it locally " +
        "for an hour, and default to the latest version of each section. Set " +
        "`OMNIBASE_DOCS_URL` to use a different docs deployment.\n\n" +
        "Use `--json` for agent-friendly output."
    );

  docs
    .command("list")
    .summary("List documentation pages")
    .description(
      "List the latest documentation pages with their path, title, and URL.\n\n" +
        "```bash\n" +
        "omnibase docs list\n" +
        "omnibase docs list --json\n" +
        "```"
    )
    .option("--json", "Output JSON")
    .option("--refresh", "Ignore the local cache")
    .action(async (options: { json?: boolean; refresh?: boolean }) => {
      try {
        const pages = await new DocsService().list(Boolean(options.refresh));

        if (options.json) {
          writeJson(pages);
          return;
        }

        for (const page of pages) {
          logger.log(`${page.path}  ${page.title}`);
        }
      } catch (error) {
        await handleCommandError(error);
      }
    });

  docs
    .command("search")
    .argument("<query>", "Search query")
    .summary("Search documentation")
    .description(
      "Search the latest documentation by keyword and return ranked pages " +
        "with snippets.\n\n" +
        "```bash\n" +
        "omnibase docs search \"storage upload\"\n" +
        "omnibase docs search \"tenant jwt\" --limit 10 --json\n" +
        "```"
    )
    .option("--limit <number>", "Maximum results", "5")
    .option("--json", "Output JSON")
    .option("--refresh", "Ignore the local cache")
    .action(
      async (
        query: string,
        options: { limit?: string; json?: boolean; refresh?: boolean },
      ) => {
        try {
          const limit = Number.parseInt(options.limit ?? "5", 10);
          const results = await new DocsService().search(
            query,
            Number.isFinite(limit) ? limit : 5,
            Boolean(options.refresh),
          );

          if (options.json) {
            writeJson(results);
            return;
          }

          if (results.length === 0) {
            logger.log("No results.");
            return;
          }

          for (const result of results) {
            logger.newline();
            logger.log(`${result.title} (${result.url})`);
            logger.log(`  ${result.snippet}`);
          }
        } catch (error) {
          await handleCommandError(error);
        }
      },
    );

  docs
    .command("get")
    .argument("<path>", "Page path or URL")
    .summary("Print a documentation page")
    .description(
      "Print one documentation page as Markdown. The path can be a docs URL " +
        "or a relative path such as `guides/storage`.\n\n" +
        "```bash\n" +
        "omnibase docs get guides/storage\n" +
        "omnibase docs get /api/latest/storage/uploadFile --json\n" +
        "```"
    )
    .option("--json", "Output JSON")
    .option("--refresh", "Ignore the local cache")
    .action(
      async (
        path: string,
        options: { json?: boolean; refresh?: boolean },
      ) => {
        try {
          const page = await new DocsService().get(
            path,
            Boolean(options.refresh),
          );

          if (options.json) {
            writeJson(page);
            return;
          }

          logger.log(page.content);
        } catch (error) {
          await handleCommandError(error);
        }
      },
    );
}
