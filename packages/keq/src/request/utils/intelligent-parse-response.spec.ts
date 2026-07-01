import { describe, expect, it } from '@jest/globals'
import { intelligentParseResponse } from './intelligent-parse-response'


describe('intelligentParseResponse', () => {
  describe('undefined cases', () => {
    it('should return undefined when response is undefined', async () => {
      const result = await intelligentParseResponse(undefined)
      expect(result).toBeUndefined()
    })

    it('should return undefined for 204 No Content', async () => {
      const response = new Response(null, { status: 204 })
      const result = await intelligentParseResponse(response)
      expect(result).toBeUndefined()
    })
  })

  describe('JSON parsing', () => {
    it('should parse application/json as JSON', async () => {
      const body = { message: 'hello' }
      const response = new Response(JSON.stringify(body), {
        headers: { 'content-type': 'application/json' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toEqual(body)
    })

    it('should parse application/json with charset as JSON', async () => {
      const body = { message: 'hello' }
      const response = new Response(JSON.stringify(body), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toEqual(body)
    })

    it('should parse application/*+json (vendor type) as JSON', async () => {
      const body = { message: 'hello' }
      const response = new Response(JSON.stringify(body), {
        headers: { 'content-type': 'application/vnd.api+json' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toEqual(body)
    })
  })

  describe('FormData parsing', () => {
    it('should parse multipart/form-data as FormData', async () => {
      const formData = new FormData()
      formData.append('key', 'value')
      const response = new Response(formData)
      // new Response(formData) automatically sets content-type to multipart/form-data with boundary
      const result = await intelligentParseResponse(response)
      expect(result).toBeInstanceOf(FormData)
    })
  })

  describe('text parsing', () => {
    it('should parse text/plain as text', async () => {
      const response = new Response('Hello, World!', {
        headers: { 'content-type': 'text/plain' },
      })
      const result = await intelligentParseResponse(response)
      expect(typeof result).toBe('string')
      expect(result).toBe('Hello, World!')
    })

    it('should parse text/html as text', async () => {
      const response = new Response('<html><body>hi</body></html>', {
        headers: { 'content-type': 'text/html' },
      })
      const result = await intelligentParseResponse(response)
      expect(typeof result).toBe('string')
      expect(result).toBe('<html><body>hi</body></html>')
    })

    it('should parse text/xml as text', async () => {
      const response = new Response('<root><item/></root>', {
        headers: { 'content-type': 'text/xml' },
      })
      const result = await intelligentParseResponse(response)
      expect(typeof result).toBe('string')
    })

    it('should parse text/css as text', async () => {
      const response = new Response('body { color: red; }', {
        headers: { 'content-type': 'text/css' },
      })
      const result = await intelligentParseResponse(response)
      expect(typeof result).toBe('string')
    })

    it('should parse text/csv as text', async () => {
      const response = new Response('a,b,c\n1,2,3', {
        headers: { 'content-type': 'text/csv' },
      })
      const result = await intelligentParseResponse(response)
      expect(typeof result).toBe('string')
    })
  })

  describe('SSE parsing', () => {
    it('should parse text/event-stream as SSE', async () => {
      // SSE returns a ReadableStream, which is truthy
      const response = new Response('data: hello\n\n', {
        headers: { 'content-type': 'text/event-stream' },
      })
      const result = await intelligentParseResponse(response)
      // SSE parsing returns a ReadableStream
      expect(result).toBeTruthy()
      expect(typeof (result as any).getReader).toBe('function')
    })
  })

  describe('arrayBuffer fallback for binary content types', () => {
    it('should return arrayBuffer for image/png', async () => {
      const response = new Response('binary-data', {
        headers: { 'content-type': 'image/png' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toBeInstanceOf(ArrayBuffer)
    })

    it('should return arrayBuffer for image/jpeg', async () => {
      const response = new Response('binary-data', {
        headers: { 'content-type': 'image/jpeg' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toBeInstanceOf(ArrayBuffer)
    })

    it('should return arrayBuffer for image/svg+xml', async () => {
      const response = new Response('<svg></svg>', {
        headers: { 'content-type': 'image/svg+xml' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toBeInstanceOf(ArrayBuffer)
    })

    it('should return arrayBuffer for audio/mpeg', async () => {
      const response = new Response('binary-data', {
        headers: { 'content-type': 'audio/mpeg' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toBeInstanceOf(ArrayBuffer)
    })

    it('should return arrayBuffer for video/mp4', async () => {
      const response = new Response('binary-data', {
        headers: { 'content-type': 'video/mp4' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toBeInstanceOf(ArrayBuffer)
    })

    it('should return arrayBuffer for application/octet-stream', async () => {
      const response = new Response('binary-data', {
        headers: { 'content-type': 'application/octet-stream' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toBeInstanceOf(ArrayBuffer)
    })

    it('should return arrayBuffer for application/pdf', async () => {
      const response = new Response('binary-data', {
        headers: { 'content-type': 'application/pdf' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toBeInstanceOf(ArrayBuffer)
    })

    it('should return arrayBuffer for font/woff2', async () => {
      const response = new Response('binary-data', {
        headers: { 'content-type': 'font/woff2' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toBeInstanceOf(ArrayBuffer)
    })

    it('should return undefined when no content-type header', async () => {
      // Use a Uint8Array body so the Response constructor does NOT auto-set content-type to text/plain
      const response = new Response(new Uint8Array([1, 2, 3, 4]))
      const result = await intelligentParseResponse(response)
      expect(result).toBeUndefined()
    })

    it('should return undefined for unknown content-type', async () => {
      const response = new Response('some-data', {
        headers: { 'content-type': 'application/x-custom' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toBeUndefined()
    })

    it('should return undefined for application/xml', async () => {
      const response = new Response('<root><item/></root>', {
        headers: { 'content-type': 'application/xml' },
      })
      const result = await intelligentParseResponse(response)
      expect(result).toBeUndefined()
    })
  })
})
