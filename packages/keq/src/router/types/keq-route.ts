import { Promisable } from 'type-fest'
import type { KeqExecutionContext } from '../../context/index.js'


export type KeqRoute = (ctx: KeqExecutionContext) => Promisable<boolean>
