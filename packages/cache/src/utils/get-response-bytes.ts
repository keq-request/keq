export async function getResponseBytes(response: Response): Promise<number> {
  const contentLength = response.headers.get('content-length')
  if (contentLength) {
    return parseInt(contentLength)
  }

  const arrayBuffer = await response.clone().arrayBuffer()
  return arrayBuffer.byteLength
}
