import test from 'ava'
import { fixContentType } from '~/util/fix-content-type'


test('fix type', t => {
  t.is('application/json', fixContentType('json'))
  t.is('application/json', fixContentType('application/json'))
  t.is('image/svg+xml', fixContentType('svg'))
  t.is('text/html', fixContentType('html'))
  t.is('image/jpeg', fixContentType('jpeg'))
})
