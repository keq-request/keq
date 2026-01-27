import { Plugin } from '~/types/plugin.js'
import { Compiler } from '~/compiler/index.js'
import { Artifact, SchemaDefinition } from '~/models/index.js'
import { SchemaDefinitionTransformer } from '~/transformers/index.js'
import { GenerateDeclarationPlugin, SchemaDeclarationGenerator } from '../generate-declaration/index.js'
import * as path from 'path'


export const USE_ZOD = 'useZod'

export class UseZodPlugin implements Plugin {
  name = USE_ZOD

  constructor() {}

  apply(compiler: Compiler): void {
    // Get the metadata - this will register hooks but not apply the plugin
    const declarationMetadata = GenerateDeclarationPlugin.of(compiler)
    if (!declarationMetadata) {
      throw new Error('UseZodPlugin requires GenerateDeclarationPlugin to be registered first')
    }

    // Hook into afterSchemaDeclarationArtifactGenerated to replace TypeScript declaration with Zod schema
    declarationMetadata.hooks.afterSchemaDeclarationArtifactGenerated.tap(
      UseZodPlugin.name,
      (artifact: Artifact, schemaDefinition: SchemaDefinition) => {
        const rc = compiler.context.rc!
        const filepath = artifact.filepath
        const dirpath = path.dirname(filepath)

        // Generate Zod schema content
        const zodContent = SchemaDefinitionTransformer.toZod(
          schemaDefinition,
          {
            esm: rc.esm,
            getDependentSchemaDefinitionFilepath(dependentSchemaDefinition: SchemaDefinition): string {
              const relativePath = path.relative(
                dirpath,
                SchemaDeclarationGenerator.getSchemaDefinitionArtifactFilepath(dependentSchemaDefinition, rc.fileNamingStyle),
              )

              return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
            },
          },
        )

        // Replace artifact content with Zod schema
        return new Artifact({
          ...artifact,
          content: zodContent,
        })
      },
    )
  }
}
