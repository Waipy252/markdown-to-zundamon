import { spawnSync } from "child_process";
import * as path from "path";

const projectName = process.argv[2];
if (!projectName) {
  console.error("Usage: pnpm exec ts-node scripts/studio.ts<project-name>");
  console.error("Example: pnpm exec ts-node scripts/studio.ts example");
  process.exit(1);
}
const props = JSON.stringify({ projectName });

console.log(`Starting studio for project: "${projectName}"`);

const result = spawnSync(
  "npx",
  ["remotion", "studio", "--props", props],
  {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  }
);

process.exit(result.status ?? 1);
