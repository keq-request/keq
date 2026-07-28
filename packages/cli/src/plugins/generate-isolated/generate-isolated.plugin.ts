import { AsyncSeriesWaterfallHook } from 'tapable'
import { Plugin } from '~/types/index.js'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact, OperationDefinition } from '~/models/index.js'
import { GenerateIsolatedPluginMetadata, MetadataStorage } from './constants/index.js'
import { IsolatedOperationGenerator, RequestGenerator } from './generators/index.js'


export class GenerateIsolatedPlugin implements Plugin {
  private readonly isolatedOperationGenerator = new IsolatedOperationGenerator()
  private readonly requestGenerator = new RequestGenerator()

  apply(compiler: Compiler): void {
    const metadata = GenerateIsolatedPlugin.register(compiler)
    if (metadata.applied) return

    metadata.applied = true

    compiler.hooks.compile.tapPromise(GenerateIsolatedPlugin.name, async (task: TaskWrapper) => {
      const artifacts = [
        ...(await this.requestGenerator.compile(compiler, task)),
        ...(await this.isolatedOperationGenerator.compile(compiler, task)),
      ]

      compiler.context.artifacts!.push(...artifacts)
    })
  }

  static register(compiler: Compiler): GenerateIsolatedPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
        hooks: {
          afterEntrypointArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, TaskWrapper]>(['artifact', 'task']),
          afterIsolatedOperationArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper]>(['artifact', 'operationDefinition', 'task']),
        },
      })
    }

    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): GenerateIsolatedPluginMetadata | undefined {
    return this.register(compiler)
  }
}
