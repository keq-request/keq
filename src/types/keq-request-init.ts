import type { KeqRequestContext } from './keq-context.js'

export type KeqRequestInit = Partial<Omit<KeqRequestContext, 'url'>>
