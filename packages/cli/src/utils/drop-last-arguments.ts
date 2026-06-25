/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/ban-types */
import * as R from 'ramda'


export function dropLastArguments<T extends((...args: any[]) => any)>(fn: T): ((...args: [...Parameters<T>, any]) => ReturnType<T>) {
  return (...args) => fn(...R.dropLast(1, args))
}
