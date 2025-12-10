import { Exception } from 'keq'

export class CacheException extends Exception {
  constructor(message: string) {
    super(`[@keq-request/cache] ${message}`)
  }
}
