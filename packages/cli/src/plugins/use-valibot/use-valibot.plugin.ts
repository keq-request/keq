import { Plugin } from '~/types/plugin.js'
import { Compiler } from '~/compiler/index.js'
import { Artifact, SchemaDefinition } from '~/models/index.js'
import { SchemaDefinitionTransformer } from '~/transformers/index.js'
import { GenerateDeclarationPlugin, SchemaDeclarationGenerator } from '../generate-declaration/index.js'
import { MetadataStorage, UseValibotPluginMetadata } from './constants/index.js'
import * as path from 'path'


export const USE_VALIBOT = 'useValibot'

export class UseValibotPlugin implements Plugin {
  name = USE_VALIBOT

  constructor() {}

  apply(compiler: Compiler): void {
    // Prevent duplicate registration by checking applied flag
    const metadata = UseValibotPlugin.register(compiler)
    if (metadata.applied) return

    // Mark as applied immediately to prevent re-entry
    metadata.applied = true


    // Get the metadata - this will register hooks but not apply the plugin
    const declarationMetadata = GenerateDeclarationPlugin.of(compiler)
    if (!declarationMetadata) {
      throw new Error('UseValibotPlugin requires GenerateDeclarationPlugin to be registered first')
    }

    // Hook into afterSchemaDeclarationArtifactGenerated to replace TypeScript declaration with Valibot schema
    declarationMetadata.hooks.afterSchemaDeclarationArtifactGenerated.tap(
      UseValibotPlugin.name,
      (artifact: Artifact, schemaDefinition: SchemaDefinition) => {
        const rc = compiler.context.rc!
        const filepath = artifact.filepath
        const dirpath = path.dirname(filepath)

        // Generate Valibot schema content
        const valibotContent = SchemaDefinitionTransformer.toValibot(
          schemaDefinition,
          {
            esm: rc.rendering.esm,
            additionalPropertiesType: rc.rendering.additionalPropertiesType,
            getDependentSchemaDefinitionFilepath(dependentSchemaDefinition: SchemaDefinition): string {
              const relativePath = path.relative(
                dirpath,
                SchemaDeclarationGenerator.getSchemaDefinitionArtifactFilepath(dependentSchemaDefinition, rc.rendering.fileNamingStyle),
              )

              return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
            },
          },
        )

        // Replace artifact content with Valibot schema
        return new Artifact({
          ...artifact,
          content: valibotContent,
        })
      },
    )
  }

  static register(compiler: Compiler): UseValibotPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
      })
    }

    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): UseValibotPluginMetadata | undefined {
    return this.register(compiler)
  }
}
