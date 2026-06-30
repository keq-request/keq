import { Global, Module } from '@nestjs/common'
import { KeqRequest } from 'keq'
import { KeqMiddlewareConsumer } from './keq-middleware-consumer.js'


@Global()
@Module({
  providers: [
    { provide: KeqRequest, useFactory: () => new KeqRequest() },
    KeqMiddlewareConsumer,
  ],
  exports: [KeqRequest, KeqMiddlewareConsumer],
})
export class KeqModule {}
