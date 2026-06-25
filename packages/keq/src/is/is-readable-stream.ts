export function isReadableStream(body): body is ReadableStream {
  return body instanceof ReadableStream
}
