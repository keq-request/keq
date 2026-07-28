import * as R from 'ramda'
import * as path from 'path'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Generator, RuntimeConfig } from '~/types/index.js'
import { Artifact, ModuleDefinition, OperationDefinition } from '~/models/index.js'
import { OperationDefinitionTransformer } from '~/transformers/index.js'
import { EntrypointTransformer } from '~/transformers/index.js'
import { FileNamingStyle } from '~/constants/index.js'
import { convertFilename } from '~/utils/convert-filename.js'
import { MetadataStorage } from '../../constants/metadata-storage.js'
import { RequestGenerator } from '../request/index.js'


export const ISOLATED_OPERATION_GENERATOR = 'isolatedOperationGenerator'

export class IsolatedOperationGenerator implements Generator {
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
          await metadata.hooks.afterIsolatedOperationArtifactGenerated.promise(
            this.generateOperationArtifact(operationDefinition, rc),
            operationDefinition,
            task,
          ),
        ])),
      ),
    )

    if (!rc.rendering.entrypoint) {
      return [...artifactMap.values()]
    }

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
          this.generateEntrypointArtifact(moduleDefinition, artifacts, rc),
          task,
        )),
    )

    return [...entrypoints, ...artifactMap.values()]
  }

  private generateOperationArtifact(operationDefinition: OperationDefinition, rc: RuntimeConfig): Artifact {
    const filepath = IsolatedOperationGenerator.getOperationArtifactFilepath(operationDefinition, rc.rendering.fileNamingStyle)
    const dirpath = path.dirname(filepath)

    const artifact = new Artifact({
      id: IsolatedOperationGenerator.getOperationArtifactId(operationDefinition),
      filepath,
      content: OperationDefinitionTransformer.toIsolated(operationDefinition, {
        esm: rc.rendering.esm,
        additionalPropertiesType: rc.rendering.additionalPropertiesType,
        v2Compat: rc.rendering.v2Compat,
        getRequestFilepath(): string {
          const relativePath = path.relative(
            dirpath,
            RequestGenerator.getRequestArtifactFilepath(operationDefinition.module.name, rc.rendering.fileNamingStyle),
          )
          return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
        },
      }),
    })

    return artifact
  }

  private generateEntrypointArtifact(moduleDefinition: ModuleDefinition, exports: Artifact[], rc: RuntimeConfig): Artifact {
    const filepath = IsolatedOperationGenerator.getEntrypointArtifactFilepath(moduleDefinition, rc.rendering.fileNamingStyle)
    const dirpath = path.dirname(filepath)

    const artifact = new Artifact({
      id: IsolatedOperationGenerator.getEntrypointArtifactId(moduleDefinition),
      filepath,
      content: EntrypointTransformer.toTypescript(exports, { dirpath }),
    })

    return artifact
  }

  static getOperationArtifactFilepath(operationDefinition: OperationDefinition, fileNamingStyle: FileNamingStyle): string {
    const filename = `${convertFilename(operationDefinition.operationId, fileNamingStyle)}.ts`
    return [
      '.',
      convertFilename(operationDefinition.module.name, fileNamingStyle),
      'operations',
      filename,
    ].join('/')
  }

  static getOperationArtifactId(operationDefinition: OperationDefinition): string {
    return `${operationDefinition.id}?generator=${ISOLATED_OPERATION_GENERATOR}`
  }

  static getEntrypointArtifactFilepath(moduleDefinition: ModuleDefinition, fileNamingStyle: FileNamingStyle): string {
    return [
      '.',
      convertFilename(moduleDefinition.name, fileNamingStyle),
      'operations',
      'index.ts',
    ].join('/')
  }

  static getEntrypointArtifactId(moduleDefinition: ModuleDefinition): string {
    return `${moduleDefinition.address.url}/operations/entrypoint?generator=${ISOLATED_OPERATION_GENERATOR}`
  }
}
