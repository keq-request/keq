import { Exception } from '~/exception/index.js'
import { KeqContext, KeqSharedContext } from '~/context/index.js'
import { KeqMiddleware } from '~/middleware/index.js'
import { KeqMiddlewareExecutor } from './executor.js'


export class KeqMiddlewareOrchestrator {
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected' = 'idle'
  context: KeqSharedContext
  executors: KeqMiddlewareExecutor[] = []

  constructor(
    context: KeqSharedContext,
    middlewares: KeqMiddleware[] = [],
  ) {
    this.context = context
    this.executors = middlewares.map((mw) => new KeqMiddlewareExecutor(mw))
  }

  private async run(): Promise<void> {
    const context = new KeqContext(this)

    const dispatch = async (i: number): Promise<void> => {
      if (i >= this.executors.length) {
        return
      }

      const executor = this.executors[i]
      await executor.execute(context, () => dispatch(i + 1))
    }

    await dispatch(0)
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
