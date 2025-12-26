import { EventSourceParserStream } from 'eventsource-parser/stream'
import { KeqResolveWithMode, unwrap } from '~/context'


export async function resolveWith<T>(response: Response, mode: Exclude<KeqResolveWithMode, 'intelligent'>): Promise<T> {
  if (mode === 'response') return response.clone() as T
  if (mode === 'text') return await response.text() as T
  if (mode === 'json') return unwrap(await response.json()) as T
  if (mode === 'form-data') return await response.formData() as T
  if (mode === 'blob') return await response.blob() as T
  if (mode === 'array-buffer') return await response.arrayBuffer() as T
  if (mode === 'sse') {
    if (!response.body) return response.body as T

    return response.clone().body!
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream()) as T
  }

  return undefined as T
}
