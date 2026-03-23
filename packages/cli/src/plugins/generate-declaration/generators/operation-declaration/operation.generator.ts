import * as path from 'path'
import * as changeCase from 'change-case'
import { Artifact, ModuleDefinition, OperationDefinition } from '~/models/index.js'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { OperationDefinitionTransformer, EntrypointTransformer } from '~/transformers/index.js'
import { FileNamingStyle } from '~/constants/index.js'
import type { Generator, RuntimeConfig } from '~/types/index.js'
import { SchemaDeclarationGenerator } from '../schema-declaration/index.js'
import { ResponseDeclarationGenerator } from '../response-declaration/index.js'
import { MetadataStorage } from '../../constants/metadata-storage.js'


export const OPERATION_GENERATOR = 'operationDeclarationGenerator'

export class OperationDeclarationGenerator implements Generator {
  async compile(compiler: Compiler, task: TaskWrapper): Promise<Artifact[]> {
    const context = compiler.context
    const metadata = MetadataStorage.get(compiler)!

    const rc = context.rc!
    // const matcher = context.matcher!
    const documents = context.documents!
    // .filter((document) => !matcher.isModuleIgnored(document.module))

    const operationDefinitions = documents.flatMap((document) => document.operations)

    const artifactMap = new Map<OperationDefinition, Artifact>(
      await Promise.all(
        operationDefinitions.map(async (operationDefinition) => (<const>[
          operationDefinition,
          await metadata.hooks.afterOperationDeclarationArtifactGenerated.promise(
            this.generateOperationDefinitionArtifact(operationDefinition, rc),
            operationDefinition,
            task,
          ),
        ])),
      ),
    )

    return Array.from(artifactMap.values())
  }


  private generateOperationDefinitionArtifact(operationDefinition: OperationDefinition, rc: RuntimeConfig): Artifact {
    const filepath = OperationDeclarationGenerator.getOperationDefinitionArtifactFilepath(operationDefinition, rc.fileNamingStyle)
    const dirpath = path.dirname(filepath)

    const artifact = new Artifact({
      id: OperationDeclarationGenerator.getOperationDefinitionArtifactId(operationDefinition),
      filepath,
      content: OperationDefinitionTransformer.toDeclaration(
        operationDefinition,
        {
          esm: rc.esm,
          additionalPropertiesType: rc.additionalPropertiesType,
          getDependentSchemaDefinitionFilepath(dependentSchemaDefinition) {
            const relativePath = path.relative(
              dirpath,
              SchemaDeclarationGenerator.getSchemaDefinitionArtifactFilepath(dependentSchemaDefinition, rc.fileNamingStyle),
            )
            return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
          },
          getDependentResponseDefinitionFilepath(dependentResponseDefinition) {
            const relativePath = path.relative(
              dirpath,
              ResponseDeclarationGenerator.getResponseDefinitionArtifactFilepath(dependentResponseDefinition, rc.fileNamingStyle),
            )
            return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
          },
        },
      ),
      extensionName: '.type.ts',
    })

    return artifact
  }

  private generateEntrypointArtifact(moduleDefinition: ModuleDefinition, exports: Artifact[], rc: RuntimeConfig): Artifact {
    const filepath = OperationDeclarationGenerator.getEntrypointArtifactFilepath(moduleDefinition, rc.fileNamingStyle)
    const dirpath = path.dirname(filepath)

    const artifact = new Artifact({
      id: OperationDeclarationGenerator.getEntrypointArtifactId(moduleDefinition),
      filepath,
      content: EntrypointTransformer.toTypescript(exports, { dirpath }),
    })

    return artifact
  }


  static getOperationDefinitionArtifactFilepath(operationDefinition: OperationDefinition, fileNamingStyle: FileNamingStyle): string {
    const filename = `${changeCase[fileNamingStyle](operationDefinition.operationId)}.type.ts`
    const filepath = [
      '.',
      changeCase[fileNamingStyle](operationDefinition.module.name),
      'types',
      'operations',
      filename,
    ].join('/')

    return filepath
  }

  static getOperationDefinitionArtifactId(operationDefinition: OperationDefinition): string {
    return `${operationDefinition.id}?generator=${OPERATION_GENERATOR}`
  }

  static getEntrypointArtifactFilepath(moduleDefinition: ModuleDefinition, fileNamingStyle: FileNamingStyle): string {
    return [
      '.',
      changeCase[fileNamingStyle](moduleDefinition.name),
      'types',
      'operations',
      'index.ts',
    ].join('/')
  }

  static getEntrypointArtifactId(moduleDefinition: ModuleDefinition): string {
    return `${moduleDefinition.address.url}/paths/entrypoint?generator=${OPERATION_GENERATOR}`
  }
}
