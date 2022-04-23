export function isReadable(value: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Readable } = require('stream')
  return value instanceof Readable
}
