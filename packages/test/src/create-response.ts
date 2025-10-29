export interface CreateResponseOptions {
  status?: number
  statusText?: string
  headers?: HeadersInit
  body?: BodyInit | { size: number }
}


export function createResponse(options: CreateResponseOptions): Response {
  const headers = new Headers(options.headers)

  let body: BodyInit = ''

  if (options.body && options.body instanceof Object && 'size' in options.body) {
    body = new Array(options.body.size)
      .fill('a')
      .join('')

    headers.set('content-length', String(options.body.size))
  } else if (options.body) {
    body = options.body
  }

  return new Response(body, {
    status: options.status ?? 200,
    statusText: options.statusText,
    headers,
  })
}
