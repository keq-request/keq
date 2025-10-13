import * as path from 'path'
import * as fs from 'fs-extra'
import { ListrTask } from 'listr2'
import { Context } from '~/types/context'


export function createPersistTask(): ListrTask<Context> {
  return {
    title: 'Persist',
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
        await fs.writeFile(realpath, artifact.toCode())

        completed += 1
        task.output = `Persisted ${completed}/${total} files`
      }))
    },
  }
}
