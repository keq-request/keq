import type { Config } from 'jest'
import { pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from './tsconfig.json'


export default (): Config => ({
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        noEmitOnError: false,
      },
    }],
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>', useESM: true }),
})
