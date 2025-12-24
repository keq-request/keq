import { AsyncSeriesWaterfallHook } from 'tapable'
import { Plugin } from '~/types/index.js'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact, OperationDefinition } from '~/models/index.js'
import { GenerateMicroFunctionPluginMetadata, MetadataStorage } from './constants/index.js'
import { MicroFunctionGenerator } from './generators/index.js'


export class GenerateMicroFunctionPlugin implements Plugin {
  private readonly microFunctionGenerator = new MicroFunctionGenerator()

  apply(compiler: Compiler): void {
    GenerateMicroFunctionPlugin.register(compiler)

    compiler.hooks.compile.tapPromise(GenerateMicroFunctionPlugin.name, async (task: TaskWrapper) => {
      const artifacts = await this.microFunctionGenerator.compile(compiler, task)
      compiler.context.artifacts!.push(...artifacts)
    })
  }

  static register(compiler: Compiler): GenerateMicroFunctionPluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
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
