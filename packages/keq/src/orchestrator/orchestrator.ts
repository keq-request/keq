import { Exception, TypeException } from '~/exception/index.js'
import { KeqExecutionContext, KeqSharedContext } from '~/context/index.js'
import { KeqMiddleware } from '~/middleware/index.js'
import { KeqMiddlewareExecutor } from './executor.js'
import { cloneSharedContext } from '~/context/utils/clone-shared-context.js'
import { assignSharedContext } from '~/context/utils/assign-shared-context.js'


interface KeqMiddlewareOrchestratorPointer {
  orchestrator: KeqMiddlewareOrchestrator
  index: number
}

export type KeqMiddlewareOrchestratorStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected'

export class KeqMiddlewareOrchestrator {
  main?: KeqMiddlewareOrchestratorPointer

  status: KeqMiddlewareOrchestratorStatus = 'idle'
  context: KeqSharedContext
  executors: KeqMiddlewareExecutor[] = []

  current: number = -1

  constructor(
    context: KeqSharedContext,
    middlewares: KeqMiddleware[] = [],
    inherit?: {
      main?: KeqMiddlewareOrchestratorPointer
    },
  ) {
    this.context = context
    this.executors = middlewares.map((mw) => new KeqMiddlewareExecutor(mw))

    if (inherit?.main) this.main = inherit.main
  }

  private cancelNotFinished(): void {
    const current = this.current

    for (let i = current + 1; i < this.executors.length; i++) {
      const executor = this.executors[i]
      if (executor.status === 'pending') {
        executor.status = 'canceled'
      }
    }
  }

  private async run(): Promise<void> {
    if (this.executors.length === 0) return

    // clone executors array to avoid mutation during execution
    const executors = [...this.executors]

    const next = async (nextIndex: number): Promise<void> => {
      if (nextIndex >= executors.length) return

      const nextExecutor = executors[nextIndex]
      if (nextExecutor.status !== 'idle') {
        const msg = `Cannot call next() because the next Middleware(${nextExecutor.name}) status is ${nextExecutor.status}. If you want to re-execute it, please fork a new orchestrator.`
        throw new Exception(msg)
      }

      if (this.current + 1 !== nextIndex) {
        const parentExecutor = executors[nextIndex - 1]
        const msg = parentExecutor
          ? `Cannot call next() outside Middleware(${parentExecutor.name}) runtime. You can fork a new orchestration and execute the forked one anywhere.`
          : 'Cannot jump to non-sequential middleware. Please call next() in order.'

        throw new Exception(msg)
      }

      const last = this.current
      this.current = nextIndex
      const context = new KeqExecutionContext(this, nextExecutor)

      try {
        await nextExecutor.execute(context, () => next.call(this, nextIndex + 1))
      } finally {
        if (this.current === last + 1) {
          this.current = last
        } else if (this.current > last) {
          this.cancelNotFinished()
          this.current = last
        }
      }
    }

    await next.call(this, 0)
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

    const forkedOrchestrator = new KeqMiddlewareOrchestrator(context, middlewares, {
      main: {
        orchestrator: this.main ? this.main.orchestrator : this,
        index: this.main ? this.main.index + next : next,
      },
    })

    return forkedOrchestrator
  }

  merge(source: KeqMiddlewareOrchestrator): void {
    if (!source.main) throw new TypeException('Source orchestrator is not a forked orchestrator.')

    const target = this.main ? this.main.orchestrator : this
    if (source.main.orchestrator !== target) throw new TypeException('Cannot rebase to unrelated orchestrator')
    if (source.main.index !== this.current + 1) throw new TypeException(`Cannot merge from non-current(expected: ${this.current + 1}, actual: ${source.main.index}) forked orchestrator`)

    // copy context
    assignSharedContext(this.context, source.context)

    // copy executors status
    for (const [i, executor] of this.executors.slice(source.main.index).entries()) {
      executor.status = source.executors[i].status
    }
  }
}
