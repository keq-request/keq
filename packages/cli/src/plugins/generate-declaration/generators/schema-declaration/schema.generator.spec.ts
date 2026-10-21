import { describe, expect, it, jest } from '@jest/globals'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { AsyncSeriesWaterfallHook } from 'tapable'
import { ApiDocumentV3_1, ModuleDefinition } from '~/models/index.js'
import type { Artifact, OperationDefinition, ResponseDefinition, SchemaDefinition } from '~/models/index.js'
import { FileNamingStyle } from '~/constants/index.js'
import type { Compiler, TaskWrapper } from '~/compiler/index.js'
import { MetadataStorage } from '../../constants/metadata-storage.js'
import { SchemaDeclarationGenerator } from './schema.generator.js'


jest.mock('change-case', () => ({}))


function registerMetadata(compiler: Compiler): void {
  MetadataStorage.set(compiler, {
    applied: true,
    hooks: {
      afterEntrypointArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, TaskWrapper]>(['artifact', 'task']),
      afterSchemaDeclarationArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, SchemaDefinition, TaskWrapper]>(['artifact', 'schemaDefinition', 'task']),
      afterResponseDeclarationArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, ResponseDefinition, TaskWrapper]>(['artifact', 'responseDefinition', 'task']),
      afterOperationDeclarationArtifactGenerated: new AsyncSeriesWaterfallHook<[Artifact, OperationDefinition, TaskWrapper]>(['artifact', 'operationDefinition', 'task']),
    },
  })
}


function createSpec(schemas?: Record<string, OpenAPIV3_1.SchemaObject>): OpenAPIV3_1.Document {
  const spec: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: {
      title: 'Test',
      version: '1.0.0',
    },
    paths: {
      '/api/test': {
        post: {
          responses: {
            200: {
              description: 'OK',
            },
          },
        },
      },
    },
  }

  if (schemas) {
    spec.components = { schemas }
  }

  return spec
}

function createCompiler(spec: OpenAPIV3_1.Document, entrypoint = true): Compiler {
  const document = new ApiDocumentV3_1(
    spec,
    new ModuleDefinition('api', 'file:///api.json'),
  )

  const compiler = {
    context: {
      documents: [document],
      rc: {
        outdir: '/tmp/api',
        rendering: {
          esm: true,
          fileNamingStyle: FileNamingStyle.raw,
          additionalPropertiesType: 'unknown',
          entrypoint,
          emptyJsonRequestBodyMode: 'strict',
          v2Compat: false,
        },
      },
    },
  } as unknown as Compiler

  registerMetadata(compiler)

  return compiler
}


describe('SchemaDeclarationGenerator', () => {
  const generator = new SchemaDeclarationGenerator()
  const task = {} as unknown as TaskWrapper

  it('generates an empty entrypoint when components.schemas is empty', async () => {
    const artifacts = await generator.compile(createCompiler(createSpec({})), task)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].filepath).toBe('./api/types/components/schemas/index.ts')
    expect(artifacts[0].content).toContain('export {}')
  })

  it('generates an empty entrypoint when components is missing', async () => {
    const artifacts = await generator.compile(createCompiler(createSpec()), task)

    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].filepath).toBe('./api/types/components/schemas/index.ts')
    expect(artifacts[0].content).toContain('export {}')
  })

  it('does not generate an entrypoint when rendering.entrypoint is false', async () => {
    const artifacts = await generator.compile(createCompiler(createSpec({}), false), task)

    expect(artifacts).toEqual([])
  })

  it('generates schema definitions and entrypoint when schemas exist', async () => {
    const spec = createSpec({
      User: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    })

    const artifacts = await generator.compile(createCompiler(spec), task)
    const entrypoint = artifacts.find((artifact) => artifact.filepath.endsWith('index.ts'))

    expect(artifacts.map((artifact) => artifact.filepath)).toEqual([
      './api/types/components/schemas/User.schema.ts',
      './api/types/components/schemas/index.ts',
    ])
    expect(entrypoint?.content).toContain("export * from './User.schema'")
  })
})
