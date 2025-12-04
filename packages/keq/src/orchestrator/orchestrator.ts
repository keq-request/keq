import { Exception, TypeException } from '~/exception/index.js'
import { KeqExecutionContext, KeqSharedContext } from '~/context/index.js'
import { KeqMiddleware } from '~/middleware/index.js'
import { KeqMiddlewareExecutor } from './executor.js'
import { cloneSharedContext } from '~/context/utils/clone-shared-context.js'
import { assignSharedContext } from '~/context/utils/assign-shared-context.js'


export class KeqMiddlewareOrchestrator {
  main?: {
    orchestrator: KeqMiddlewareOrchestrator
    index: number
  }

  status: 'idle' | 'pending' | 'fulfilled' | 'rejected' = 'idle'
  context: KeqSharedContext
  executors: KeqMiddlewareExecutor[] = []

  current: number = -1

  constructor(
    context: KeqSharedContext,
    middlewares: KeqMiddleware[] = [],
  ) {
    this.context = context
    this.executors = middlewares.map((mw) => new KeqMiddlewareExecutor(mw))
  }

  private async run(): Promise<void> {
    if (this.executors.length === 0) return

    const context = new KeqExecutionContext(this)
    const next = async (): Promise<void> => {
      const last = this.current

      const current = last + 1
      if (current < this.executors.length) {
        this.current = current
        const executor = this.executors[current]
        await executor.execute(context, () => next.call(this))
        this.current = last
      }
    }

    await next.call(this)
  }

  async execute(): Promise<void> {
    if (this.status !== 'idle') {
      throw new Exception('Orchestrator has already been executed.')
    }

    this.status = 'pending'

    try {
      await this.run()
      this.status = 'fulfilled'
    } catch (error) {
      this.status = 'rejected'
      throw error
    }
  }

  fork(): KeqMiddlewareOrchestrator {
    const context = cloneSharedContext(this.context)
    const next = this.current + 1
    const middlewares = this.executors.slice(next)
      .map((executor) => executor.middleware)

    const forkedOrchestrator = new KeqMiddlewareOrchestrator(context, middlewares)
    forkedOrchestrator.main = {
      orchestrator: this.main ? this.main.orchestrator : this,
      index: this.main ? this.main.index + next : next,
    }

    return forkedOrchestrator
  }

  merge(source: KeqMiddlewareOrchestrator): void {
    if (!source.main) throw new TypeException('Source orchestrator is not a forked orchestrator.')

    const target = this.main ? this.main.orchestrator : this
    if (source.main.orchestrator !== target) throw new TypeException('Cannot rebase to unrelated orchestrator.')
    if (source.main.index !== this.current + 1) throw new TypeException('Cannot rebase from unrelated execution point.')

    // copy context
    assignSharedContext(this.context, source.context)

    // copy executors status
    for (const [i, executor] of this.executors.slice(source.main.index).entries()) {
      executor.status = source.executors[i].status
    }
  }
}
