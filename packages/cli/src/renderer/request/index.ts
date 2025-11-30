// eslint-disable-next-line @typescript-eslint/require-await
export async function requestRenderer(): Promise<string> {
  return [
    'import { KeqRequest } from \'keq\'',
    '',
    '/* @anchor:file:start */',
    '',
    '/* @anchor:request-declaration */',
    'export const request = new KeqRequest()',
    '',
    '/* @anchor:file:end',
  ].join('\n')
}
