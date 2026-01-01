import ora, { Ora } from "ora";
import chalk from "chalk";

class Logger {
  private spinner: Ora | null = null;

  start(message: string): void {
    this.spinner = ora(message).start();
  }

  update(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  succeed(message: string): void {
    if (this.spinner) {
      this.spinner.succeed(message);
      this.spinner = null;
    } else {
      console.log(chalk.green("✓") + " " + message);
    }
  }

  fail(message: string): void {
    if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    } else {
      console.error(chalk.red("✗") + " " + message);
    }
  }

  warn(message: string): void {
    if (this.spinner) {
      this.spinner.warn(message);
      this.spinner = null;
    } else {
      console.warn(chalk.yellow("!") + " " + message);
    }
  }

  info(message: string): void {
    if (this.spinner) {
      const currentText = this.spinner.text;
      this.spinner.info(message);
      this.spinner = ora(currentText).start();
    } else {
      console.log(chalk.blue("i") + " " + message);
    }
  }

  log(message: string): void {
    console.log(message);
  }

  newline(): void {
    console.log();
  }
}

export const logger = new Logger();
