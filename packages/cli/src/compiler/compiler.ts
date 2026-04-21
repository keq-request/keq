

import { Listr } from 'listr2'
import { AsyncParallelHook, AsyncSeriesBailHook, AsyncSeriesHook, SyncHook } from 'tapable'
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
  InitializePlugin,
  TerminalSelectPluginOptions,
} from '~/plugins/index.js'
import { Address } from '~/types/index.js'


interface Options extends SetupTaskOptions {
  build: boolean
  persist?: boolean
  silent?: boolean
  fresh?: boolean
  interactive?: boolean | TerminalSelectPluginOptions
}


export class Compiler {
  context: CompilerContext = {}

  hooks: CompilerHooks = {
    setup: new AsyncParallelHook<[TaskWrapper]>(['task']),
    afterSetup: new AsyncSeriesHook<[TaskWrapper]>(['task']),

    beforeDownload: new AsyncSeriesHook<[TaskWrapper]>(['task']),
    download: new AsyncSeriesBailHook<[Address, ModuleDefinition, TaskWrapper], string | undefined>(['address', 'moduleDefinition', 'task']),
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

    new InitializePlugin({
      build: options.build,
      fresh: options.fresh,
      interactive: options.interactive,
    }).apply(this)
  }

  async run(): Promise<void> {
    const options = this.options

    const tasks = new Listr<CompilerContext, 'default' | 'silent'>(
      [
        createSetupTask(this, options),
        createDownloadTask(this, { skipIgnoredModules: !options.interactive }),
        createCompileTask(this, { enabled: !!options.build }),
        createPersistTask(this, { enabled: !!options.persist }),
      ],
      {
        concurrent: false,
        renderer: options.silent ? 'silent' : 'default',
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
