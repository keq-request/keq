import { KeqSharedContext, KeqSharedContextOptions } from 'keq'

export interface CreateSharedContextOptions extends Omit<Partial<KeqSharedContextOptions>, 'request'> {
  request?: Partial<KeqSharedContextOptions['request']>
}

export function createSharedContext(options?: CreateSharedContextOptions): KeqSharedContext {
  return new KeqSharedContext({
    locationId: options?.locationId,
    request: {
      url: new URL('http://example.com'),
      method: 'get',
      headers: new Headers(),
      pathParameters: {},
      body: {},
      ...options?.request,
    },
    data: options?.data,
    options: options?.options,
    global: options?.global || {},
    emitter: options?.emitter,
  })
}
