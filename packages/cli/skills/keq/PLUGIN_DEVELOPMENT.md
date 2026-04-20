# @keq-request/cli Plugin & Translator Development

## Compilation Pipeline

The compiler runs 4 phases in sequence. Plugins hook into these phases via tapable hooks:

1. **Setup** — Load config, parse `.keqfilter` rules
2. **Download** — Fetch OpenAPI docs from local files or HTTP URLs, convert to OpenAPI 3.1, dereference `$ref`
3. **Compile** — Transform OpenAPI operations/schemas into TypeScript code artifacts
4. **Persist** — Write generated files to disk

### Available Hooks

| Hook | Type | Phase |
|------|------|-------|
| `setup` / `afterSetup` | `AsyncParallelHook` / `AsyncSeriesHook` | Setup |
| `beforeDownload` / `download` / `afterDownload` | `AsyncSeriesHook` / `AsyncSeriesBailHook` / `AsyncSeriesHook` | Download |
| `beforeCompile` / `compile` / `afterCompile` | `AsyncSeriesHook` / `AsyncParallelHook` / `AsyncSeriesHook` | Compile |
| `beforePersist` / `persist` / `afterPersist` | `AsyncSeriesHook` / `AsyncParallelHook` / `AsyncSeriesHook` | Persist |
| `done` | `SyncHook` | Final |

## Custom Plugin Development

The main entry `@keq-request/cli` exports these types for plugin development: `Compiler`, `CompilerContext`, `TaskWrapper`, `Plugin`, `Artifact`, `ModuleDefinition`, `SchemaDefinition`, `OperationDefinition`, `ApiDocumentV3_1`, `Asset`.

```typescript
import { Plugin, Compiler, Artifact } from "@keq-request/cli"

class MyPlugin implements Plugin {
  apply(compiler: Compiler): void {
    compiler.hooks.afterCompile.tapPromise("MyPlugin", async (task) => {
      const artifacts = task.context.artifacts || []
      // Modify or add artifacts
    })
  }
}
```

## Custom Translator Development

A translator is a plugin organizer that returns a group of related plugins:

```typescript
import { Translator, Plugin } from "@keq-request/cli"
import { GenerateDeclarationPlugin } from "@keq-request/cli/plugins"

class CustomTranslator implements Translator {
  apply(): Plugin[] {
    return [
      new GenerateDeclarationPlugin(),
      // your custom generation plugins
    ]
  }
}
```
