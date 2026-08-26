export function getLocationId(depth = 0): string {
  const err = new Error()
  if (!err.stack) return ''

  const lines = err.stack.split('\n')
  const offset = depth + 2

  if (lines[offset]) return lines[offset].trim()

  // JavaScriptCore (iOS Safari) may omit stack frames across async/await
  // resume and tail-call boundaries, so `lines[offset]` can be out of range.
  // Fall back to the deepest non-empty frame instead of crashing on `.trim()`.
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim()
    if (line) return line
  }

  return ''
}
