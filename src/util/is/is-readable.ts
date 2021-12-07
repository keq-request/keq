import { Readable } from 'stream'


export function isReadable(value: any): boolean {
  return value instanceof Readable
}
