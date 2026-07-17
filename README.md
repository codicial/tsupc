# tsupc

TypeScript Utility Package Collection.

`tsupc` is a pnpm workspace for publishing small, strict, reusable TypeScript utilities under the `@tsupc/*` npm scope.

The repo is set up for:

- strict TypeScript
- dual-package output for ESM and CommonJS
- declaration files for TS consumers
- package scaffolding from a shared template
- independent package versioning with Changesets
- automated CI and release workflows

## Goals

- Stop rewriting the same utility code across projects
- Keep each utility focused, typed, and easy to consume
- Publish packages that work in modern TS, ESM, and CJS environments
- Make adding a new package feel boring and repeatable

## Development Notes

This project was developed by the author with AI-assisted drafting and iteration.
All published code is reviewed, edited, and finalized by the author.

## Requirements

- Node `>=22.18.0`
- pnpm `11.7.0`

## Packages

Current workspace packages:

- `@tsupc/random` - deterministic random utilities and helpers
- `@tsupc/timing` - timing helpers such as `debounce`

## Getting Started

Install dependencies:

```sh
pnpm install
```

Run the workspace checks:

```sh
pnpm typecheck
pnpm test
pnpm coverage
pnpm build
```

Clean generated output:

```sh
pnpm clean
```

## Workspace Scripts

- `pnpm build` - builds every package
- `pnpm clean` - removes build output, temp files, and coverage artifacts
- `pnpm create:package <name>` - scaffolds a new package in `packages/<name>`
- `pnpm coverage` - runs package test suites with coverage reporting
- `pnpm typecheck` - runs TypeScript checks across the workspace
- `pnpm test` - runs package test suites
- `pnpm changeset` - creates a new Changeset entry
- `pnpm version-packages` - applies Changeset version bumps
- `pnpm release` - builds and publishes unpublished package versions

## Creating a New Package

Create a package:

```sh
pnpm create:package string-case
```

That generates a package with this structure:

```text
packages/<name>/
  src/index.ts
  test/package.spec.ts
  package.json
  tsconfig.json
  tsdown.config.ts
  vitest.config.ts
```

The scaffold is powered by Nunjucks templates in `scripts/templates/`.

Every generated package is configured with:

- `@tsupc/<name>` package naming
- `type: "module"`
- ESM + CJS builds through `tsdown`
- declaration output in `dist/`
- a generic package-level spec file
- public npm publishing metadata

## Package Conventions

Each package should stay small and focused.

- Source lives in `src/`
- Tests live in `test/`
- Build output goes to `dist/`
- Public exports are declared explicitly in `package.json`
- Packages should remain strict and fully typed

The default package shape publishes:

- `dist/index.mjs`
- `dist/index.cjs`
- `dist/index.d.ts`

## Attribution

- `@tsupc/random` uses FNV-1a hashing for seed initialization and MMIX linear congruential generator constants for state advancement.
- `@tsupc/timing` currently provides a small debounce utility implemented for this workspace.

## Versioning

This repo uses [Changesets](https://github.com/changesets/changesets) with independent package versioning.

Current release policy:

- `minor` for new API surface and meaningful package changes
- `patch` for fixes and maintenance

Typical flow:

```sh
pnpm changeset
git add .
git commit -m "Add new utility"
```

When Changesets land on `main`, the release workflow opens or updates a version PR. After that PR is merged, publish runs for any unpublished package versions.

## Publishing

Published packages use the `@tsupc/*` scope and `publishConfig.access: "public"`.

The release workflow in `.github/workflows/release.yml` expects npm trusted publishing to be configured for this repository. Once that is set up, pushes to `main` can:

- create or update the Changesets release PR
- publish newly versioned packages to npm

## License

This project is licensed under the [MIT License](./LICENSE).

Copyright (c) 2026 codicial

## CI

The CI workflow in `.github/workflows/ci.yml` runs on pull requests and on `main`:

- install
- typecheck
- test with coverage
- build

## Project Layout

```text
packages/            Workspace packages
scripts/             Repo utilities and generators
scripts/templates/   Nunjucks templates for new packages
.changeset/          Versioning and release metadata
.github/workflows/   CI and release automation
```
