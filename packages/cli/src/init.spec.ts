import { afterEach, describe, expect, test } from '@jest/globals'
import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import { getConfigFileInfo } from './init.js'


const tempDirs: string[] = []


async function createProject(files: Record<string, string | object>): Promise<string> {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'keq-init-'))
  tempDirs.push(cwd)

  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(cwd, filename)
    await fs.ensureDir(path.dirname(filePath))
    await fs.writeFile(filePath, typeof content === 'string' ? content : JSON.stringify(content), 'utf8')
  }

  return cwd
}

function typescriptPackage(version: string): object {
  return {
    name: 'typescript',
    version,
  }
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)))
})


describe('getConfigFileInfo', () => {
  test('uses .keqrc.ts when tsconfig.json and TypeScript 6 are present', async () => {
    const cwd = await createProject({
      'tsconfig.json': '{}',
      'node_modules/typescript/package.json': typescriptPackage('6.0.3'),
    })

    await expect(getConfigFileInfo(cwd)).resolves.toMatchObject({ filename: '.keqrc.ts' })
  })

  test('falls back to .keqrc.js when TypeScript is not installed', async () => {
    const cwd = await createProject({
      'tsconfig.json': '{}',
      'package.json': {},
    })

    await expect(getConfigFileInfo(cwd)).resolves.toMatchObject({ filename: '.keqrc.js' })
  })

  test('falls back to .keqrc.mjs when TypeScript is not installed and the project is ESM', async () => {
    const cwd = await createProject({
      'tsconfig.json': '{}',
      'package.json': { type: 'module' },
    })

    await expect(getConfigFileInfo(cwd)).resolves.toMatchObject({ filename: '.keqrc.mjs' })
  })

  test('falls back to .keqrc.js when TypeScript 7 is installed', async () => {
    const cwd = await createProject({
      'tsconfig.json': '{}',
      'node_modules/typescript/package.json': typescriptPackage('7.0.2'),
    })

    await expect(getConfigFileInfo(cwd)).resolves.toMatchObject({ filename: '.keqrc.js' })
  })

  test('finds tsconfig.json and TypeScript in a parent directory', async () => {
    const root = await createProject({
      'tsconfig.json': '{}',
      'node_modules/typescript/package.json': typescriptPackage('5.9.3'),
      'packages/app/package.json': {},
    })

    await expect(getConfigFileInfo(path.join(root, 'packages/app')))
      .resolves.toMatchObject({ filename: '.keqrc.ts' })
  })

  test('ignores TypeScript when there is no tsconfig.json', async () => {
    const cwd = await createProject({
      'package.json': {},
      'node_modules/typescript/package.json': typescriptPackage('6.0.3'),
    })

    await expect(getConfigFileInfo(cwd)).resolves.toMatchObject({ filename: '.keqrc.js' })
  })
})
