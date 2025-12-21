import { ListrTaskWrapper } from 'listr2'
import { CompilerContext } from '../../types/index.js'

export type TaskWrapper = ListrTaskWrapper<CompilerContext, any, any>
