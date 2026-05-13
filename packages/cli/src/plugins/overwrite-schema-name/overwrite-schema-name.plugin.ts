import { JSONPath } from 'jsonpath-plus'
import { Compiler } from '~/compiler/index.js'
import { ModuleDefinition } from '~/models/module-definition.js'
import { Plugin } from '~/types/plugin.js'


export type SchemaNameFactory = (context: {
  name: string
  module: ModuleDefinition
}) => string | undefined


export class OverwriteSchemaNamePlugin implements Plugin {
  constructor(private readonly factory: SchemaNameFactory) {}

  apply(compiler: Compiler): void {
    compiler.hooks.beforeValidate.tap(OverwriteSchemaNamePlugin.name, (spec, moduleDefinition) => {
      const schemas = (spec as Record<string, unknown> & { components?: { schemas?: Record<string, unknown> } }).components?.schemas
      if (!schemas) return

      const renameMap = new Map<string, string>()
      for (const name of Object.keys(schemas)) {
        const newName = this.factory({ name, module: moduleDefinition })
        if (typeof newName === 'string' && newName !== name) {
          renameMap.set(name, newName)
        }
      }

      if (renameMap.size === 0) return

      for (const [oldName, newName] of renameMap) {
        schemas[newName] = schemas[oldName]
        delete schemas[oldName]
      }

      const refMap = new Map<string, string>()
      for (const [oldName, newName] of renameMap) {
        refMap.set(
          `#/components/schemas/${oldName}`,
          `#/components/schemas/${newName}`,
        )
      }

      const matches: Array<{ value: Record<string, unknown> }> = JSONPath({
        path: "$..*['$ref']^",
        json: spec,
        resultType: 'all',
      })

      for (const match of matches) {
        const ref = match.value.$ref
        if (typeof ref === 'string' && refMap.has(ref)) {
          match.value.$ref = refMap.get(ref)
        }
      }
    })
  }
}
