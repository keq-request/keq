import { expect, test } from '@jest/globals'
import { OpenAPIV3 } from 'openapi-types'
import { compile } from '~/compile-openapi'
import * as swagger from '../swagger.json'
import { FileNamingStyle } from '~/types/file-naming-style'
import { disinfect } from '~/utils/disinfect'


test('compile swagger', async () => {
  const files = await compile({
    moduleName: 'test',
    document: await disinfect('test', swagger as unknown as OpenAPIV3.Document),
    outdir: './outdir',
    fileNamingStyle: FileNamingStyle.snakeCase,
    strict: false,
  })

  expect(files).toMatchSnapshot()
})

