import type { ApiDocumentV3_1 } from '~/models/api-document_v3_1.js'
import type { IndexedOperation, SearchResult, SearchResultDetail } from './types.js'
import { embed, embedDocuments, cosineSimilarity } from './embedder.js'

export class SearchEngine {
  private operations: IndexedOperation[] = []

  async buildIndex(documents: ApiDocumentV3_1[]): Promise<void> {
    this.operations = []

    for (const document of documents) {
      for (const op of document.operations) {
        const tags = op.operation.tags || []
        const summary = op.operation.summary || ''
        const description = op.operation.description || ''
        const text = [
          op.method.toUpperCase(),
          op.pathname,
          op.operationId,
          summary,
          description,
          ...tags,
        ].filter(Boolean).join(' ')

        this.operations.push({
          id: `${document.module.name}:${op.method}:${op.pathname}`,
          module: document.module.name,
          method: op.method.toUpperCase(),
          pathname: op.pathname,
          operationId: op.operationId,
          summary,
          description,
          tags,
          text,
          operation: op.operation,
        })
      }
    }

    const texts = this.operations.map((op) => op.text)
    const embeddings = await embedDocuments(texts)
    for (let i = 0; i < this.operations.length; i++) {
      this.operations[i].embedding = embeddings[i]
    }
  }

  async search(query: string, options?: { limit?: number; module?: string[] }): Promise<SearchResult[]> {
    const limit = options?.limit ?? 10
    const modules = options?.module

    let candidates = this.operations
    if (modules && modules.length > 0) {
      candidates = candidates.filter((op) => modules.includes(op.module))
    }

    if (candidates.length === 0) return []

    const [queryEmbedding] = await embed([query])

    const scored = candidates
      .filter((op) => op.embedding)
      .map((op) => ({
        op,
        score: cosineSimilarity(queryEmbedding, op.embedding!),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return scored.map(({ op, score }) => ({
      score: Math.round(score * 1000) / 1000,
      module: op.module,
      method: op.method,
      pathname: op.pathname,
      operationId: op.operationId,
      summary: op.summary,
      description: op.description,
      tags: op.tags,
    }))
  }

  getDetail(module: string, method: string, pathname: string): SearchResultDetail | undefined {
    const op = this.operations.find(
      (o) => o.module === module && o.method === method.toUpperCase() && o.pathname === pathname,
    )
    if (!op) return undefined

    const operation = op.operation as Record<string, unknown>

    return {
      score: 1,
      module: op.module,
      method: op.method,
      pathname: op.pathname,
      operationId: op.operationId,
      summary: op.summary,
      description: op.description,
      tags: op.tags,
      parameters: (operation.parameters || []) as unknown[],
      requestBody: operation.requestBody || null,
      responses: operation.responses || null,
    }
  }

  listModules(): string[] {
    return [...new Set(this.operations.map((op) => op.module))]
  }
}
