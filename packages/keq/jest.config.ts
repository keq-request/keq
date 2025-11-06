import fs from 'fs'
import path from 'path'
import type { Config } from 'jest'
import { pathsToModuleNameMapper } from 'ts-jest'


export default (): Config => {
  const tsconfig = JSON.parse(fs.readFileSync(path.join(__dirname, './tsconfig.json'), 'utf-8'))

  return {
    preset: 'ts-jest',
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/src', useESM: true }),
    testEnvironment: 'node',
    testMatch: [
      '<rootDir>/__tests__/node/**/*.spec.ts',
      '<rootDir>/__tests__/*.spec.ts',
      '<rootDir>/src/**/*.node.spec.ts',
      '<rootDir>/src/**/!(*.node|*.browser).spec.ts',
    ],
  }
}
