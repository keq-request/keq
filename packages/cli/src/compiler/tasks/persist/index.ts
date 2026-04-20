import * as path from 'path'
import fs from 'fs-extra'
import { ListrTask } from 'listr2'
import { BaseTaskOptions } from '../types/base-task-options.js'
import type { Compiler, CompilerContext } from '~/compiler/index.js'
import { Asset } from '~/models/index.js'


function createPersistArtifactTask(): ListrTask<CompilerContext> {
  return {
    title: 'Write files',
    task: async (context, task) => {
      if (!context.rc) throw new Error('Please run setup task first.')
      if (!context.artifacts || context.artifacts.length === 0) {
        task.skip('No compiled artifacts to persist.')
        return
      }

      const rc = context.rc
      const artifacts = context.artifacts

      const total = artifacts.length
      let completed = 0

      const files = await Promise.all(artifacts.map(async (artifact): Promise<Asset> => {
        const realpath = `./${path.join(rc.outdir, artifact.filepath)}`
        await fs.ensureFile(realpath)
        await fs.writeFile(realpath, artifact.renderer())

        completed += 1
        task.output = `Persisted ${completed}/${total} files`

        return new Asset(path.resolve(realpath))
      }))

      context.assets = files
    },
  }
}

function createPersistIgnoreTask(): ListrTask<CompilerContext> {
  return {
    title: 'Update .keqfilter',
    task: async (context, task) => {
      if (!context.matcher) throw new Error('Please run setup task first.')

      const matcher = context.matcher
      await matcher.write('.keqfilter')
    },
  }
}


function main(): ListrTask<CompilerContext> {
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

export function createPersistTask(compiler: Compiler, options?: BaseTaskOptions): ListrTask<CompilerContext> {
  return {
    title: 'Persist',
    enabled: options?.enabled,
    skip: options?.skip,
    task: (context, task) => task.newListr(
      [
        {
          task: (context, task) => compiler.hooks.beforePersist
            .promise(task),
        },
        main(),
        {
          task: (context, task) => compiler.hooks.afterPersist
            .promise(task),
        },
      ],
      {
        concurrent: false,
      },
    ),
  }
}
