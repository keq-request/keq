import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers'
import path from 'path'
import os from 'os'

const MODEL_NAME = 'intfloat/multilingual-e5-small'
const CACHE_DIR = path.join(os.homedir(), '.cache', 'keq', 'models')

let extractor: FeatureExtractionPipeline | null = null

export async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (extractor) return extractor

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
