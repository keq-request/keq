import type { Config } from 'jest'
import { pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from './tsconfig.json'


// eslint-disable-next-line @typescript-eslint/require-await
export default async (): Promise<Config> => ({
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        noEmitOnError: false,
      },
    }],
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.spec.ts',
    '<rootDir>/src/**/*.spec.ts',
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>', useESM: true }),
})
