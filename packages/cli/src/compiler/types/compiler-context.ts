import { ApiDocumentV3_1, Artifact, Asset } from '~/models/index.js'
import { RuntimeConfig } from '~/types/index.js'
import { Matcher } from '~/utils/matcher.js'


export interface CompilerContext {
  workdir?: string
  rc?: RuntimeConfig
  matcher?: Matcher
  documents?: ApiDocumentV3_1[]
  artifacts?: Artifact[]
  assets?: Asset[]
}
