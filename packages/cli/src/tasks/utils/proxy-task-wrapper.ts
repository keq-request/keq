import { TaskWrapper } from '../types/index.js'

export function createPluginTaskWrapper(pluginName: string, task: TaskWrapper): TaskWrapper {
  return new Proxy(task, {
    set(target, prop, value) {
      if (prop !== 'output') {
        return Reflect.set(target, prop, value)
      }

      target.output = `[Plugin: ${pluginName}] ${value}`
      return true
    },
  })
}
