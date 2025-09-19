export interface KeqCacheEvents {
  onNetworkResponse?: (response: Response, cache?: Response) => void
}
