import { isBrowser } from './utils'
import NodeJSFormData from 'formdata-node'

export { fetch, Headers, Response } from 'cross-fetch'
export const FormData = isBrowser ? window.FormData : NodeJSFormData
