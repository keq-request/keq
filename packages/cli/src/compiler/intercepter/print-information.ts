/* eslint-disable @typescript-eslint/no-unsafe-return */
import { FullTap, HookInterceptor } from 'tapable'
import { TaskWrapper } from '~/tasks/index.js'


export function proxyTaskWrapper(pluginName: string, task: TaskWrapper): TaskWrapper {
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


export function printInformation(taskIndex: number): HookInterceptor<unknown, unknown> {
  return {
    register: <T extends FullTap>(tap: T): T => {
      const fn = tap.fn

      if (tap.type === 'promise') {
        tap.fn = (...args: any[]) => {
          const task = args[taskIndex] as TaskWrapper
          const proxyTask = proxyTaskWrapper(tap.name, task)
          args[taskIndex] = proxyTask
          proxyTask.output = 'Processing...'
          return fn(...args)
        }
      }

      if (tap.type === 'sync') {
        tap.fn = (...args: any[]) => {
          const task = args[taskIndex] as TaskWrapper
          const proxyTask = proxyTaskWrapper(tap.name, task)
          args[taskIndex] = proxyTask
          proxyTask.output = 'Processing...'
          return fn(...args)
        }
      }

      if (tap.type === 'async') {
        tap.fn = (...args: any[]) => {
          const task = args[taskIndex] as TaskWrapper
          const proxyTask = proxyTaskWrapper(tap.name, task)
          args[taskIndex] = proxyTask
          proxyTask.output = 'Processing...'
          return fn(...args)
        }
      }

      return tap
    },
  }
}

