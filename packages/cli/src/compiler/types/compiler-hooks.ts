import { AsyncParallelHook, AsyncSeriesBailHook, AsyncSeriesHook, AsyncSeriesWaterfallHook, SyncHook } from 'tapable'
import { TaskWrapper } from '../tasks/index.js'
import { ModuleDefinition } from '~/models/index.js'


export interface CompilerHooks {
  setup: AsyncParallelHook<[TaskWrapper]>
  afterSetup: AsyncSeriesHook<[TaskWrapper]>

  beforeDownload: AsyncSeriesHook<[TaskWrapper]>
  download: AsyncSeriesBailHook<[string, ModuleDefinition, TaskWrapper], string | undefined> /* Return Json String */
  openapiTransform: AsyncSeriesWaterfallHook<[object, ModuleDefinition, TaskWrapper], object>
  afterDownload: AsyncSeriesHook<[TaskWrapper]>

  // afterValidate: AsyncSeriesHook<[TaskWrapper]>
  // afterShaking: AsyncSeriesHook<[TaskWrapper]>

  beforeCompile: AsyncSeriesHook<[TaskWrapper]>
  compile: AsyncParallelHook<[TaskWrapper]>
  afterCompile: AsyncSeriesHook<[TaskWrapper]>

  beforePersist: AsyncSeriesHook<[TaskWrapper]>
  persist: AsyncParallelHook<[TaskWrapper]>
  afterPersist: AsyncSeriesHook<[TaskWrapper]>

  done: SyncHook<[]>
}
