import { KeqMiddlewareOptionsParameter } from './keq-middleware-options.js'


export interface KeqContextOptions extends KeqMiddlewareOptionsParameter {
  [key: string]: any
}
