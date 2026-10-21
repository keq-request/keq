import { describe, expect, it } from '@jest/globals'
import { Artifact } from '~/models/index.js'
import { EntrypointTransformer } from './entrypoint.transformer.js'


describe('EntrypointTransformer', () => {
  const dirpath = './api/types/components/schemas'

  it('renders export {} when there is no exportable artifact', () => {
    const content = EntrypointTransformer.toTypescript([], { dirpath })

    expect(content).toContain('export {}')
    expect(content).not.toContain('export * from')
  })

  it('renders esm exports with .js extension', () => {
    const artifact = new Artifact({
      id: 'user',
      filepath: './api/types/components/schemas/User.schema.ts',
      content: '',
    })

    const content = EntrypointTransformer.toTypescript([artifact], { dirpath, esm: true })

    expect(content).toContain("export * from './User.schema.js'")
  })

  it('renders cjs exports without extension', () => {
    const artifact = new Artifact({
      id: 'user',
      filepath: './api/types/components/schemas/User.schema.ts',
      content: '',
    })

    const content = EntrypointTransformer.toTypescript([artifact], { dirpath })

    expect(content).toContain("export * from './User.schema'")
  })
})
