import { ApiDocumentV3_1, Artifact, Asset } from '~/models/index.js'
import { RuntimeConfig } from '~/types/runtime-config.js'
import { IgnoreMatcher } from '~/utils/ignore-matcher.js'


export interface CompilerContext {
  rc?: RuntimeConfig
  matcher?: IgnoreMatcher
  documents?: ApiDocumentV3_1[]
  artifacts?: Artifact[]
  assets?: Asset[]
}
