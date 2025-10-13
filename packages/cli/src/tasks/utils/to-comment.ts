export function toComment(msg?: string): string {
  if (!msg) return ''

  return msg.split('\n')
    .map((str) => `// ${str}`)
    .join('\n')
}
