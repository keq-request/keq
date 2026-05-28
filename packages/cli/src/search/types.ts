export interface SearchResult {
  score: number
  module: string
  method: string
  pathname: string
  operationId: string
  summary: string
  description: string
  tags: string[]
}

export interface SearchResultDetail extends SearchResult {
  parameters: unknown[]
  requestBody: unknown
  responses: unknown
}

export interface IndexedOperation {
  id: string
  module: string
  method: string
  pathname: string
  operationId: string
  summary: string
  description: string
  tags: string[]
  text: string
  embedding?: Float32Array
  operation: unknown
}
