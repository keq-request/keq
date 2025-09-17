export const base64Encode: ((str: string) => string) = globalThis.btoa || ((str: string) => Buffer.from(str).toString('base64'))
export const base64Decode: ((str: string) => string) = globalThis.atob || ((str: string) => Buffer.from(str, 'base64').toString('utf8'))
