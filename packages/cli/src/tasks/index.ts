import { Listr } from 'listr2'
import { TaskContext } from './types/task-context.js'
import { createSetupTask, SetupTaskOptions } from './setup/index.js'
import { createDownloadTask } from './download/index.js'
import { createValidateTask } from './validate/index.js'
import { createShakingTask } from './shaking/index.js'
import { createPersistTask } from './persist/index.js'
import { createCompileTask } from './compile/index.js'
import { createAppendIgnoreRulesTask, AppendIgnoreRulesTaskOptions } from './append-ignore-rule/index.js'
import { createInteractiveTask } from './interactive/index.js'


export type BuildOptions = SetupTaskOptions & {
  interactive?: boolean
}

export async function build(options: BuildOptions): Promise<void> {
  const tasks = new Listr<TaskContext>(
    [
      createSetupTask(options),
      createDownloadTask({ skipIgnoredModules: !options.interactive }),
      createValidateTask(),
      createInteractiveTask({ mode: 'except', override: true, enabled: !!options.interactive }),
      createShakingTask({ skipIgnoredModules: true, skipEmptyDocuments: true }),
      createCompileTask(),
      createPersistTask({ persistIgnore: false }),
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

  await tasks.run({})
}


export type IgnoreOptions = SetupTaskOptions & AppendIgnoreRulesTaskOptions & {
  build?: boolean
  interactive?: boolean
}

export async function ignore(options: IgnoreOptions): Promise<void> {
  const tasks = new Listr<TaskContext>(
    [
      createSetupTask(options),
      createAppendIgnoreRulesTask(options),
      createDownloadTask({ enabled: !!options.interactive }),
      createValidateTask({ enabled: !!options.interactive }),
      createInteractiveTask({ mode: options.mode, override: false, enabled: !!options.interactive }),
      createShakingTask({ enabled: !!options.build, skipIgnoredModules: true, skipEmptyDocuments: true }),
      createCompileTask({ enabled: !!options.build }),
      createPersistTask({ persistArtifacts: !!options.build, persistIgnore: true }),
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

  await tasks.run({})
}
