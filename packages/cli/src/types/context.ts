import { ApiDocument } from '~/tasks/utils/api-document'
import { CliOptions } from './cli-options'
import { RuntimeConfig } from './runtime-config'
import { ApiDocumentV3_1 } from '~/tasks/utils/api-document_v3_1'
import { Artifact } from '~/tasks/utils/artifact'

export interface Context {
  cli?: CliOptions

  setup?: {
    rc: RuntimeConfig
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
