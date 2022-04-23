import { URL } from 'whatwg-url'
import { compile } from 'path-to-regexp'
import { Exception } from './exception'
import { isBrowser } from './util'
import { clone } from './util/clone'


export class KeqURL extends URL {
  constructor(url: string, base: string | URL = isBrowser ? window.location.origin : 'http://localhost') {
    super(url, base)
  }

  params = {}

  get query(): Record<string, any> {
    const obj = {}
    for (const key of this.searchParams.keys()) {
      const value = this.searchParams.getAll(key)
      if (value.length === 1) obj[key] = value[0]
      else obj[key] = value
    }

    return new Proxy(obj, {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return this.searchParams.getAll(prop)
        } else {
          return target[prop] as unknown
        }
      },
      set: (target, prop, value) => {
        if (typeof prop === 'string') {
          this.searchParams.delete(prop)
          if (Array.isArray(value)) {
            value.forEach(item => this.searchParams.append(prop, item))
            obj[prop] = value
          } else if (value === undefined) {
            delete obj[prop]
          } else {
            this.searchParams.append(prop, value)
            obj[prop] = value
          }
        } else {
          target[prop] = value
        }

        return true
      },
    })
  }

  set query(value: Record<string, any>) {
    // delete all
    this.search = ''

    for (const key of Object.keys(value)) {
      if (value[key] === undefined) continue

      if (Array.isArray(value[key])) value[key].forEach(item => this.searchParams.append(key, item))
      else this.searchParams.append(key, value[key])
    }
  }

  public toPath(): string {
    const uri = new URL(this.href)

    try {
      const toPath = compile(uri.pathname, { encode: encodeURIComponent })
      uri.pathname = toPath(this.params)
    } catch (e) {
      throw new Exception(`Cannot compile the params in ${uri.pathname}, Because ${(e as Error)?.message}.`)
    }

    return uri.href
  }

  public clone(): KeqURL {
    const uri = new KeqURL(this.href)
    uri.params = clone(this.params)

    return uri
  }
}
