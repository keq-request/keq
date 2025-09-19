import { DBSchema } from 'idb'
import { IndexedDBEntryMetadata } from './indexed-db-entry-metadata.js'
import { IndexedDBEntryResponse } from './indexed-db-entry-response.js'
import { IndexedDBEntryVisits } from './indexed-db-entry-visits.js'


export interface IndexedDBSchema extends DBSchema {
  metadata: {
    key: string
    value: IndexedDBEntryMetadata
    indexes: {
      expiredAt: string
    }
  }

  response: {
    key: string
    value: IndexedDBEntryResponse
    indexes: {
      responseStatus: number
    }
  }

  visits: {
    key: string
    value: IndexedDBEntryVisits
    indexes: {
      visitCount: number
      lastVisitedAt: Date
    }
  }
}
