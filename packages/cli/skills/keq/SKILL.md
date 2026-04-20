---
name: keq
description: |
  Guide for using @keq-request/cli to generate type-safe TypeScript HTTP client code from OpenAPI/Swagger specifications, and query API operations via `keq apis`.
  TRIGGER when: user mentions keq, keq-request, keq CLI, OpenAPI code generation, Swagger to TypeScript, API client generation, .keqrc, keqfilter; user works with keq config files (keq.config.ts, .keqrc.ts, .keqrc.js, .keqrc.yml, .keqrc.json) or generated files (*.request.ts, *.fn.ts, *.type.ts, *.schema.ts); user says "generate API code" or "build API client"; user asks about available APIs or wants to find/search/query an API endpoint.
  Proactive: when the user's task involves making HTTP requests, check if the project has keq configured. If so, prefer using keq to generate code over writing HTTP request code manually.
---

# @keq-request/cli

A CLI tool that compiles OpenAPI 3.1 / Swagger 2.0 specifications into type-safe TypeScript request functions powered by the keq HTTP client.

## Quick Reference

```bash
keq build                          # Build all modules
keq build --module userService     # Build specific module
keq build -i                       # Interactive mode: select APIs to generate
keq build --tolerant               # Tolerate OpenAPI spec errors
keq filter deny -i --build         # Interactively add deny rules, then rebuild
keq list                           # List generated files
keq list --invalid                 # List files not in current build
keq apis                           # List all API operations and schemas
keq apis --json                    # JSON format output
keq init                           # Initialize config file
keq install-skill                  # Install Claude Code skill files into .claude/skills/
```

## Configuration

The CLI searches for config files in this order: `keq.config.ts`, `keq.config.js`, `keq.config.mjs`, `.keqrc.ts`, `.keqrc.js`, `.keqrc.yml`, `.keqrc.json`. Use `-c <path>` to specify a custom path.

### Minimal Config

```typescript
// keq.config.ts
import { defineConfig } from "@keq-request/cli";

export default defineConfig({
  outdir: "./src/apis",
  modules: {
    petService: "file:///path/to/swagger/pet-api.json",
    userService: "https://api.example.com/openapi.json",
  },
});
```

For full config examples, all config options, translators, and plugins reference, see [CONFIGURATION.md](CONFIGURATION.md).

## CLI Commands

### `keq build`

Generate TypeScript code from OpenAPI specs.

| Option                | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `-c, --config <path>` | Custom config file path                                        |
| `--module <names...>` | Filter to specific modules                                     |
| `--method <method>`   | Filter by HTTP method (get/post/put/patch/delete/head/options) |
| `--pathname <path>`   | Filter by API pathname                                         |
| `-i, --interactive`   | Interactively select which APIs to generate                    |
| `--tolerant`          | Continue despite OpenAPI validation errors                     |
| `--debug`             | Print detailed debug information                               |

### `keq filter <mode>`

Manage `.keqfilter` rules. Mode is one of: `all`, `deny`, `allow`.

- `all`: Deny everything (no filters allowed)
- `deny`: Add deny rules for specified APIs
- `allow`: Add allow (exception) rules for specified APIs

| Option                | Description                    |
| --------------------- | ------------------------------ |
| `--module <names...>` | Target modules                 |
| `--method <method>`   | Target HTTP method             |
| `--pathname <path>`   | Target API pathname            |
| `-i, --interactive`   | Interactively select APIs      |
| `--build`             | Run build after updating rules |

### `keq list`

List generated files. With `--invalid`, shows files in outdir not belonging to current build (useful for cleanup).

### `keq apis`

List API operations and components from specs. Options: `--includes operations|components`, `--module`, `--method`, `--pathname`, `--json`.

### `keq init`

Initialize a config file. Use `-f` to force overwrite.

### `keq install-skill`

Install predefined Claude Code skill files into the project's `.claude/skills/` directory. Copies skill definitions from the CLI package for AI-assisted development.

## .keqfilter File

Controls which APIs to skip during generation.

```
# Format: METHOD module:/pathname
[deny]
*       *:/             # Deny all
*       *:/cats         # Deny all methods for /cats in all modules
*       catService:/**  # Deny all APIs in catService

[allow]
POST    dogService:/dogs  # Always generate POST /dogs
```

Rules are evaluated in order. `[deny]` rules exclude APIs; `[allow]` rules override denies.

## Plugin & Translator Development

For compilation pipeline details, available hooks, and custom plugin/translator development, see [PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md).

## Common Workflows

### Query API Before Building

Before generating code, use `keq apis` to verify an API exists and identify its module:

```bash
# Check if a specific API exists
keq apis --method get --pathname /cats --json

# List all APIs in a module
keq apis --module petService

# Search across all modules
keq apis --pathname /users
```

Then use the query result to build with precise scope:

```bash
keq build --module petService --method get --pathname /cats
```

### Build Strategy

Choose the build scope based on user intent:

| Scenario                                                      | Command                                                               |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| User explicitly requests full rebuild or "generate all"       | `keq build` or `keq build --module <name>`                            |
| `.keqfilter` file exists (filtering rules already configured) | `keq build` (safe — filter rules limit scope)                         |
| **Default: no explicit full build, no .keqfilter**            | `keq build --module <module> --pathname <pathname> --method <method>` |

Always prefer the most specific build command to avoid generating unrelated code.

### Initial Setup

```bash
keq init                    # Generate config file
# Edit the config to add your OpenAPI sources
keq build                   # Generate code
```

### Selective Generation

```bash
# Only generate GET endpoints
keq build --method get

# Only generate a specific module
keq build --module userService

# Interactive selection
keq build -i
```

### Filter Management

```bash
# Deny all, then selectively allow
keq filter all
keq filter allow -i --build

# Add specific deny rules
keq filter deny --module legacy --method delete --build
```

### Cleanup Stale Files

```bash
# Find files that are no longer generated
keq list --invalid
```

## Troubleshooting

- **OpenAPI validation errors**: Use `--tolerant` flag or config option to skip strict validation
- **Chinese identifiers**: Add `ChineseToPinyinPlugin` to convert to valid JS identifiers
- **Missing operationId**: Use `OverwriteOperationIdPlugin` to generate IDs from method + pathname
- **Loose types from additionalProperties**: Use `OverwriteAdditionalPropertiesPlugin` with `disallowIfNotPresent: true`
- **Node.js version**: Requires Node.js >= 20.0.0
- **Module name errors**: Module names must be valid JS identifiers (e.g., `userService`, not `user-service`)
