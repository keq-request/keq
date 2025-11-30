import { Exception } from '~/exception/index.js'
import { KeqExecutionContext } from '~/context/index.js'
import { KeqNext } from '~/middleware/types/keq-next.js'
import { KeqMiddleware } from '~/middleware/index.js'

export class KeqMiddlewareExecutor {
  readonly name: string
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected' = 'idle'

  constructor(
    public readonly middleware: KeqMiddleware,
  ) {
    this.name = middleware.__keqMiddlewareName__ || middleware.name
  }

  async execute(context: KeqExecutionContext, next: KeqNext): Promise<void> {
    if (this.status !== 'idle') {
      throw new Exception(`Middleware "${this.name}" has already been executed.`)
    }

    try {
      this.status = 'pending'
      context.emitter.emit('middleware:before', { context })
      await this.middleware(context, next)
      context.emitter.emit('middleware:after', { context })
      this.status = 'fulfilled'
    } catch (error) {
      this.status = 'rejected'
      throw error
    }
  }

  fork(): KeqMiddlewareExecutor {
    const executor = new KeqMiddlewareExecutor(this.middleware)
    executor.status = this.status
    return executor
  }
}
