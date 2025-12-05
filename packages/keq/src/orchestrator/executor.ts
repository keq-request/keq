import { Exception } from '~/exception/index.js'
import { KeqExecutionContext } from '~/context/index.js'
import { KeqNext } from '~/middleware/types/keq-next.js'
import { KeqMiddleware } from '~/middleware/index.js'
import { KeqMiddlewareContext } from '~/context/middleware-context'

export class KeqMiddlewareExecutor {
  readonly name: string
  status: 'idle' | 'pending' | 'canceled' | 'fulfilled' | 'rejected' = 'idle'
  context: KeqMiddlewareContext

  constructor(
    public readonly middleware: KeqMiddleware,
  ) {
    this.name = middleware.__keqMiddlewareName__ || middleware.name
    this.context = new KeqMiddlewareContext(this)
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

      if (this.status === 'pending') {
        this.status = 'fulfilled'
      }
    } catch (error) {
      if (this.status === 'pending') {
        this.status = 'rejected'
      }
      throw error
    }
  }
}
