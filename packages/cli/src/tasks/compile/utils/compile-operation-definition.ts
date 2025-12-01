import * as R from 'ramda'
import { KeqQueryOptions } from 'keq'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { operationTypeRenderer, typeNameFactory } from '~/renderer/operation-type/index.js'
import { RuntimeConfig } from '~/types/runtime-config.js'
import { operationRequestRenderer } from '~/renderer/operation-request/index.js'
import { isArtifactCompiledBy } from './compile-schema-definition.js'
import type { Compiler } from '~/compiler/compiler.js'
import { DependencyIdentifier, OperationDefinition, Artifact } from '~/tasks/utils/index.js'
import { TaskWrapper } from '~/tasks/types/index.js'


interface CompileProcessorOptions {
  compiler: Compiler
  task: TaskWrapper
  rc: RuntimeConfig
  requestArtifact: Artifact
  schemaArtifacts: Artifact[]
  operationDefinitions: OperationDefinition[]
}


function genOperationTypeFilepath(operationDefinition: OperationDefinition): string {
  const filename = `${operationDefinition.operationId}.type.ts`
  return [
    '.',
    operationDefinition.module.name,
    'types',
    filename,
  ].join('/')
}

function genOperationRequestFilepath(operationDefinition: OperationDefinition): string {
  const filename = `${operationDefinition.operationId}.request.ts`
  return [
    '.',
    operationDefinition.module.name,
    'operations',
    filename,
  ].join('/')
}

function genEntrypointFilepath(moduleName: string): string {
  return [
    '.',
    moduleName,
    'operations',
    'index.ts',
  ].join('/')
}

export async function compileOperationDefinition(options: CompileProcessorOptions): Promise<Artifact[]> {
  const { compiler, task, rc, requestArtifact: requestArtifact, schemaArtifacts, operationDefinitions } = options

  const alias = (name: string): string => `${name}Schema`
  const qs = (parameter: OpenAPIV3_1.ParameterObject): KeqQueryOptions | undefined => {
    if (typeof rc.qs === 'function') {
      return rc.qs(parameter)
    } else if (typeof rc.qs === 'object') {
      return rc.qs
    }

    const style = parameter.style || 'form'
    const explode = parameter.explode ?? true

    if (style === 'deepObject') {
      return { arrayFormat: 'brackets' }
    } else if (explode) {
      return { arrayFormat: 'repeat' }
    } else {
      if (style === 'form') {
        return { arrayFormat: 'comma' }
      } else if (style === 'spaceDelimited') {
        return { arrayFormat: 'space' }
      } else if (style === 'pipeDelimited') {
        return { arrayFormat: 'pipe' }
      }
    }

    return {}
  }

  async function createTypeArtifact(operationDefinition: OperationDefinition): Promise<Artifact> {
    const content = await operationTypeRenderer(operationDefinition, alias)
    const filepath = genOperationTypeFilepath(operationDefinition)

    const typeArtifact = new Artifact({
      id: filepath,
      filepath,
      content,
      extensionName: '.type.ts',
    })

    typeArtifact.addDependence('keq', ['KeqOperation', 'KeqQueryInit', 'KeqPathParameterInit'])
    const dependentSchemaDefinitions = operationDefinition.getDependencies()

    for (const dependentSchemaDefinition of dependentSchemaDefinitions) {
      const dependentArtifact = schemaArtifacts.find(isArtifactCompiledBy(dependentSchemaDefinition))
      if (!dependentArtifact) {
        typeArtifact.addWarn(`Cannot find dependent $ref: ${dependentSchemaDefinition.id}`)
        continue
      }

      typeArtifact.addDependence(dependentArtifact, [
        new DependencyIdentifier(dependentSchemaDefinition.name, alias(dependentSchemaDefinition.name)),
      ])
    }

    return await compiler.hooks.afterCompileOperationType.promise(typeArtifact, operationDefinition, task)
  }

  async function createRequestArtifact(operationDefinition: OperationDefinition, typeArtifact: Artifact): Promise<Artifact> {
    const typeName = typeNameFactory(operationDefinition)

    const content = await operationRequestRenderer(operationDefinition, { qs })
    const filepath = genOperationRequestFilepath(operationDefinition)

    const artifact = new Artifact({
      id: filepath,
      filepath,
      content,
      extensionName: '.request.ts',
    })

    artifact.addDependence('keq', ['Keq'])
    // artifact.addDependence(rc.request || 'keq', ['request'])
    artifact.addDependence(requestArtifact, ['request'])
    artifact.addDependence(
      typeArtifact,
      [
        'Operation',
        typeName('ResponseBodies'),
        typeName('RequestParameters'),
      ],
    )
    artifact.addDependence(
      typeArtifact,
      [
        `${typeName('RequestQuery')}`,
        `${typeName('RequestHeaders')}`,
        `${typeName('RequestBodies')}`,
      ],
      { export: true },
    )
    return await compiler.hooks.afterCompileOperationRequest.promise(artifact, operationDefinition, task)
  }


  const artifacts = R.unnest(
    await Promise.all(
      operationDefinitions.map(async (operationDefinition): Promise<Artifact[]> => {
        const typeArtifact = await createTypeArtifact(operationDefinition)
        const operationArtifact = await createRequestArtifact(operationDefinition, typeArtifact)

        return [typeArtifact, operationArtifact]
      }),
    ),
  )


  const operationDefinitionsGroupByModuleName = R.groupBy(
    (operationDefinition) => operationDefinition.module.name,
    operationDefinitions,
  )

  const entrypointArtifacts = Object.entries(operationDefinitionsGroupByModuleName)
    .map(([moduleName, operationDefinitions]) => {
      const filepath = genEntrypointFilepath(moduleName)
      const artifact = new Artifact({
        id: filepath,
        filepath,
        content: [
          '/* @anchor:file:start */',
          '/* @anchor:file:end */',
        ].join('\n'),
      })

      for (const operationDefinition of (operationDefinitions || [])) {
        const dependentArtifact = artifacts.find((artifact) => artifact.filepath === genOperationRequestFilepath(operationDefinition))
        if (!dependentArtifact) {
          artifact.addWarn(`Cannot find operation: operation = ${operationDefinition.operationId}, pathname = ${operationDefinition.pathname}, method = ${operationDefinition.method}`)
          continue
        }

        artifact.addDependence(dependentArtifact, [], { export: true })
      }

      return artifact
    })

  return [...artifacts, ...entrypointArtifacts]
}
