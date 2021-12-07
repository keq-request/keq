import { Context } from './context'


export type InnerMiddleware = () => Promise<void>
export type Middleware = (ctx: Context, next: InnerMiddleware) => Promise<void>
export type MiddlewareMatcher = (ctx: Context) => boolean
