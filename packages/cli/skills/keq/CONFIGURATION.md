# @keq-request/cli Configuration Reference

## Full Config Example

```typescript
import { defineConfig, FileNamingStyle } from "@keq-request/cli"
import { MicroFunctionTranslator } from "@keq-request/cli/translators"
import {
  PrettierPlugin,
  EslintPlugin,
  UseValibotPlugin,
  BodyFallbackPlugin,
  ChineseToPinyinPlugin,
  LintSchemaPlugin,
  OverwriteOperationIdPlugin,
  OverwriteQueryOptionsPlugin,
  OverwriteAdditionalPropertiesPlugin,
} from "@keq-request/cli/plugins"

export default defineConfig({
  outdir: "./src/apis",

  modules: {
    petService: "file:///path/to/swagger/pet-api.json",
    userService: {
      url: "https://api.example.com/openapi.json",
      headers: { Authorization: "Bearer token" },
      encoding: "utf8",
    },
  },

  rendering: {
    fileNamingStyle: FileNamingStyle.snakeCase,
    esm: true,
    additionalPropertiesType: "unknown",
    entrypoint: false,
  },

  translators: [new MicroFunctionTranslator()],
  clean: false,
  tolerant: false,

  plugins: [
    new PrettierPlugin(),
  ],
})
```

## Config Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outdir` | `string` | `"./api"` | Output directory for generated files |
| `modules` | `Record<string, string \| Address>` | — | Map of module names to OpenAPI doc URLs/paths |
| `rendering.fileNamingStyle` | `FileNamingStyle` | `snakeCase` | Generated file naming convention |
| `rendering.esm` | `boolean` | auto-detect | Generate ES Module imports |
| `rendering.additionalPropertiesType` | `"unknown" \| "any"` | `"unknown"` | Type for unspecified additional properties |
| `rendering.entrypoint` | `boolean` | `false` | Generate index.ts re-export files |
| `translators` | `Translator[]` | `[MicroFunctionTranslator]` | Code generation strategy |
| `clean` | `boolean` | `false` | Clean outdir before writing |
| `tolerant` | `boolean` | `false` | Tolerate OpenAPI spec errors |
| `debug` | `boolean` | `false` | Enable debug mode to output detailed logs during compilation |
| `plugins` | `Plugin[]` | `[]` | Additional plugins |

### FileNamingStyle Values

`camelCase`, `capitalCase`, `constantCase`, `dotCase`, `headerCase`, `noCase`, `paramCase`/`kebabCase`, `pascalCase`, `pathCase`, `sentenceCase`, `snakeCase` (default)

### Module Name Rules

Module names must be valid JavaScript identifiers (start with letter or `_`, contain only letters, digits, `_`, `$`). Names are checked for case-insensitive uniqueness.

## Translators

Translators determine the output code style by bundling related plugins.

### MicroFunctionTranslator (default)

Generates standalone request functions. Each API operation becomes an exported async function.

```typescript
import { MicroFunctionTranslator } from "@keq-request/cli/translators"
// translators: [new MicroFunctionTranslator()]
```

Generated file structure:

```
outdir/
└── module_name/
    ├── operations/
    │   └── operation_name.fn.ts          # Request function
    ├── request.ts                         # Base request object
    └── types/
        ├── operations/
        │   └── operation_name.type.ts     # Operation type definitions
        └── components/
            └── schemas/
                └── schema_name.schema.ts  # Data model types
```

Generated usage:
```typescript
import { getCats } from "./src/apis/pet_service/get_cats.fn"

const cats = await getCats({ breed: "siamese" })
  .retry(3, 1000)
  .timeout(5000)
```

### NestjsTranslator

Generates NestJS-compatible modules with dependency injection support.

```typescript
import { NestjsTranslator } from "@keq-request/cli/translators"
// translators: [new NestjsTranslator()]
```

Generated file structure:

```
outdir/
└── module_name/
    ├── module_name.module.ts              # NestJS module
    ├── module_name.client.ts              # NestJS client with injected methods
    └── types/
        ├── operations/
        │   └── operation_name.type.ts     # Operation type definitions
        └── components/
            └── schemas/
                └── schema_name.schema.ts  # Data model types
```

## Plugins

Import all plugins from `@keq-request/cli/plugins`.

### Code Formatting

| Plugin | Purpose |
|--------|---------|
| `PrettierPlugin` | Run `prettier --write` on generated files |
| `EslintPlugin` | Run `eslint --fix` on generated files |

### Schema & Type Enhancement

| Plugin | Purpose |
|--------|---------|
| `UseValibotPlugin` | Generate Valibot runtime validation schemas alongside TypeScript types |
| `LintSchemaPlugin` | Validate schemas against JSON Schema Draft 2020-12. `{ strict: true }` aborts on error |
| `OverwriteAdditionalPropertiesPlugin` | Force `additionalProperties: false` when not declared. `{ disallowIfNotPresent: true }` |

### Operation Customization

| Plugin | Purpose |
|--------|---------|
| `OverwriteOperationIdPlugin` | Custom operationId generation: `new OverwriteOperationIdPlugin(({ method, pathname }) => ...)` |
| `OverwriteQueryOptionsPlugin` | Set query serialization format: `{ arrayFormat: "repeat" \| "brackets" \| "indices" \| "comma" }`. The `QsArrayFormat` enum is available from `@keq-request/cli` |

### Compatibility

| Plugin | Purpose |
|--------|---------|
| `BodyFallbackPlugin` | Route undeclared params to request body instead of discarding |
| `ChineseToPinyinPlugin` | Convert Chinese identifiers to pinyin |

### Plugin Usage Example

```typescript
import { defineConfig } from "@keq-request/cli"
import {
  PrettierPlugin,
  UseValibotPlugin,
  OverwriteOperationIdPlugin,
} from "@keq-request/cli/plugins"

export default defineConfig({
  outdir: "./src/apis",
  modules: { petService: "file:///path/to/pet-api.json" },
  plugins: [
    new UseValibotPlugin(),
    new OverwriteOperationIdPlugin(({ method, pathname }) =>
      `${method}_${pathname.split("/").filter(Boolean).join("_")}`
    ),
    new PrettierPlugin(),
  ],
})
```

When `rendering.entrypoint: true`, an `index.ts` re-exporting all operations is also generated.

All generated files include a header comment: `// Code generated by @keq-request/cli. DO NOT EDIT.`
