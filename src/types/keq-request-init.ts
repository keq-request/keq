import { KeqRequestContext } from './keq-context'

export type KeqRequestInit = Partial<Omit<KeqRequestContext, 'url'>>
