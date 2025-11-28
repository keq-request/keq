/* eslint-disable @typescript-eslint/no-unsafe-return */

import * as R from 'ramda'
import { AsyncSeriesHook, AsyncSeriesWaterfallHook, FullTap, Hook, InnerCallback, SyncHook } from 'tapable'
import { Artifact } from './tasks/utils/artifact.js'
import { OperationDefinition } from './tasks/utils/operation-definition.js'
import { SchemaDefinition } from './tasks/utils/schema-definition.js'
import { TaskContext } from './tasks/types/task-context.js'
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
} from './tasks/index.js'


interface Options extends SetupTaskOptions {
  build: boolean | {
    shaking?: ShakingTaskOptions
  }

  interactive?: boolean | InteractiveTaskOptions
}

function perfectErrorMessage<T extends FullTap>(tap: T): T {
  const fn = tap.fn

  function prefix(err: unknown): void {
    if (err instanceof Error) {
      err.message = `[Plugin: ${tap.name}] ${err.message}`
    }
  }

  if (tap.type === 'promise') {
    tap.fn = async (...args: any[]) => {
      try {
        return await fn(...args)
      } catch (err) {
        prefix(err)
        throw err
      }
    }
  }

  if (tap.type === 'sync') {
    tap.fn = (...args: any[]) => {
      try {
        return fn(...args)
      } catch (err) {
        prefix(err)
        throw err
      }
    }
  }

  if (tap.type === 'async') {
    tap.fn = (...args: any[]) => {
      const callback = R.last(args) as InnerCallback<Error, any>

      return fn(...R.init(args), (err: Error | null, result: any) => {
        prefix(err)
        return callback(err, result)
      })
    }
  }

  return tap
}

export class Compiler {
  context: TaskContext = {}

  hooks = {
    // core
    afterSetup: new AsyncSeriesHook<[]>(),
    afterDownload: new AsyncSeriesHook<[]>(),
    afterValidate: new AsyncSeriesHook<[]>(),
    afterShaking: new AsyncSeriesHook<[]>(),
    afterCompile: new AsyncSeriesHook<[]>(),
    afterPersist: new AsyncSeriesHook<[]>(),
    done: new SyncHook<[]>(),

    // compile
    afterCompileKeqRequest: new AsyncSeriesWaterfallHook<[Artifact], Artifact>(['artifact']),
    afterCompileSchema: new AsyncSeriesWaterfallHook<[Artifact, SchemaDefinition], Artifact>(['artifact', 'schema']),
    afterCompileOperationType: new AsyncSeriesWaterfallHook<[Artifact, OperationDefinition], Artifact>(['artifact', 'operation']),
    afterCompileOperationRequest: new AsyncSeriesWaterfallHook<[Artifact, OperationDefinition], Artifact>(['artifact', 'operation']),
  }

  constructor(
    public options: Options,
  ) {
    for (const hook of Object.values(this.hooks)) {
      hook.intercept({
        register: perfectErrorMessage,
      })
    }
  }

  async run(): Promise<void> {
    const options = this.options

    const tasks = new Listr<TaskContext>(
      [
        createSetupTask(this, options),
        createDownloadTask(this, { skipIgnoredModules: !options.interactive }),
        createValidateTask(this, { enabled: !!options.build }),
        createInteractiveTask({ enabled: !!options.interactive, ...(typeof options.interactive === 'object' ? options.interactive : { mode: 'except' }) }),
        createShakingTask(this, { enabled: !!options.build, ...(typeof options.build === 'object' ? options.build.shaking : undefined) }),
        createCompileTask(this, { enabled: !!options.build }),
        createPersistTask(this, { enabled: !!options.build }),
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
