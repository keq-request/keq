import { Listr } from 'listr2'
import { CliOptions } from '../types/cli-options.js'
import { Context } from '../types/context.js'
import { createSetupTask } from './setup/index.js'
import { createDownloadTask } from './download/index.js'
import { createValidateTask } from './validate/index.js'
import { createShakingTask } from './shaking/index.js'
import { createPersistTask } from './persist/index.js'
import { createCompileTask } from './compile/index.js'


export async function build(cli: CliOptions): Promise<void> {
  const tasks = new Listr<Context>(
    [
      createSetupTask(),
      createDownloadTask(),
      createValidateTask(),
      createShakingTask(),
      createCompileTask(),
      createPersistTask(),
    ],
    {
      concurrent: false,
    },
  )

  await tasks.run({ cli })
}
