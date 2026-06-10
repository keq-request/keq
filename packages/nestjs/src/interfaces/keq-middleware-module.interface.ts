import type { KeqMiddlewareConsumer } from './keq-middleware-consumer.interface.js'


export interface KeqMiddlewareModule {
  configureKeqMiddleware(consumer: KeqMiddlewareConsumer): void
}
