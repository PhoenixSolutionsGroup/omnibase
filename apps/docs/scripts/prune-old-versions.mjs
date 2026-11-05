import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const out = new URL('../out/', import.meta.url).pathname;
const versions = JSON.parse(
  readFileSync(new URL('../content/versions.json', import.meta.url), 'utf8'),
);

function prune(dir) {
  let removed = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) removed += prune(path);
    else if (entry.name.startsWith('__next.') && entry.name.endsWith('.txt')) {
      rmSync(path);
      removed += 1;
    }
  }
  return removed;
}

let total = 0;
for (const [section, latest] of Object.entries(versions)) {
  const sectionDir = join(out, section);
  if (!existsSync(sectionDir)) continue;
  for (const entry of readdirSync(sectionDir, { withFileTypes: true })) {
    if (entry.isDirectory() && /^\d+\.\d+\.\d+/.test(entry.name) && entry.name !== latest) {
      total += prune(join(sectionDir, entry.name));
    }
  }
}

console.log(`Removed ${total} prefetch files from older doc versions`);
