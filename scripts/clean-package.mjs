import { rmSync } from "node:fs";

const targets = [".tmp", "coverage", "dist", "tsconfig.tsbuildinfo"];

for (const target of targets) {
  rmSync(target, { force: true, recursive: true });
}
