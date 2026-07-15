import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const packagesDir = path.resolve("packages");
const npmCacheDir = path.resolve(".tmp", ".npm-cache");
const packageDirectories = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(packagesDir, entry.name))
  .sort();

mkdirSync(npmCacheDir, { recursive: true });

const unpublishedPackages = [];

for (const packageDir of packageDirectories) {
  const packageJsonPath = path.join(packageDir, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

  if (packageJson.private || !packageJson.name || !packageJson.version) {
    continue;
  }

  const spec = `${packageJson.name}@${packageJson.version}`;

  try {
    execFileSync("npm", ["view", spec, "version", "--json"], {
      cwd: packageDir,
      env: {
        ...process.env,
        npm_config_cache: npmCacheDir,
      },
      stdio: "pipe",
    });
  } catch {
    unpublishedPackages.push({
      access: packageJson.publishConfig?.access ?? "public",
      dir: packageDir,
      spec,
    });
  }
}

if (unpublishedPackages.length === 0) {
  console.log("No unpublished package versions found.");
  process.exit(0);
}

for (const pkg of unpublishedPackages) {
  console.log(`Publishing ${pkg.spec}`);
  execFileSync("npm", ["publish", "--access", pkg.access, "--provenance"], {
    cwd: pkg.dir,
    env: {
      ...process.env,
      npm_config_cache: npmCacheDir,
    },
    stdio: "inherit",
  });
}
