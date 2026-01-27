import { AsyncSeriesWaterfallHook } from 'tapable'
import { Plugin } from '~/types/index.js'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact, OperationDefinition } from '~/models/index.js'
import { GenerateMicroFunctionPluginMetadata, MetadataStorage } from './constants/index.js'
import { MicroFunctionGenerator, RequestGenerator } from './generators/index.js'


export class GenerateMicroFunctionPlugin implements Plugin {
  private readonly microFunctionGenerator = new MicroFunctionGenerator()
  private readonly requestGenerator = new RequestGenerator()

  apply(compiler: Compiler): void {
    // Prevent duplicate registration by checking applied flag
    const metadata = GenerateMicroFunctionPlugin.register(compiler)
    if (metadata.applied) return

    // Mark as applied immediately to prevent re-entry
    metadata.applied = true

    compiler.hooks.compile.tapPromise(GenerateMicroFunctionPlugin.name, async (task: TaskWrapper) => {
      const artifacts = [
        ...(await this.requestGenerator.compile(compiler, task)),
        ...(await this.microFunctionGenerator.compile(compiler, task)),
      ]

      compiler.context.artifacts!.push(...artifacts)
    })
  }

  static register(compiler: Compiler): GenerateMicroFunctionPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        applied: false,
        hooks: {
          afterEntrypointArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, TaskWrapper]>(['artifact', 'task']),
          afterMicroFunctionArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper]>(['artifact', 'operationDefinition', 'task']),
        },
      })
    }

    return MetadataStorage.get(compiler)!
  }


  static of(compiler: Compiler): GenerateMicroFunctionPluginMetadata | undefined {
    return this.register(compiler)
  }
}
