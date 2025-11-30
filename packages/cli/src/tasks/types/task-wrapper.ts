import { ListrTaskWrapper } from 'listr2'
import { TaskContext } from './task-context.js'

export type TaskWrapper = ListrTaskWrapper<TaskContext, any, any>
