export function getUniqueCodeIdentifier(depth = 0): string | undefined {
  const err = new Error()
  if (!err.stack) return

  const stackLine = err.stack.split('\n')[depth + 2]

  return stackLine.trim()
}
