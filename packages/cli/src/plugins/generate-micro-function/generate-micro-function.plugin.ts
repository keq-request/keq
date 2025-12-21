import { AsyncSeriesWaterfallHook } from 'tapable'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Plugin } from '~/types/index.js'
import { Artifact, OperationDefinition } from '~/models/index.js'
import { GenerateMicroFunctionPluginMetadata, metadataStorage } from './constants/index.js'
import { MicroFunctionGenerator } from './generators/index.js'


export class GenerateMicroFunctionPlugin implements Plugin {
  private readonly microFunctionGenerator = new MicroFunctionGenerator()

  apply(compiler: Compiler): void {
    metadataStorage.set(compiler, {
      hooks: {
        afterEntrypointGenerated: new AsyncSeriesWaterfallHook<[Artifact, TaskWrapper]>(['artifact', 'task']),
        afterMicroFunctionGenerated: new AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper]>(['artifact', 'operationDefinition', 'task']),
      },
    })

    compiler.hooks.compile.tapPromise(GenerateMicroFunctionPlugin.name, async (task: TaskWrapper) => {
      const artifacts = await this.microFunctionGenerator.compile(compiler, task)
      compiler.context.artifacts!.push(...artifacts)
    })
  }

  static of(compiler: Compiler): GenerateMicroFunctionPluginMetadata {
    return metadataStorage.get(compiler)!
  }
}
