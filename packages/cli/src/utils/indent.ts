export function indent(space: number, text: string): string {
  if (text === '') return ''

  const indentation = ' '.repeat(space)
  return text.split('\n')
    .map((line) => (line ? `${indentation}${line}` : line))
    .join('\n')
}
