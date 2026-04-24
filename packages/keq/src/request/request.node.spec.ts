import { describe, expect, jest, test } from '@jest/globals'
import { Mock } from 'jest-mock'
import { KeqRequest, request } from './request'


describe('KeqRequest', () => {
  test('Basic Auth', async () => {
    const mockedFetch = global.fetch as Mock<typeof global.fetch>

    await request
      .get('http://test.com')
      .auth('username', 'password')

    expect(mockedFetch.mock.calls).toHaveLength(1)

    const args = mockedFetch.mock.calls[0]
    const headers = args[1]?.headers
    expect(headers).not.toBeUndefined()
    expect(headers).toBeInstanceOf(Headers)
    expect((headers as Headers).get('authorization')).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=')
  })

  test('Resolve With Response', async () => {
    const res = await request
      .get('http://test.com')
      .type('json')
      .resolveWith('response')

    expect(res.headers.get('content-type')).toEqual('application/json')
    expect(await res.json()).toEqual({ code: '200' })
  })

  test('Custom Fetch API', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockedFetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => Promise.resolve(new Response(
      JSON.stringify({ code: '201' }),
      {
        headers: {
          'content-type': 'application/json',
        },
      },
    )))

    const responseBody = await request
      .get('http://test.com')
      .options({
        fetchAPI: mockedFetch as typeof fetch,
      })

    expect(mockedFetch.mock.calls).toHaveLength(1)

    expect(responseBody).toEqual({ code: '201' })
  })

  test('Fetch Failed', async () => {
    const mockedFetch = jest.fn(() => {
      throw new Error('fetch failed')
    })

    const keq = request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)

    await expect(keq).rejects.toThrow('fetch failed')
  })

  test('Query', async () => {
    const mockedFetch = global.fetch as Mock<typeof global.fetch>

    await request
      .get('http://test.com/')
      .query('a', 'a')
      .query('b', ['b', 'b'])
      .query('c', { c: { c: { c: 'c' } } })
      .query('d', ['d', 'd'], { arrayFormat: 'brackets' })
      .query('e', ['e', 'e'], { arrayFormat: 'comma' })
      .query('f', ['f', 'f'], { arrayFormat: 'repeat' })
      .query('g', ['g', 'g'], { arrayFormat: 'pipe' })
      .query('h', ['h', 'h'], { arrayFormat: 'space' })
      .query('i', { i: { i: { 'i.i': 'i' } } }, { allowDots: true })
      .query('j', 'j+j', { arrayFormat: 'space' })

    const url = mockedFetch.mock.calls[0][0]

    expect(url).toBe('http://test.com/?a=a&b%5B0%5D=b&b%5B1%5D=b&c%5Bc%5D%5Bc%5D%5Bc%5D=c&d%5B%5D=d&d%5B%5D=d&e=e%2Ce&f=f&f=f&g=g%7Cg&h=h%20h&i.i.i.i.i=i&j=j%2Bj')
  })

  test('Custom Default Query Stringify Options', async () => {
    const request = new KeqRequest({
      qs: {
        arrayFormat: 'brackets',
      },
    })

    await request
      .get('http://test.com/')
      .query('arr', ['a', 'b', 'c'])

    const mockedFetch = global.fetch as Mock<typeof global.fetch>
    const url = mockedFetch.mock.calls[0][0]

    expect(url).toBe('http://test.com/?arr%5B%5D=a&arr%5B%5D=b&arr%5B%5D=c')
  })

  test('Complex Parameters', async () => {
    const mockedFetch = global.fetch as Mock<typeof global.fetch>

    await request
      .get('http://test.com/animal/{favorite}')
      .params({ favorite: 'can' })
      .query('color', 'black')
      .query({ breeds: ['british_shorthair_cat', 'doll_cat'] })
      .query('unknown', undefined)
      .query('bigint', 123n)
      .query({
        obj: {
          sub_obj: {
            key: ['value'],
          },
        },
      })
      .set('x-region', 'cn')
      .set({
        'x-username': 'john',
      })
      .set(new Headers({
        'x-age': '14',
      }))
      .mode('cors')
      .credentials('include')
      .redirect('follow')

    const url = mockedFetch.mock.calls[0][0]
    expect(url).toBe('http://test.com/animal/can?color=black&breeds%5B0%5D=british_shorthair_cat&breeds%5B1%5D=doll_cat&bigint=123&obj%5Bsub_obj%5D%5Bkey%5D%5B0%5D=value')

    const init = mockedFetch.mock.calls[0][1]

    expect(init).not.toBeUndefined()
    expect(init?.headers).toBeInstanceOf(Headers)
    expect(init?.mode).toBe('cors')
    expect(init?.credentials).toBe('include')
    expect(init?.redirect).toBe('follow')
    expect(init?.body).toBeUndefined()

    const headers = init?.headers as Headers
    expect(headers.get('x-region')).toBe('cn')
    expect(headers.get('x-username')).toBe('john')
    expect(headers.get('x-age')).toBe('14')
  })

  test('Empty Object Request Body', async () => {
    const mockedFetch = global.fetch as Mock<typeof global.fetch>

    await request
      .post('http://test.com')
      .send({})

    const args = mockedFetch.mock.calls[0]

    expect(args[1]?.body).toBe('{}')
  })

  test('String Request Body', async () => {
    const mockedFetch = global.fetch as Mock<typeof global.fetch>

    await request
      .post('http://test.com')
      .type('plain/text')
      .send('abc')

    const args = mockedFetch.mock.calls[0]

    expect(args[1]?.body).toBe('abc')
  })
})


