import * as path from 'path'
import fs from 'fs-extra'
import { ListrTask } from 'listr2'
import { TaskContext } from '~/tasks/types/task-context.js'


interface PersistTaskOptions {
  enabled?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>)
  skip?: boolean | string | ((ctx: TaskContext) => boolean | string | Promise<boolean | string>)

  persistIgnore?: boolean
  persistArtifacts?: boolean
}

function createPersistArtifactTask(options?: PersistTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Write files',
    enabled: options?.persistArtifacts,
    skip: options?.skip,
    task: async (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')
      if (!context.compiled) throw new Error('Please run compile task first.')

      const rc = context.setup.rc
      const artifacts = context.compiled.artifacts

      for (const artifact of artifacts) {
        artifact.changeFileNameCase(rc.fileNamingStyle)
      }

      const total = artifacts.length
      let completed = 0

      await Promise.all(artifacts.map(async (artifact) => {
        const realpath = `./${path.join(rc.outdir, artifact.filepath)}`
        await fs.ensureFile(realpath)
        await fs.writeFile(realpath, artifact.toCode({ esm: !!rc.esm }))

        completed += 1
        task.output = `Persisted ${completed}/${total} files`
      }))
    },
  }
}

function createPersistIgnoreTask(options?: PersistTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Update .keqignore',
    enabled: options?.persistIgnore,
    skip: options?.skip,
    task: async (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')

      const matcher = context.setup.matcher
      await matcher.write('.keqignore')
    },
  }
}


export function createPersistTask(options?: PersistTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Persist',
    enabled: options?.enabled,
    skip: options?.skip,
    task: (context, task) => task.newListr(
      [
        createPersistArtifactTask(options),
        createPersistIgnoreTask(options),
      ],
      {
        concurrent: true,
        rendererOptions: {
          collapseSubtasks: true,
        },
      },
    ),
  }
}
