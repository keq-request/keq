export function errorToComment(err: unknown, mediaType: string): string {
  const $err = String(err)
    .split('\n')
    .map(((line) => ` * ${line}`))
    .join('\n')

  return [
    '/**',
    ` * Unable to dereference schema for media type ${mediaType}`,
    $err,
    ' */',
  ].join('\n')
}
