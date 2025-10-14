import { ApiDocument } from '~/tasks/utils/api-document'
import { ApiDocumentV3_1 } from '~/tasks/utils/api-document_v3_1'
import { Artifact } from '~/tasks/utils/artifact'
import { RuntimeConfig } from '~/types/runtime-config'
import { IgnoreMatcher } from '~/utils/ignore-matcher'

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
