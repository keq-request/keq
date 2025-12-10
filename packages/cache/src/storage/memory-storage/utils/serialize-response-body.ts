/**
 * @en Serialize the response body based on content-type
 * @zh 根据 content-type 序列化响应体
 */
export async function serializeResponseBody(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      const json = await response.json()
      return JSON.stringify(json)
    }

    if (
      contentType.includes('text/')
      || contentType.includes('application/xml')
      || contentType.includes('application/javascript')
    ) {
      return await response.text()
    }

    return '[Binary or unsupported content]'
  } catch {
    return '[Unable to serialize]'
  }
}
