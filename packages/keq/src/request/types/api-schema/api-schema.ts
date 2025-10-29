import { KeqRequestMethod } from '~/request-init'
import { KeqOperation } from './operation'


export interface KeqApiSchema {
  [pathname: string]: {
    [method in KeqRequestMethod]?: KeqOperation
  }
}
