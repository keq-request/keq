import { describe, expect, it, jest } from '@jest/globals'
import { AsyncSeriesHook } from 'tapable'
import type { Compiler } from '~/compiler/index.js'
import type { ModuleDefinition } from '~/models/index.js'
import { SpringdocCompatPlugin } from './springdoc-compat.plugin.js'

// The generator plugins are only consulted when `ensureJsonBody` is enabled, and
// their import graph pulls ESM-only packages that this CommonJS test environment
// cannot load. Stub them out so the plugin itself can be exercised here.
jest.mock('../generate-micro-function/index.js', () => ({
  GenerateMicroFunctionPlugin: { of: () => undefined },
}))
jest.mock('../generate-isolated/index.js', () => ({
  GenerateIsolatedPlugin: { of: () => undefined },
}))

interface SpecShape {
  openapi?: string
  info?: unknown
  paths?: Record<string, unknown>
}

/** The reporter's minimal Springdoc document, parameterised by the emitted `contact`. */
function createSpringdocSpec(contact?: unknown): SpecShape {
  return {
    openapi: '3.0.1',
    info: { title: 'demo', version: '0.0.1', contact },
    paths: {
      '/ping': {
        get: {
          operationId: 'ping',
          responses: {
            200: {
              description: 'OK',
              content: { 'application/json': { schema: { type: 'string' } } },
            },
          },
        },
      },
    },
  }
}

/** A document with no `info` block, for the defensive cases below. */
function createBareSpec(overrides: Partial<SpecShape> = {}): SpecShape {
  return { openapi: '3.0.1', paths: {}, ...overrides }
}

function createCompilerStub(): Compiler {
  return {
    hooks: {
      beforeValidate: new AsyncSeriesHook<[object, ModuleDefinition]>(['spec', 'moduleDefinition']),
    },
  } as unknown as Compiler
}

async function runBeforeValidate(spec: object): Promise<void> {
  const compiler = createCompilerStub()
  new SpringdocCompatPlugin().apply(compiler)
  await compiler.hooks.beforeValidate.promise(spec, { name: 'demo' } as ModuleDefinition)
}

// The real contract — that the corrected document now passes validation — is
// verified end-to-end by running `keq build` on the reporter's spec, because
// `@scalar/openapi-parser` is ESM-only and cannot be imported from this CommonJS
// jest project. What is locked here is the correction applied to the document.

describe('SpringdocCompatPlugin', () => {
  describe('beforeValidate: empty info.contact.email', () => {
    it('removes an empty email and keeps the rest of contact', async () => {
      const spec = createSpringdocSpec({ name: '', email: '' })
      const contact = (spec.info as { contact: unknown }).contact

      await runBeforeValidate(spec)

      expect(contact).toEqual({ name: '' })
    })

    it('keeps a non-empty email', async () => {
      const spec = createSpringdocSpec({ name: 'API Team', email: 'api@example.com' })
      const contact = (spec.info as { contact: unknown }).contact

      await runBeforeValidate(spec)

      expect(contact).toEqual({ name: 'API Team', email: 'api@example.com' })
    })

    it('keeps other empty contact fields untouched', async () => {
      const spec = createSpringdocSpec({ name: '', email: '', url: '' })
      const contact = (spec.info as { contact: unknown }).contact

      await runBeforeValidate(spec)

      expect(contact).toEqual({ name: '', url: '' })
    })

    it.each([
      ['info is missing', createBareSpec()],
      ['contact is missing', createBareSpec({ info: { title: 'demo', version: '0.0.1' } })],
      ['contact is null', createSpringdocSpec(null)],
      ['contact is not an object', createSpringdocSpec('nope')],
      ['info is not an object', createBareSpec({ info: 'nope' })],
    ])('does not throw when %s', async (_label, spec) => {
      await expect(runBeforeValidate(spec)).resolves.toBeUndefined()
    })
  })
})
