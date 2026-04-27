import type { Config } from 'jest'
import { pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from './tsconfig.json'


export default async (): Promise<Config> => ({
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        noEmitOnError: false,
      },
    }],
  },
  // setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>', useESM: true }),
  testMatch: [
    '<rootDir>/__tests__/**/*.spec.ts',
    '<rootDir>/src/**/*.spec.ts',
  ],
})
