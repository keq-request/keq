import type { Config } from 'jest'
import { pathsToModuleNameMapper } from 'ts-jest'


export default async (): Promise<Config> => {
  const tsconfig = (await import('./tsconfig.json', { with: { type: 'json' } })).default

  return {
    preset: 'ts-jest',
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/', useESM: true }),

    displayName: 'Browser',
    testEnvironment: 'jest-environment-jsdom',
    testMatch: [
      '<rootDir>/__tests__/browser/**/*.spec.ts',
      '<rootDir>/__tests__/*.spec.ts',
      '<rootDir>/src/**/*.browser.spec.ts',
      '<rootDir>/src/**/!(*.node|*.browser).spec.ts',
    ],
  }
}
