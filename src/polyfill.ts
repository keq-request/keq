import { isBrowser } from './utils'
import FormDataNode from './form-data-node'

export { fetch, Headers, Response } from 'cross-fetch'

export const FormData = isBrowser ? window.FormData : FormDataNode
