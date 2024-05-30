import { KeqContextRequest } from './keq-context-request.js'

export type KeqInit = Partial<Omit<KeqContextRequest, 'url'>>
