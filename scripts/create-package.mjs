import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";

const input = process.argv[2];

if (!input) {
  console.error("Usage: pnpm create:package <name>");
  process.exit(1);
}

const normalizedName = input.startsWith("@tsupc/") ? input.slice("@tsupc/".length) : input;

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedName)) {
  console.error("Package names must be kebab-case, for example: random or string-case.");
  process.exit(1);
}

const packageRoot = path.resolve("packages", normalizedName);
const templatesFolder = path.resolve("scripts", "templates");

mkdirSync(path.join(packageRoot, "src"), { recursive: true });
mkdirSync(path.join(packageRoot, "test"), { recursive: true });

writeFileSync(
  path.join(packageRoot, "package.json"),
  nunjucks.render(path.join(templatesFolder, "package.json.njk"), {
    package_name: normalizedName,
    git_repo_uri_path: "codicial/tsupc",
  }),
  { flag: "wx" },
);

writeFileSync(
  path.join(packageRoot, "README.md"),
  nunjucks.render(path.join(templatesFolder, "README.md.njk"), {
    package_name: normalizedName,
  }),
  { flag: "wx" },
);

writeFileSync(
  path.join(packageRoot, "src", "index.ts"),
  nunjucks.render(path.join(templatesFolder, "index.ts.njk")),
  { flag: "wx" },
);

writeFileSync(
  path.join(packageRoot, "test", "package.spec.ts"),
  nunjucks.render(path.join(templatesFolder, "package.spec.ts.njk"), {
    package_name: normalizedName,
  }),
  { flag: "wx" },
);

writeFileSync(
  path.join(packageRoot, "tsconfig.json"),
  nunjucks.render(path.join(templatesFolder, "tsconfig.json.njk")),
  { flag: "wx" },
);

writeFileSync(
  path.join(packageRoot, "tsdown.config.ts"),
  nunjucks.render(path.join(templatesFolder, "tsdown.config.ts.njk")),
  { flag: "wx" },
);

writeFileSync(
  path.join(packageRoot, "vitest.config.ts"),
  nunjucks.render(path.join(templatesFolder, "vitest.config.ts.njk")),
  { flag: "wx" },
);

console.log(`Created @tsupc/${normalizedName} at ${packageRoot}`);
