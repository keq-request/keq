import { resolveWith } from './resolve-with'


export async function intelligentParseResponse<T>(response?: Response): Promise<T> {
  if (!response) return undefined as T

  if (response.status === 204) {
    // 204: NO CONTENT
    return undefined as T
  }

  const contentType = response.headers.get('content-type') || ''
  try {
    if (contentType.match(/^application\/(.+\+)?json/)) {
      return resolveWith<T>(response, 'json')
    } else if (contentType.includes('multipart/form-data')) {
      return resolveWith<T>(response, 'form-data')
    } else if (contentType.includes('plain/text')) {
      return resolveWith<T>(response, 'text')
    } else if (contentType.includes('text/event-stream')) {
      return resolveWith<T>(response, 'sse')
    }
  } catch (err) {
    console.warn(`Failed to intelligent parse response body: ${response.url}`, err)
    throw err
  }

  /**
     * Unable to parse response body
     * Return undefined
     * Enable users to discover the problem
     * And modify the method of parsing response
     */
  return undefined as T
}
