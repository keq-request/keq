import type { Config } from 'jest'
import { pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from './tsconfig.json'


// eslint-disable-next-line @typescript-eslint/require-await
export default async (): Promise<Config> => ({
  preset: 'ts-jest',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src', useESM: true }),
})
