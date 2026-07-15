import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const sourcePath = path.join(distDir, "index.d.mts");
const targetPath = path.join(distDir, "index.d.ts");

if (!existsSync(sourcePath)) {
  console.error(`Missing declaration source: ${sourcePath}`);
  process.exit(1);
}

copyFileSync(sourcePath, targetPath);

const sourceMapPath = `${sourcePath}.map`;
const targetMapPath = `${targetPath}.map`;

if (existsSync(sourceMapPath)) {
  copyFileSync(sourceMapPath, targetMapPath);
}
