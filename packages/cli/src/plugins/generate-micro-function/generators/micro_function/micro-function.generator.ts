import * as R from 'ramda'
import * as path from 'path'
import * as changeCase from 'change-case'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Generator, RuntimeConfig } from '~/types/index.js'
import { Artifact, ModuleDefinition, OperationDefinition } from '~/models/index.js'
import { OperationDeclarationGenerator } from '~/plugins/generate-declaration/index.js'
import { OperationDefinitionTransformer } from '~/transformers/index.js'
import { EntrypointTransformer } from '~/transformers/index.js'
import { FileNamingStyle } from '~/constants/index.js'
import { MetadataStorage } from '../../constants/metadata-storage.js'
import { RequestGenerator } from '../request/index.js'


export const MICRO_FUNCTION_GENERATOR = 'microFunctionGenerator'

export class MicroFunctionGenerator implements Generator {
  async compile(compiler: Compiler, task: TaskWrapper): Promise<Artifact[]> {
    const metadata = MetadataStorage.get(compiler)!
    const context = compiler.context
    const rc = context.rc!
    const documents = context.documents!

    const operationDefinitions = documents.flatMap((document) => document.operations)

    const artifactMap = new Map<OperationDefinition, Artifact>(
      await Promise.all(
        operationDefinitions.map(async (operationDefinition) => (<const>[
          operationDefinition,
          await metadata.hooks.afterMicroFunctionArtifactGenerated.promise(
            this.generateOperationDefinitionArtifact(operationDefinition, rc),
            operationDefinition,
            task,
          ),
        ])),
      ),
    )


    const entrypoints = await Promise.all(
      R.collectBy(
        (operationDefinition: OperationDefinition) => operationDefinition.module.name,
        operationDefinitions,
      )
        .map((operationDefinitions) => (<const>[
          operationDefinitions[0].module,
          operationDefinitions
            .map((operationDefinition) => artifactMap.get(operationDefinition))
            .filter((artifact): artifact is Artifact => Boolean(artifact)),
        ]))
        .map(async ([moduleDefinition, artifacts]) => await metadata.hooks.afterEntrypointArtifactGenerated.promise(
          this.generateEntrypointArtifact(
            moduleDefinition,
            artifacts,
            rc,
          ),
          task,
        )),
    )

    return [...entrypoints, ...artifactMap.values()]
  }


  private generateOperationDefinitionArtifact(operationDefinition: OperationDefinition, rc: RuntimeConfig): Artifact {
    const filepath = MicroFunctionGenerator.getOperationDefinitionArtifactFilepath(operationDefinition, rc.rendering.fileNamingStyle)
    const dirpath = path.dirname(filepath)

    const artifact = new Artifact({
      id: MicroFunctionGenerator.getOperationDefinitionArtifactId(operationDefinition),
      filepath,
      content: OperationDefinitionTransformer.toMicroFunction(operationDefinition, {
        esm: rc.rendering.esm,
        getOperationDefinitionDeclarationFilepath(operationDefinition: OperationDefinition): string {
          const relativePath = path.relative(
            dirpath,
            OperationDeclarationGenerator.getOperationDefinitionArtifactFilepath(operationDefinition, rc.rendering.fileNamingStyle),
          )

          return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
        },
        getRequestFilepath(): string {
          const relativePath = path.relative(
            dirpath,
            RequestGenerator.getRequestArtifactFilepath(),
          )

          return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
        },
      }),
      extensionName: '.type.ts',
    })

    return artifact
  }

  private generateEntrypointArtifact(moduleDefinition: ModuleDefinition, exports: Artifact[], rc: RuntimeConfig): Artifact {
    const filepath = MicroFunctionGenerator.getEntrypointArtifactFilepath(moduleDefinition, rc.rendering.fileNamingStyle)
    const dirpath = filepath.substring(0, filepath.lastIndexOf('/'))

    const artifact = new Artifact({
      id: MicroFunctionGenerator.getEntrypointArtifactId(moduleDefinition),
      filepath,
      content: EntrypointTransformer.toTypescript(exports, { dirpath }),
    })

    return artifact
  }


  static getOperationDefinitionArtifactFilepath(operationDefinition: OperationDefinition, fileNamingStyle: FileNamingStyle): string {
    const filename = `${changeCase[fileNamingStyle](operationDefinition.operationId)}.fn.ts`
    const filepath = [
      '.',
      changeCase[fileNamingStyle](operationDefinition.module.name),
      'operations',
      filename,
    ].join('/')

    return filepath
  }

  static getOperationDefinitionArtifactId(operationDefinition: OperationDefinition): string {
    return `${operationDefinition.id}?generator=${MICRO_FUNCTION_GENERATOR}`
  }

  static getEntrypointArtifactFilepath(moduleDefinition: ModuleDefinition, fileNamingStyle: FileNamingStyle): string {
    return [
      '.',
      changeCase[fileNamingStyle](moduleDefinition.name),
      'operations',
      'index.ts',
    ].join('/')
  }

  static getEntrypointArtifactId(moduleDefinition: ModuleDefinition): string {
    return `${moduleDefinition.address}/paths/entrypoint?generator=${MICRO_FUNCTION_GENERATOR}`
  }
}
