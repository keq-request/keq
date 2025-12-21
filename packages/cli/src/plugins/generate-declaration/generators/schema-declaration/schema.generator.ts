import * as R from 'ramda'
import * as path from 'path'
import { Artifact, ModuleDefinition, SchemaDefinition } from '~/models/index.js'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { SchemaDefinitionTransformer } from '~/transformers/index.js'
import { EntrypointTransformer } from '~/transformers/entrypoint/entrypoint.transformer.js'
import { FileNamingStyle } from '~/constants/file-naming-style.js'
import * as changeCase from 'change-case'
import type { Generator, RuntimeConfig } from '~/types/index.js'
import { MetadataStorage } from '../../constants/metadata-storage.js'


export const SCHEMA_GENERATOR = 'schemaGenerator'

export class SchemaDeclarationGenerator implements Generator {
  async compile(compiler: Compiler, task: TaskWrapper): Promise<Artifact[]> {
    const context = compiler.context
    const metadata = MetadataStorage.get(compiler)!

    const rc = context.rc!
    // const matcher = context.matcher!
    const documents = context.documents!
    // .filter((document) => !matcher.isModuleIgnored(document.module))

    const schemaDefinitions = documents.flatMap((document) => document.schemas)

    const artifactMap = new Map<SchemaDefinition, Artifact>(
      await Promise.all(
        schemaDefinitions.map(async (schemaDefinition) => (<const>[
          schemaDefinition,
          await metadata.hooks.afterSchemaDeclarationGenerated.promise(
            this.generateSchemaDefinitionsArtifact(schemaDefinition, rc),
            schemaDefinition,
            task,
          ),
        ])),
      ),
    )


    const entrypoints = R.collectBy(
      (schemaDefinition) => schemaDefinition.module.name,
      schemaDefinitions,
    )
      .map((schemaDefinitions) => <const>[
        schemaDefinitions[0].module,
        schemaDefinitions
          .map((schemaDefinition) => artifactMap.get(schemaDefinition))
          .filter((artifact): artifact is Artifact => Boolean(artifact)),
      ])

      .map(([moduleDefinition, artifacts]) => this.generateEntrypointArtifact(
        moduleDefinition,
        artifacts,
        rc,
      ))

    return [...artifactMap.values(), ...entrypoints]
  }

  private generateSchemaDefinitionsArtifact(schemaDefinition: SchemaDefinition, rc: RuntimeConfig): Artifact {
    const filepath = SchemaDeclarationGenerator.getSchemaDefinitionArtifactFilepath(schemaDefinition, rc.fileNamingStyle)
    const dirpath = path.dirname(filepath)

    const artifact = new Artifact({
      id: SchemaDeclarationGenerator.getSchemaDefinitionArtifactId(schemaDefinition),
      filepath,
      content: SchemaDefinitionTransformer.toDeclaration(
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
      ),
      extensionName: '.schema.ts',
    })

    return artifact
  }

  private generateEntrypointArtifact(moduleDefinition: ModuleDefinition, exports: Artifact[], rc: RuntimeConfig): Artifact {
    const filepath = SchemaDeclarationGenerator.getEntrypointArtifactFilepath(moduleDefinition, rc.fileNamingStyle)
    const dirpath = path.dirname(filepath)

    const artifact = new Artifact({
      id: SchemaDeclarationGenerator.getEntrypointArtifactId(moduleDefinition),
      filepath,
      content: EntrypointTransformer.toTypescript(exports, { dirpath }),
    })

    return artifact
  }

  static getEntrypointArtifactFilepath(moduleDefinition: ModuleDefinition, fileNamingStyle: FileNamingStyle): string {
    return [
      '.',
      changeCase[fileNamingStyle](moduleDefinition.name),
      'components',
      'schemas',
      'index.ts',
    ].join('/')
  }

  static getEntrypointArtifactId(moduleDefinition: ModuleDefinition): string {
    return `${moduleDefinition.address}/components/schemas/entrypoint?generator=${SCHEMA_GENERATOR}`
  }

  static getSchemaDefinitionArtifactFilepath(schemaDefinition: SchemaDefinition, fileNamingStyle: FileNamingStyle): string {
    const filename = `${changeCase[fileNamingStyle](schemaDefinition.name)}.schema.ts`
    return [
      '.',
      changeCase[fileNamingStyle](schemaDefinition.module.name),
      'components',
      'schemas',
      filename,
    ].join('/')
  }

  static getSchemaDefinitionArtifactId(schemaDefinition: SchemaDefinition): string {
    return `${schemaDefinition.id}?generator=${SCHEMA_GENERATOR}`
  }
}
