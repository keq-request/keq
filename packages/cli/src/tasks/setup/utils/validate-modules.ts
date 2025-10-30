import * as R from 'ramda'
import validator from 'validator'


export function validateModules(modules: Record<string, string>): void {
  const keys = Object.keys(modules)

  for (const key of keys) {
    if (!/^[A-Za-z_][A-Za-z0-9_$]*$/.test(key)) {
      throw new Error(`Module name "${key}" is not valid. It must start with a letter or underscore, and can only contain letters, numbers, and underscores.`)
    }
  }

  const keysGroupByLowerCase = R.groupBy(R.toLower, keys)

  for (const groupKey in keysGroupByLowerCase) {
    const keys = keysGroupByLowerCase[groupKey] || []
    if (keys.length > 1) {
      throw new Error(`Module names ${keys.map((name) => `"${name}"`).join(', ')} are case-insensitively duplicated.`)
    }
  }

  for (const key in modules) {
    const address = modules[key]

    if (validator.isURL(address, { require_host: true, require_protocol: true, protocols: ['http', 'https'] })) {
      continue
    }

    if (/^(\/|\.\/|\.\.\/)/.test(address)) {
      continue
    }

    throw new Error(`Module address "${address}" of module "${key}" is not valid. It must be a URL or a local path.`)
  }
}
