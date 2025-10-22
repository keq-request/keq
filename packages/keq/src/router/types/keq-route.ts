import type { KeqExecutionContext } from '../../context/index.js'


export type KeqRoute = (ctx: KeqExecutionContext) => Promise<boolean> | boolean
