export interface CacheEntryOptions {
  key: string
  response: Response
  size: number
  expiredAt?: Date
}
