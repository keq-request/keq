export async function intelligentParseResponse<T>(response?: Response): Promise<T> {
  if (!response) return undefined as T

  if (response.status === 204) {
    // 204: NO CONTENT
    return undefined as T
  }

  const contentType = response.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      return await response.json() as T
    } else if (contentType.includes('multipart/form-data')) {
      return await response.formData() as T
    } else if (contentType.includes('plain/text')) {
      return await response.text() as T
    }
  } catch (e) {
    console.warn('Failed to auto parse response body', e)
  }

  /**
     * Unable to parse response body
     * Return undefined
     * Enable users to discover the problem
     * And modify the method of parsing response
     */
  return undefined as T
}
