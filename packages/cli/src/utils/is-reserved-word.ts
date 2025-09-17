
const reservedWords = [
  'abstract',
  'boolean',
  'byte',
  'char',
  'class',
  'const',
  'debugger',
  'double',
  'enum',
  'export',
  'extends',
  'final',
  'float',
  'goto',
  'implements',
  'import',
  'int',
  'interface',
  'long',
  'native',
  'package',
  'private',
  'protected',
  'public',
  'short',
  'static',
  'super',
  'synchronized',
  'throws',
  'transient',
  'volatile',
]

export function isReservedWord(str: string): boolean {
  return reservedWords.includes(str)
}
