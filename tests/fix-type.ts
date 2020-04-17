import test from 'ava'
import { fixType } from '@/fix-type'

test('fix type', t => {
  t.is('application/json', fixType('json'))
  t.is('application/json', fixType('application/json'))
  t.is('image/svg+xml', fixType('svg'))
  t.is('text/html', fixType('html'))
  t.is('image/jpeg', fixType('jpeg'))
})
