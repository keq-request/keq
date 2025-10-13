import * as R from 'ramda'
import { jsonSchemaRenderer } from '~/renderer/json-schema/index.js'
import { Artifact } from '~/tasks/utils/artifact'
import { SchemaDefinition } from '~/tasks/utils/schema-definition'


interface CompileProcessorOptions {
  // rc: RuntimeConfig
  schemaDefinitions: SchemaDefinition[]
}

export function genSchemaDefinitionFilepath(schemaDefinition: SchemaDefinition): string {
  const filename = `${schemaDefinition.name}.schema.ts`
  return [
    '.',
    schemaDefinition.module.name,
    'components',
    'schemas',
    filename,
  ].join('/')
}

function genEntrypointFilepath(moduleName): string {
  return [
    '.',
    moduleName,
    'components',
    'schemas',
    'index.ts',
  ].join('/')
}

export const isArtifactCompiledBy = function (schemaDefinition: SchemaDefinition) {
  return (artifact: Artifact): boolean => artifact.id === genSchemaDefinitionFilepath(schemaDefinition)
}

export async function compileSchemaDefinition(options: CompileProcessorOptions): Promise<Artifact[]> {
  const { schemaDefinitions } = options

  const artifacts = await Promise.all(
    schemaDefinitions
      .map(async (schemaDefinition): Promise<Artifact> => {
        const content = await jsonSchemaRenderer(schemaDefinition)
        const filepath = genSchemaDefinitionFilepath(schemaDefinition)

        return new Artifact({
          id: filepath,
          filepath,
          content,
          extensionName: '.schema.ts',
        })
      }),
  )


  for (const schemaDefinition of schemaDefinitions) {
    const artifact = artifacts.find(isArtifactCompiledBy(schemaDefinition))
    if (!artifact) continue

    const dependentSchemaDefinitions = schemaDefinition.getDependencies()

    for (const dependentSchemaDefinition of dependentSchemaDefinitions) {
      const dependentArtifact = artifacts.find(isArtifactCompiledBy(dependentSchemaDefinition))
      if (!dependentArtifact) {
        artifact.addWarn(`Cannot find dependent $ref: ${dependentSchemaDefinition.id}`)
        continue
      }

      artifact.addDependence(dependentArtifact, [dependentSchemaDefinition.name])
    }
  }


  const schemaDefinitionsGroupByModuleName = R.groupBy(
    (schemaDefinition) => schemaDefinition.module.name,
    schemaDefinitions,
  )


  const entrypointArtifacts = Object.entries(schemaDefinitionsGroupByModuleName)
    .map(([moduleName, schemaDefinitions]) => {
      const filepath = genEntrypointFilepath(moduleName)

      const artifact = new Artifact({
        id: filepath,
        filepath,
        content: '',
      })

      for (const schemaDefinition of (schemaDefinitions || [])) {
        const dependentArtifact = artifacts.find(isArtifactCompiledBy(schemaDefinition))
        if (!dependentArtifact) {
          artifact.addWarn(`Cannot find dependent $ref: ${schemaDefinition.id}`)
          continue
        }

        artifact.addDependence(dependentArtifact, [], { export: true })
      }

      return artifact
    })

  return [...artifacts, ...entrypointArtifacts]
}
