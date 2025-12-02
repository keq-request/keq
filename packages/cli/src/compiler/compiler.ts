

import * as R from 'ramda'
import { AsyncSeriesHook, AsyncSeriesWaterfallHook, FullTap, Hook, HookInterceptor, InnerCallback, SyncHook } from 'tapable'
import { Listr } from 'listr2'
import {
  createCompileTask,
  createDownloadTask,
  createInteractiveTask,
  createPersistTask,
  createSetupTask,
  createShakingTask,
  createValidateTask,
  InteractiveTaskOptions,
  SetupTaskOptions,
  ShakingTaskOptions,
  type TaskWrapper,
  type TaskContext,
  Artifact,
  OperationDefinition,
  SchemaDefinition,
} from '../tasks/index.js'
import { perfectErrorMessage } from './intercepter/perfect-error-message.js'
import { printInformation } from './intercepter/print-information.js'


interface Options extends SetupTaskOptions {
  build: boolean | {
    shaking?: ShakingTaskOptions
  }

  interactive?: boolean | InteractiveTaskOptions
}


export class Compiler {
  context: TaskContext = {}

  hooks = {
    // core
    afterSetup: new AsyncSeriesHook<[TaskWrapper]>(['task']),
    afterDownload: new AsyncSeriesHook<[TaskWrapper]>(['task']),
    afterValidate: new AsyncSeriesHook<[TaskWrapper]>(['task']),
    afterShaking: new AsyncSeriesHook<[TaskWrapper]>(['task']),
    afterCompile: new AsyncSeriesHook<[TaskWrapper]>(['task']),
    afterPersist: new AsyncSeriesHook<[TaskWrapper]>(['task']),
    done: new SyncHook<[]>(),

    // compile
    afterCompileKeqRequest: new AsyncSeriesWaterfallHook<[Artifact, TaskWrapper], Artifact>(['artifact', 'task']),
    afterCompileSchema: new AsyncSeriesWaterfallHook<[Artifact, SchemaDefinition, TaskWrapper], Artifact>(['artifact', 'schema', 'task']),
    afterCompileOperationType: new AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper], Artifact>(['artifact', 'operation', 'task']),
    afterCompileOperationRequest: new AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper], Artifact>(['artifact', 'operation', 'task']),
  }

  constructor(
    public options: Options,
  ) {
    for (const hook of Object.values(this.hooks)) {
      hook.intercept(perfectErrorMessage())
    }

    this.hooks.afterSetup.intercept(printInformation(0))
    this.hooks.afterPersist.intercept(printInformation(0))
  }

  async run(): Promise<void> {
    const options = this.options

    const tasks = new Listr<TaskContext>(
      [
        createSetupTask(this, options),
        createDownloadTask(this, { skipIgnoredModules: !options.interactive }),
        createValidateTask(this),
        createInteractiveTask({ enabled: !!options.interactive, ...(typeof options.interactive === 'object' ? options.interactive : { mode: 'except' }) }),
        createShakingTask(this, { enabled: !!options.build, ...(typeof options.build === 'object' ? options.build.shaking : undefined) }),
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
