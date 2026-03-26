import * as R from 'ramda'
import * as path from 'path'
import { Artifact, ModuleDefinition, ResponseDefinition, SchemaDefinition } from '~/models/index.js'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { ResponseDefinitionTransformer } from '~/transformers/index.js'
import { EntrypointTransformer } from '~/transformers/entrypoint/entrypoint.transformer.js'
import { FileNamingStyle } from '~/constants/file-naming-style.js'
import * as changeCase from 'change-case'
import type { Generator, RuntimeConfig } from '~/types/index.js'
import { MetadataStorage } from '../../constants/metadata-storage.js'
import { SchemaDeclarationGenerator } from '../schema-declaration/index.js'


export const RESPONSE_GENERATOR = 'responseGenerator'

export class ResponseDeclarationGenerator implements Generator {
  async compile(compiler: Compiler, task: TaskWrapper): Promise<Artifact[]> {
    const context = compiler.context
    const metadata = MetadataStorage.get(compiler)!

    const rc = context.rc!
    const documents = context.documents!

    const responseDefinitions = documents.flatMap((document) => document.responses)

    if (responseDefinitions.length === 0) return []

    const artifactMap = new Map<ResponseDefinition, Artifact>(
      await Promise.all(
        responseDefinitions.map(async (responseDefinition) => (<const>[
          responseDefinition,
          await metadata.hooks.afterResponseDeclarationArtifactGenerated.promise(
            this.generateResponseDefinitionArtifact(responseDefinition, rc),
            responseDefinition,
            task,
          ),
        ])),
      ),
    )

    const entrypoints = R.collectBy(
      (responseDefinition) => responseDefinition.module.name,
      responseDefinitions,
    )
      .map((responseDefinitions) => <const>[
        responseDefinitions[0].module,
        responseDefinitions
          .map((responseDefinition) => artifactMap.get(responseDefinition))
          .filter((artifact): artifact is Artifact => Boolean(artifact)),
      ])
      .map(([moduleDefinition, artifacts]) => this.generateEntrypointArtifact(
        moduleDefinition,
        artifacts,
        rc,
      ))

    return [...artifactMap.values(), ...entrypoints]
  }

  private generateResponseDefinitionArtifact(responseDefinition: ResponseDefinition, rc: RuntimeConfig): Artifact {
    const filepath = ResponseDeclarationGenerator.getResponseDefinitionArtifactFilepath(responseDefinition, rc.rendering.fileNamingStyle)
    const dirpath = path.dirname(filepath)

    const artifact = new Artifact({
      id: ResponseDeclarationGenerator.getResponseDefinitionArtifactId(responseDefinition),
      filepath,
      content: ResponseDefinitionTransformer.toDeclaration(
        responseDefinition,
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
      ),
      extensionName: '.response.ts',
    })

    return artifact
  }

  private generateEntrypointArtifact(moduleDefinition: ModuleDefinition, exports: Artifact[], rc: RuntimeConfig): Artifact {
    const filepath = ResponseDeclarationGenerator.getEntrypointArtifactFilepath(moduleDefinition, rc.rendering.fileNamingStyle)
    const dirpath = path.dirname(filepath)

    const artifact = new Artifact({
      id: ResponseDeclarationGenerator.getEntrypointArtifactId(moduleDefinition),
      filepath,
      content: EntrypointTransformer.toTypescript(exports, { dirpath }),
    })

    return artifact
  }

  static getEntrypointArtifactFilepath(moduleDefinition: ModuleDefinition, fileNamingStyle: FileNamingStyle): string {
    return [
      '.',
      changeCase[fileNamingStyle](moduleDefinition.name),
      'types',
      'components',
      'responses',
      'index.ts',
    ].join('/')
  }

  static getEntrypointArtifactId(moduleDefinition: ModuleDefinition): string {
    return `${moduleDefinition.address.url}/components/responses/entrypoint?generator=${RESPONSE_GENERATOR}`
  }

  static getResponseDefinitionArtifactFilepath(responseDefinition: ResponseDefinition, fileNamingStyle: FileNamingStyle): string {
    const filename = `${changeCase[fileNamingStyle](responseDefinition.name)}.response.ts`
    return [
      '.',
      changeCase[fileNamingStyle](responseDefinition.module.name),
      'types',
      'components',
      'responses',
      filename,
    ].join('/')
  }

  static getResponseDefinitionArtifactId(responseDefinition: ResponseDefinition): string {
    return `${responseDefinition.id}?generator=${RESPONSE_GENERATOR}`
  }
}
