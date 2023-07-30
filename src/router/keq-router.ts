import { KeqMiddleware } from '~/types/keq-middleware'


export abstract class KeqRouter {
  protected middlewares: KeqMiddleware[]

  constructor(middlewares: KeqMiddleware[]) {
    this.middlewares = middlewares
  }

  use(middleware: KeqMiddleware, ...middlewares: KeqMiddleware[]): this {
    this.middlewares.push(middleware, ...middlewares)
    return this
  }

  abstract routes(): KeqMiddleware
}
