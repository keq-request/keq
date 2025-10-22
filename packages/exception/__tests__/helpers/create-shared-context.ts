import { KeqSharedContext } from 'keq'

export function createSharedContext(): KeqSharedContext {
  return new KeqSharedContext({
    request: {
      url: new URL('http://example.com'),
      method: 'get',
      headers: new Headers(),
      routeParams: {},
      body: {},
    },
    options: {},
    global: {},
  })
}
