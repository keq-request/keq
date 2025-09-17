const keywords = [
  'break',
  'case',
  'catch',
  'continue',
  'default',
  'delete',
  'do',
  'else',
  'finally',
  'for',
  'function',
  'if',
  'in',
  'instanceof',
  'new',
  'return',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
]

export function isKeywords(str: string): boolean {
  return keywords.includes(str)
}
