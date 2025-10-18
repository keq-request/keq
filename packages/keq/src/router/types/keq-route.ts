import type { KeqContext } from '../../context/index.js'


export type KeqRoute = (ctx: KeqContext) => Promise<boolean> | boolean
