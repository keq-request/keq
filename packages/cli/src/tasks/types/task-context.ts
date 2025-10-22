import { ApiDocument } from '~/tasks/utils/api-document.js'
import { ApiDocumentV3_1 } from '~/tasks/utils/api-document_v3_1.js'
import { Artifact } from '~/tasks/utils/artifact.js'
import { RuntimeConfig } from '~/types/runtime-config.js'
import { IgnoreMatcher } from '~/utils/ignore-matcher.js'

export interface TaskContext {
  setup?: {
    rc: RuntimeConfig
    matcher: IgnoreMatcher
  }

  downloaded?: {
    documents: ApiDocument[]
  }

  validated?: {
    documents: ApiDocumentV3_1[]
  }

  shaken?: {
    documents: ApiDocumentV3_1[]
  }

  compiled?: {
    artifacts: Artifact[]
  }
}
