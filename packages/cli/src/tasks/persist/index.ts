import * as path from 'path'
import fs from 'fs-extra'
import { ListrTask } from 'listr2'
import { TaskContext } from '~/tasks/types/task-context.js'
import { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler } from '~/compiler.js'


function createPersistArtifactTask(): ListrTask<TaskContext> {
  return {
    title: 'Write files',
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

function createPersistIgnoreTask(): ListrTask<TaskContext> {
  return {
    title: 'Update .keqignore',
    task: async (context, task) => {
      if (!context.setup) throw new Error('Please run setup task first.')

      const matcher = context.setup.matcher
      await matcher.write('.keqignore')
    },
  }
}


function main(): ListrTask<TaskContext> {
  return {
    task: (context, task) => task.newListr(
      [
        createPersistArtifactTask(),
        createPersistIgnoreTask(),
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

export function createPersistTask(compiler: Compiler, options?: BaseTaskOptions): ListrTask<TaskContext> {
  return {
    title: 'Persist',
    enabled: options?.enabled,
    skip: options?.skip,
    task: (context, task) => task.newListr(
      [
        main(),
        {
          task: (context, task) => compiler.hooks.afterPersist
            .promise(),
        },
      ],
      {
        concurrent: false,
      },
    ),
  }
}
