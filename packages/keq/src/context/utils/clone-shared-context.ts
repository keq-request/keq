import { cloneRequestInit } from '~/request-init'
import {
  ContextDataProperty,
  ContextEmitterProperty,
  ContextGlobalProperty,
  ContextLocationIdProperty,
  ContextOptionsProperty,
  ContextRequestProperty,
  KeqSharedContext,
} from '../shared-context'
import { klona } from 'klona'


export function cloneSharedContext(context: KeqSharedContext): KeqSharedContext {
  const cloned = new KeqSharedContext({
    locationId: context[ContextLocationIdProperty],
    request: cloneRequestInit(context[ContextRequestProperty]),
    global: context[ContextGlobalProperty],
    options: klona(context[ContextOptionsProperty]),
    data: klona(context[ContextDataProperty]),
  })

  context[ContextEmitterProperty].all.forEach((handlers, type) => {
    for (const handler of handlers) {
      cloned.emitter.on(type as any, handler as any)
    }
  })

  return cloned
}
