import * as R from 'ramda'
import { operationTypeRenderer, typeNameFactory } from '~/renderer/operation-type'
import { RuntimeConfig } from '~/types/runtime-config'
import { operationRequestRenderer } from '~/renderer/operation-request'
import { Artifact } from '~/tasks/utils/artifact'
import { OperationDefinition } from '~/tasks/utils/operation-definition'
import { isArtifactCompiledBy } from './compile-schema-definition'


interface CompileProcessorOptions {
  rc: RuntimeConfig
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
  const { rc, schemaArtifacts, operationDefinitions } = options


  function createTypeArtifact(operationDefinition: OperationDefinition): Artifact {
    const content = operationTypeRenderer(operationDefinition)
    const filepath = genOperationTypeFilepath(operationDefinition)

    const typeArtifact = new Artifact({
      id: filepath,
      filepath,
      content,
      extensionName: '.type.ts',
    })

    typeArtifact.addDependence('keq', ['KeqOperation'])
    const dependentSchemaDefinitions = operationDefinition.getDependencies()

    for (const dependentSchemaDefinition of dependentSchemaDefinitions) {
      const dependentArtifact = schemaArtifacts.find(isArtifactCompiledBy(dependentSchemaDefinition))
      if (!dependentArtifact) {
        typeArtifact.addWarn(`Cannot find dependent $ref: ${dependentSchemaDefinition.id}`)
        continue
      }

      typeArtifact.addDependence(dependentArtifact, [dependentSchemaDefinition.name])
    }

    return typeArtifact
  }

  function createRequestArtifact(operationDefinition: OperationDefinition, typeArtifact: Artifact): Artifact {
    const typeName = typeNameFactory(operationDefinition)

    const content = operationRequestRenderer(operationDefinition)
    const filepath = genOperationRequestFilepath(operationDefinition)

    const artifact = new Artifact({
      id: filepath,
      filepath,
      content,
      extensionName: '.request.ts',
    })

    artifact.addDependence('keq', ['Keq'])
    artifact.addDependence(rc.request || 'keq', ['request'])
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
        `${typeName('RequestBody')}`,
      ],
      { export: true },
    )

    return artifact
  }


  const artifacts = operationDefinitions.flatMap((operationDefinition): Artifact[] => {
    const typeArtifact = createTypeArtifact(operationDefinition)
    const operationArtifact = createRequestArtifact(operationDefinition, typeArtifact)

    return [typeArtifact, operationArtifact]
  })


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
        content: '',
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
