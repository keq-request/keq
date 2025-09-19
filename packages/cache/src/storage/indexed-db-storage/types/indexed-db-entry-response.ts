export interface IndexedDBEntryResponse {
  key: string
  responseBody: ArrayBuffer
  responseHeaders: [string, string][]
  responseStatus: number
  responseStatusText: string
}
