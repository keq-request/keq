import { KeqMiddleware } from '../types'


export function getMiddlewareName(middleware: KeqMiddleware): string {
  return middleware.__keqMiddlewareName__ || middleware.name || 'anonymous'
}
