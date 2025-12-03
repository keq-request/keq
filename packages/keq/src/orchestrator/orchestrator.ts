import { Exception } from '~/exception/index.js'
import { KeqExecutionContext, KeqSharedContext } from '~/context/index.js'
import { KeqMiddleware } from '~/middleware/index.js'
import { KeqMiddlewareExecutor } from './executor.js'


export class KeqMiddlewareOrchestrator {
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
    const context = this.context.clone()
    const middlewares = this.executors
      .filter((executor) => executor.status === 'idle')
      .map((executor) => executor.middleware)

    const forkedOrchestrator = new KeqMiddlewareOrchestrator(context, middlewares)
    return forkedOrchestrator
  }
}
