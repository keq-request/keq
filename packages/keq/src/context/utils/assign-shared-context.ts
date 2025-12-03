import { assignRequestInit } from '~/request-init/utils/assign-request-init'
import { ContextEmitterProperty, KeqSharedContext } from '../shared-context'

export function assignSharedContext(
  target: KeqSharedContext,
  source: KeqSharedContext,
): void {
  assignRequestInit(target.request, source.request)

  Object.assign(target.global, source.global)
  Object.assign(target.options, source.options)
  Object.assign(target.data, source.data)

  target[ContextEmitterProperty] = source[ContextEmitterProperty]
}
