import path from 'path'
import os from 'os'
import type { FeatureExtractionPipeline } from '@huggingface/transformers'

const MODEL_NAME = 'intfloat/multilingual-e5-small'
const CACHE_DIR = path.join(os.homedir(), '.cache', 'keq', 'models')

let transformers: typeof import('@huggingface/transformers') | null = null
let loadError: Error | null = null
let extractor: FeatureExtractionPipeline | null = null

export class EmbedderUnavailableError extends Error {
  constructor(cause?: Error) {
    super(
      '@huggingface/transformers is not installed. Semantic search is unavailable.\n' +
      'Run `pnpm add @huggingface/transformers` to enable this feature.',
    )
    this.name = 'EmbedderUnavailableError'
    if (cause) this.cause = cause
  }
}

async function loadTransformers(): Promise<typeof import('@huggingface/transformers')> {
  if (transformers) return transformers
  if (loadError) throw new EmbedderUnavailableError(loadError)
  try {
    transformers = await import('@huggingface/transformers')
    return transformers
  } catch (e) {
    loadError = e instanceof Error ? e : new Error(String(e))
    throw new EmbedderUnavailableError(loadError)
  }
}

export async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (extractor) return extractor

  const { pipeline, env } = await loadTransformers()

  env.cacheDir = CACHE_DIR
  env.allowLocalModels = true

  extractor = await pipeline('feature-extraction', MODEL_NAME, {
    dtype: 'fp32',
  })

  return extractor
}

export async function embed(texts: string[]): Promise<Float32Array[]> {
  const extractor = await getEmbedder()
  const prefixed = texts.map((t) => `query: ${t}`)
  const output = await extractor(prefixed, { pooling: 'mean', normalize: true })
  const data = output.tolist() as number[][]
  return data.map((vec) => new Float32Array(vec))
}

export async function embedDocuments(texts: string[]): Promise<Float32Array[]> {
  const extractor = await getEmbedder()
  const prefixed = texts.map((t) => `passage: ${t}`)
  const output = await extractor(prefixed, { pooling: 'mean', normalize: true })
  const data = output.tolist() as number[][]
  return data.map((vec) => new Float32Array(vec))
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
  }
  return dot
}
