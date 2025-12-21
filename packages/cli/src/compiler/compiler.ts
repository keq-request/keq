

import { Listr } from 'listr2'
import { AsyncParallelHook, AsyncSeriesBailHook, AsyncSeriesHook, AsyncSeriesWaterfallHook, SyncHook } from 'tapable'
import { CompilerHooks, CompilerContext } from './types/index.js'
import {
  ModuleDefinition,
} from '~/models/index.js'
import {
  createCompileTask,
  createDownloadTask,
  createPersistTask,
  createSetupTask,
  SetupTaskOptions,
  TaskWrapper,
} from './tasks/index.js'
import {
  perfectErrorMessage,
  printInformation,
} from './intercepter/index.js'
import {
  ModuleFilterPlugin,
  DownloadHttpFilePlugin,
  DownloadLocalFilePlugin,
  ShakingPlugin,
  TransformToOpenAPIv3_1Plugin,
  GenerateDeclarationPlugin,
  GenerateMicroFunctionPlugin,
  TerminalSelectPlugin,
  TerminalSelectPluginOptions,
} from '~/plugins/index.js'


interface Options extends SetupTaskOptions {
  modules: string[]
  build: boolean
  interactive?: boolean | TerminalSelectPluginOptions
}


export class Compiler {
  context: CompilerContext = {}

  hooks: CompilerHooks = {
    setup: new AsyncParallelHook<[TaskWrapper]>(['task']),
    afterSetup: new AsyncSeriesHook<[TaskWrapper]>(['task']),

    beforeDownload: new AsyncSeriesHook<[TaskWrapper]>(['task']),
    download: new AsyncSeriesBailHook<[string, ModuleDefinition, TaskWrapper], string | undefined>(['address', 'moduleDefinition', 'task']),
    openapiTransform: new AsyncSeriesWaterfallHook<[object, ModuleDefinition, TaskWrapper], object>(['openapi', 'moduleDefinition', 'task']),
    afterDownload: new AsyncSeriesHook<[TaskWrapper]>(['task']),

    beforeCompile: new AsyncSeriesHook<[TaskWrapper]>(['task']),
    compile: new AsyncParallelHook<[TaskWrapper]>(['task']),
    afterCompile: new AsyncSeriesHook<[TaskWrapper]>(['task']),

    beforePersist: new AsyncSeriesHook<[TaskWrapper]>(['task']),
    persist: new AsyncParallelHook<[TaskWrapper]>(['task']),
    afterPersist: new AsyncSeriesHook<[TaskWrapper]>(['task']),

    done: new SyncHook<[]>(),
  }

  constructor(
    public options: Options,
  ) {
    for (const hook of Object.values(this.hooks)) {
      hook.intercept(perfectErrorMessage())
    }

    this.hooks.afterSetup.intercept(printInformation(0))
    this.hooks.afterPersist.intercept(printInformation(0))

    new DownloadHttpFilePlugin().apply(this)
    new DownloadLocalFilePlugin().apply(this)
    new TransformToOpenAPIv3_1Plugin().apply(this)

    new GenerateDeclarationPlugin().apply(this)
    new GenerateMicroFunctionPlugin().apply(this)

    if (options.modules && options.modules.length) {
      new ModuleFilterPlugin({
        includes: options.modules,
      }).apply(this)
    }

    if (this.options.build) {
      new ShakingPlugin().apply(this)
    }

    if (this.options.interactive) {
      new TerminalSelectPlugin(typeof options.interactive === 'object' ? options.interactive : { mode: 'except' }).apply(this)
    }
  }

  async run(): Promise<void> {
    const options = this.options

    const tasks = new Listr<CompilerContext>(
      [
        createSetupTask(this, options),
        createDownloadTask(this, { skipIgnoredModules: !options.interactive }),
        createCompileTask(this, { enabled: !!options.build }),
        createPersistTask(this),
      ],
      {
        concurrent: false,
        renderer: 'default',
        rendererOptions: {
          suffixSkips: true,
          collapseSubtasks: false,
          collapseErrors: false,
        },
      },
    )

    await tasks.run(this.context)

    await this.hooks.done.promise()
  }
}
