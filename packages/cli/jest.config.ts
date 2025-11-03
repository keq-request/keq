import type { Config } from 'jest'
import { pathsToModuleNameMapper } from 'ts-jest'


export default async (): Promise<Config> => {
  const tsconfig = (await import('./tsconfig.json')).default

  return {
    preset: 'ts-jest',
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/src', useESM: true }),
  }
}
