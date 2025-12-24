import { AsyncSeriesWaterfallHook } from 'tapable'
import { Plugin } from '~/types/index.js'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { ApiDocumentV3_1, Artifact } from '~/models/index.js'
import { GenerateNestjsModulePluginMetadata, MetadataStorage } from './constants/index.js'
import { NestjsModuleGenerator } from './generators/nestjs-module.generator.js'


export class GenerateNestjsModulePlugin implements Plugin {
  private readonly nestjsModuleGenerator = new NestjsModuleGenerator()

  apply(compiler: Compiler): void {
    GenerateNestjsModulePlugin.register(compiler)

    compiler.hooks.compile.tapPromise(GenerateNestjsModulePlugin.name, async (task) => {
      const artifacts = await this.nestjsModuleGenerator.compile(compiler, task)
      compiler.context.artifacts!.push(...artifacts)
    })
  }

  static register(compiler: Compiler): GenerateNestjsModulePluginMetadata {
    if (!MetadataStorage.has(compiler)) {
      MetadataStorage.set(compiler, {
        hooks: {
          afterNestjsModuleArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, ApiDocumentV3_1, TaskWrapper]>(['artifact', 'document', 'task']),
        },
      })
    }

    return MetadataStorage.get(compiler)!
  }

  static of(compiler: Compiler): GenerateNestjsModulePluginMetadata | undefined {
    return MetadataStorage.get(compiler)
  }
}
