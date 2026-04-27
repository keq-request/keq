import type { Config } from 'jest'
import { pathsToModuleNameMapper } from 'ts-jest'


export default async (): Promise<Config> => {
  const tsconfig = (await import('./tsconfig.json')).default

  return {
    transform: {
      '^.+\\.tsx?$': ['ts-jest', {
        tsconfig: {
          noEmitOnError: false,
        },
      }],
    },
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>', useESM: true }),
  }
}
