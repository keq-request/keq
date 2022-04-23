import { test } from '../test.before-each'
import { request, FormData } from '../../src'
import { Stream } from 'node:stream'
import { getBoundaryByContentType, parseFormData } from '@/util'


function streamToString(stream): Promise<string> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)))
    stream.on('error', err => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}


test.only('Form-Data Request', async t => {
  const { fakeFetchAPI } = t.context

  const formData = new FormData()
  formData.append('key3', 'value3')
  formData.append('key3', 'value3')
  const file = Buffer.from('file')

  const fetchAPI = fakeFetchAPI()

  await request
    .put('http://test.com')
    .type('form-data')
    .field({ key1: 'value1' })
    .field('key2', 'value2')
    .send(formData)
    .attach('file1', file)
    .attach('file2', file, 'file2.txt')
    .option('fetchAPI', fetchAPI)


  const args = fetchAPI.getCall(0).args
  const headers = args[1]?.headers as Headers
  const stream = args[1]?.body as unknown as Stream
  const text = await streamToString(stream)
  // console.log()
  const contentType = headers.get('content-type')
  if (!contentType) throw new Error('content-type is required')
  const boundary = getBoundaryByContentType(contentType)
  const result = await parseFormData(text, boundary)


  t.is(fetchAPI.callCount, 1)
  t.is(result.get('key1'), 'value1')
  t.is(result.get('key2'), 'value2')
  t.is(result.get('key3'), 'value3')

  const file1 = result.get('file1') as File
  t.is(file1.name, 'blob')
  t.is(await file1.text(), 'file')

  const file2 = result.get('file2') as File
  t.is(file2.name, 'file2.txt')
  t.is(await file2.text(), 'file')
})

test('x-www-form-urlencoded Request', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

  await request
    .del('http://test.com')
    .type('form')
    .send('key1=value1')
    .send({ key2: 'value2' })
    .field('key3', 'value3')
    .option('fetchAPI', fetchAPI)

  const args = fetchAPI.getCall(0).args

  const form = args[1]?.body as FormData

  t.is(fetchAPI.callCount, 1)
  t.is(form.get('key1'), 'value1')
  t.is(form.get('key2'), 'value2')
  t.is(form.get('key3'), 'value3')
})


