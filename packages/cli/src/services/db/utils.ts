import * as fs from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";
import { logger } from "../../utils/logger";

export const ensureMigrationDir = (path: string) => {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path, { recursive: true });
		logger.info(`Created migrations directory: ${path}`);
	}
};

export const zipMigrationsDir = (migrationsDir: string) => {
	if (!fs.existsSync(migrationsDir)) {
		throw new Error(
			`No migrations directory found at ${migrationsDir}\n` +
				`Run \`omnibase db migrate generate\` first to create migrations.`,
		);
	}

	const dirs = fs
		.readdirSync(migrationsDir)
		.filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
		.sort();

	if (dirs.length === 0) {
		throw new Error(
			`No migration directories found in ${migrationsDir}\n` +
				`Run \`omnibase db migrate generate\` first to create migrations.`,
		);
	}

	const zip = new AdmZip();
	let fileCount = 0;
	for (const dir of dirs) {
		for (const f of ["migration.sql", "down.sql"]) {
			const p = path.join(migrationsDir, dir, f);
			if (fs.existsSync(p)) {
				zip.addLocalFile(p, dir);
				fileCount++;
			}
		}
	}

	if (fileCount === 0) {
		throw new Error(
			`No migration.sql files found in ${migrationsDir}/<dir>/\n` +
				`Run \`omnibase db migrate generate\` first to create migrations.`,
		);
	}

	logger.log(`Found ${dirs.length} migration(s) (${fileCount} file(s)):`);
	for (const dir of dirs) {
		logger.log(`   ${dir}`);
	}

	return zip;
};
