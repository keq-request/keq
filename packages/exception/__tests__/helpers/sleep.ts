export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createResponse(options: { size: number }): Response {
  const str = new Array(options.size)
    .fill('a')
    .join('')

  return new Response(str, {
    status: 200,
    headers: new Headers({
      'content-length': String(options.size),
    }),
  })
}
