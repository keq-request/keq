import type { JestConfigWithTsJest } from 'ts-jest'
import { pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from './tsconfig.json'


const common = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/', useESM: true }),
  transform: {
    '\\.hbs$': '<rootDir>/__tests__/jest-raw.transform.cjs',
  },
}

const jestConfig: JestConfigWithTsJest = {
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**',
    '!<rootDir>/src/types/*.ts',
    '!<rootDir>/**/*.node.spec.ts',
    '!<rootDir>/**/*.browser.spec.ts',
  ],
  coverageReporters: ['text', 'cobertura', 'html'],
  coveragePathIgnorePatterns: [
    '.*__snapshots__/.*',
  ],

  projects: [
    {
      ...common,
      displayName: 'Node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/node/**/*.spec.ts',
        '<rootDir>/__tests__/*.spec.ts',
        '<rootDir>/src/**/*.node.spec.ts',
        '<rootDir>/src/**/!(*.node|*.browser).spec.ts',
      ],
    },
    {
      ...common,
      displayName: 'Browser',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: [
        '<rootDir>/__tests__/browser/**/*.spec.ts',
        '<rootDir>/__tests__/*.spec.ts',
        '<rootDir>/src/**/*.browser.spec.ts',
        '<rootDir>/src/**/!(*.node|*.browser).spec.ts',
      ],
    },
  ],
}

export default jestConfig


