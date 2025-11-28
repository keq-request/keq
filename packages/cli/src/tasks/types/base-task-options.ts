import { TaskContext } from './task-context.js'


export interface BaseTaskOptions {
  enabled?: boolean | ((ctx: TaskContext) => boolean | Promise<boolean>)
  skip?: boolean | string | ((ctx: TaskContext) => boolean | string | Promise<boolean | string>)
}
