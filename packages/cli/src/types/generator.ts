import { Promisable } from 'type-fest'
import { Compiler, TaskWrapper } from '~/compiler/index.js'
import { Artifact } from '~/models/index.js'


export interface Generator {
  compile(compiler: Compiler, task: TaskWrapper): Promisable<Artifact[]>
}
