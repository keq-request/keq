import { AsyncParallelHook, AsyncSeriesBailHook, AsyncSeriesHook, SyncHook } from 'tapable'
import { TaskWrapper } from '../tasks/index.js'
import { ModuleDefinition } from '~/models/index.js'
import { Address } from '~/types/index.js'


export interface CompilerHooks {
  setup: AsyncParallelHook<[TaskWrapper]>
  afterSetup: AsyncSeriesHook<[TaskWrapper]>

  beforeDownload: AsyncSeriesHook<[TaskWrapper]>
  download: AsyncSeriesBailHook<[Address, ModuleDefinition, TaskWrapper], string | undefined> /* Return Json String */
  beforeValidate: AsyncSeriesHook<[object, ModuleDefinition]>
  afterDownload: AsyncSeriesHook<[TaskWrapper]>

  beforeCompile: AsyncSeriesHook<[TaskWrapper]>
  compile: AsyncParallelHook<[TaskWrapper]>
  afterCompile: AsyncSeriesHook<[TaskWrapper]>

  beforePersist: AsyncSeriesHook<[TaskWrapper]>
  persist: AsyncParallelHook<[TaskWrapper]>
  afterPersist: AsyncSeriesHook<[TaskWrapper]>

  done: SyncHook<[]>
}
