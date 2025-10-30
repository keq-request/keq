// eslint-disable-next-line @typescript-eslint/require-await
export async function requestRenderer(): Promise<string> {
  return [
    'import { KeqRequest } from \'keq\'',
    'export const request = new KeqRequest()',
  ].join('\n')
}
