import type { ApiDocumentV3_1 } from '~/models/api-document_v3_1.js'
import type { IndexedOperation, SearchResult, SearchResultDetail } from './types.js'
import { embed, embedDocuments, cosineSimilarity } from './embedder.js'

export class SearchEngine {
  private operations: IndexedOperation[]
  private embeddingsReady = false

  /**
   * 文档在构造时一次性解析为操作元数据(纯字符串处理,不加载语义模型)。
   * embedding(检索索引)推迟到首次 `search` 时惰性构建。
   */
  constructor(documents: ApiDocumentV3_1[] = []) {
    this.operations = documents.flatMap((document) => document.operations.map((op) => {
      const tags = op.operation.tags || []
      const summary = op.operation.summary || ''
      const description = op.operation.description || ''

      return {
        id: `${document.module.name}:${op.method}:${op.pathname}`,
        module: document.module.name,
        method: op.method.toUpperCase(),
        pathname: op.pathname,
        operationId: op.operationId,
        summary,
        description,
        tags,
        text: [
          op.method.toUpperCase(),
          op.pathname,
          op.operationId,
          summary,
          description,
          ...tags,
        ].filter(Boolean).join(' '),
        operation: op.operation,
      }
    }))
  }

  /**
   * 惰性构建 embedding —— 此处才首次加载语义模型,且只构建一次。
   * 模型不可用时会抛出 EmbedderUnavailableError,由调用方处理。
   */
  private async ensureEmbeddings(): Promise<void> {
    if (this.embeddingsReady) return

    if (this.operations.length > 0) {
      const embeddings = await embedDocuments(this.operations.map((op) => op.text))
      for (let i = 0; i < this.operations.length; i++) {
        this.operations[i].embedding = embeddings[i]
      }
    }

    this.embeddingsReady = true
  }

  async search(query: string, options?: { limit?: number; module?: string[] }): Promise<SearchResult[]> {
    const limit = options?.limit ?? 10
    const modules = options?.module

    await this.ensureEmbeddings()

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
