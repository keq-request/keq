/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
import { isBrowser } from '@/util'
// import cFetch from 'cross-fetch'


export const FormData: typeof global.FormData = isBrowser ? window.FormData : require('formdata-node').FormData
export const fetch: typeof global.fetch = isBrowser ? window.fetch.bind(window) : require('cross-fetch').default
// export const fetch: typeof global.fetch = cFetch
export const Headers: typeof global.Headers = isBrowser ? window.Headers : require('cross-fetch').default.Headers
export const Response: typeof global.Response = isBrowser ? window.Response : require('cross-fetch').Response
export const Blob: typeof global.Blob = isBrowser ? window.Blob : require('formdata-node').Blob
export const File: typeof global.File = isBrowser ? window.File : require('formdata-node').File

export const btoa: typeof global.btoa = isBrowser ? window.btoa : (str: string) => Buffer.from(str).toString('base64')
