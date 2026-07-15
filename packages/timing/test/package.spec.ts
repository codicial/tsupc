import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const packageDir = path.resolve(import.meta.dirname, "..");
const packageJsonPath = path.join(packageDir, "package.json");
const tempRoot = path.join(packageDir, ".tmp");

function run(command: string, args: string[], cwd = packageDir): string {
  mkdirSync(tempRoot, { recursive: true });

  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_cache: path.join(tempRoot, ".npm-cache"),
    },
    stdio: "pipe",
  });
}

describe("@tsupc/timing packaging", () => {
  it("supports ESM self-imports", () => {
    run(process.execPath, [
      "--input-type=module",
      "--eval",
      [
        "import * as test from '@tsupc/timing';",
        "if (test === undefined) throw new Error('Invalid ESM export.');",
      ].join(" "),
    ]);
  });

  it("supports CommonJS self-requires", () => {
    run(process.execPath, [
      "--eval",
      [
        "const test = require('@tsupc/timing');",
        "if (test === undefined) throw new Error('Invalid CJS export.');",
      ].join(" "),
    ]);
  });

  it("exposes explicit package exports", () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      exports: Record<string, unknown>;
      main: string;
      module: string;
      types: string;
    };

    expect(packageJson.exports).toEqual({
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.mjs",
        require: "./dist/index.cjs",
      },
    });
    expect(packageJson.main).toBe("./dist/index.cjs");
    expect(packageJson.module).toBe("./dist/index.mjs");
    expect(packageJson.types).toBe("./dist/index.d.ts");
  });

  it("ships only the intended publish artifacts", () => {
    const output = run("npm", ["pack", "--dry-run", "--json"]);
    const [packSummary] = JSON.parse(output) as Array<{
      files: Array<{ path: string }>;
    }>;
    const packedFiles = packSummary.files.map((file) => file.path).sort();

    expect(packedFiles).toContain("dist/index.cjs");
    expect(packedFiles).toContain("dist/index.mjs");
    expect(packedFiles).toContain("dist/index.d.ts");
    expect(packedFiles).toContain("package.json");
    expect(packedFiles).not.toContain("src/index.ts");
    expect(packedFiles).not.toContain("test/package.spec.ts");
  });

  it("resolves declaration files for TypeScript consumers", () => {
    mkdirSync(tempRoot, { recursive: true });
    const fixtureDir = mkdtempSync(path.join(tempRoot, "typecheck-"));

    try {
      writeFileSync(
        path.join(fixtureDir, "index.ts"),
        [
          "import * as test from '@tsupc/timing';",
          "void test;",
        ].join("\n"),
      );

      writeFileSync(
        path.join(fixtureDir, "tsconfig.json"),
        JSON.stringify(
          {
            compilerOptions: {
              module: "ESNext",
              moduleResolution: "Bundler",
              noEmit: true,
              strict: true,
              target: "ES2020",
            },
            include: ["index.ts"],
          },
          null,
          2,
        ),
      );

      run("pnpm", ["exec", "tsc", "--project", "tsconfig.json"], fixtureDir);
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true });
    }
  });
});
