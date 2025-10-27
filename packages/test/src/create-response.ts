export interface CreateResponseOptions {
  status?: number
  statusText?: string
  headers?: HeadersInit
  body?: string | { size: number }
}


export function createResponse(options: CreateResponseOptions): Response {
  const headers = new Headers(options.headers)

  let body: string = ''

  if (typeof options.body === 'string') {
    body = options.body
  } else if (options.body) {
    body = new Array(options.body.size)
      .fill('a')
      .join('')

    headers.set('content-length', String(options.body.size))
  }

  return new Response(body, {
    status: options.status ?? 200,
    statusText: options.statusText,
    headers,
  })
}
