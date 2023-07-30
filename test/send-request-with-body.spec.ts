import { describe, expect, test } from '@jest/globals'
import { Mock } from 'jest-mock'
import { request } from '~/index'


describe('send multipart/form-data request', () => {
  test('use FormData Class', async () => {
    const mockedFetch = global.fetch as Mock<typeof global.fetch>

    const formData = new FormData()

    const resumeFile = new Blob(['test'], { type: 'text/plain' })
    formData.append('name', 'John')
    formData.append('resume', resumeFile, 'test.txt')
    formData.append('friends', 'Tom')
    formData.append('friends', 'Bob')

    await request
      .post('http://test.com')
      .send(formData)

    const init = mockedFetch.mock.calls[0][1]
    expect(init).toBeDefined()

    const headers = init?.headers as Headers

    // FormData 需要自动删除 Content-Type
    expect(headers.get('Content-Type')).toBeNull()

    const body = init?.body as FormData

    expect(body.getAll('name')).toEqual(['John'])
    expect(body.getAll('friends')).toEqual(['Tom', 'Bob'])
    expect((body.get('resume') as File).name).toBe('test.txt')
  })

  test('use keq API', async () => {
    const mockedFetch = global.fetch as Mock<typeof global.fetch>

    await request
      .post('http://test.com')
      .field('name', 'John')
      .field('friends', ['Tom', 'Bob'])
      .attach('resume', new Blob(['test'], { type: 'text/plain' }), 'test.txt')

    const init = mockedFetch.mock.calls[0][1]
    expect(init).toBeDefined()

    const headers = init?.headers as Headers

    // FormData 需要自动删除 Content-Type
    expect(headers.get('Content-Type')).toBeNull()

    const body = init?.body as FormData

    expect(body.getAll('name')).toEqual(['John'])
    expect(body.getAll('friends')).toEqual(['Tom', 'Bob'])
    expect((body.get('resume') as File).name).toBe('test.txt')
  })
})


test('send application/json request', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  const requestBody = {
    name: 'John',
    friends: ['Tom', 'Bob'],
  }
  await request
    .post('http://test.com')
    .send(requestBody)

  const init = mockedFetch.mock.calls[0][1]
  expect(init).toBeDefined()

  const headers = init?.headers as Headers
  expect(headers.get('Content-Type')).toBe('application/json')

  const body = init?.body as string
  expect(body).toBe(JSON.stringify(requestBody))
})


test('send application/x-www-form-urlencoded request', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  await request
    .post('http://test.com')
    .type('form')
    .send({
      name: 'John',
      friends: ['Tom', 'Bob'],
    })

  const init = mockedFetch.mock.calls[0][1]
  expect(init).toBeDefined()

  const headers = init?.headers as Headers
  expect(headers.get('Content-Type')).toBe('application/x-www-form-urlencoded')

  const body = init?.body as URLSearchParams
  expect(body).toBeInstanceOf(URLSearchParams)
  expect(body.toString()).toBe('name=John&friends=Tom&friends=Bob')
})
