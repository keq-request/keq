export interface CacheEntryBuildOptions {
  key: string
  response: Response
  size?: number
  ttl?: number
  expiredAt?: Date
}
