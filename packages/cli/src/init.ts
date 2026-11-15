import * as fs from 'fs-extra'
import * as path from 'path'
import { CONFIG_FILENAMES } from '~/constants/index.js'
import { logger } from './utils/logger.js'


interface InitOptions {
  force?: boolean
}

// cosmiconfig's TypeScript loader needs the classic compiler API, which was
// removed in TypeScript 7.
const MAX_TYPESCRIPT_CLASSIC_MAJOR = 6

const TS_CONFIG_TEMPLATE = `import { defineConfig, FileNamingStyle } from '@keq-request/cli'

export default defineConfig({
  // Output directory for generated files
  outdir: './apis',

  // Rendering options for code generation
  rendering: {
    // File naming style for generated files
    fileNamingStyle: FileNamingStyle.raw,
  },

  // OpenAPI/Swagger document sources
  modules: {
    // Example: petstore: 'https://petstore3.swagger.io/api/v3/openapi.json'
  },

  // Plugins to extend code generation functionality
  plugins: [],
})
`

const JS_CONFIG_TEMPLATE = `const { defineConfig } = require('@keq-request/cli')

module.exports = defineConfig({
  // Output directory for generated files
  outdir: './apis',

  // Rendering options for code generation
  rendering: {
    // File naming style for generated files
    // Options: 'raw', 'camelCase', 'capitalCase', 'constantCase', 'dotCase', 'headerCase',
    //          'noCase', 'paramCase', 'pascalCase', 'pathCase', 'sentenceCase',
    //          'snakeCase', 'kebabCase'
    fileNamingStyle: 'raw',
  },

  // OpenAPI/Swagger document sources
  modules: {
    // Example: petstore: 'https://petstore3.swagger.io/api/v3/openapi.json'
  },

  // Plugins to extend code generation functionality
  plugins: [],
})
`

const MJS_CONFIG_TEMPLATE = `import { defineConfig, FileNamingStyle } from '@keq-request/cli'

export default defineConfig({
  // Output directory for generated files
  outdir: './apis',

  // Rendering options for code generation
  rendering: {
    // File naming style for generated files
    fileNamingStyle: FileNamingStyle.raw,
  },

  // OpenAPI/Swagger document sources
  modules: {
    // Example: petstore: 'https://petstore3.swagger.io/api/v3/openapi.json'
  },

  // Plugins to extend code generation functionality
  plugins: [],
})
`

/**
 * Check if a file exists in the current directory or any parent directory
 */
async function findFileInParents(filename: string, startDir: string = process.cwd()): Promise<string | null> {
  let currentDir = startDir

  while (true) {
    const filePath = path.join(currentDir, filename)
    if (await fs.pathExists(filePath)) {
      return filePath
    }

    const parentDir = path.dirname(currentDir)
    // Reached the root directory
    if (parentDir === currentDir) {
      return null
    }
    currentDir = parentDir
  }
}

/**
 * Detect if the project can load a TypeScript config file.
 *
 * A `.keqrc.ts` is loaded through cosmiconfig's TypeScript loader, which relies
 * on the classic compiler API. That API still exists in TypeScript 5.x and 6.x,
 * but was removed in TypeScript 7, and the loader also fails when `typescript`
 * cannot be resolved from the project at all.
 */
async function detectTypeScript(cwd: string): Promise<boolean> {
  const tsconfigPath = await findFileInParents('tsconfig.json', cwd)
  if (tsconfigPath === null) {
    return false
  }

  const typescriptPackageJsonPath = await findFileInParents('node_modules/typescript/package.json', cwd)
  if (typescriptPackageJsonPath === null) {
    return false
  }

  try {
    const { version } = await fs.readJson(typescriptPackageJsonPath)
    if (typeof version !== 'string') {
      return false
    }

    return Number.parseInt(version, 10) <= MAX_TYPESCRIPT_CLASSIC_MAJOR
  } catch {
    return false
  }
}

/**
 * Detect project module system from package.json
 */
async function detectModuleSystem(cwd: string): Promise<'esm' | 'cjs'> {
  const packageJsonPath = await findFileInParents('package.json', cwd)

  if (packageJsonPath) {
    try {
      const packageJson = await fs.readJson(packageJsonPath)
      if (packageJson.type === 'module') {
        return 'esm'
      }
    } catch (error) {
      // Ignore JSON parse errors
    }
  }

  return 'cjs'
}

/**
 * Get the appropriate config filename and content based on project setup
 */
export async function getConfigFileInfo(cwd: string = process.cwd()): Promise<{ filename: string; content: string }> {
  const hasTypeScript = await detectTypeScript(cwd)
  const moduleSystem = await detectModuleSystem(cwd)

  if (hasTypeScript) {
    return {
      filename: '.keqrc.ts',
      content: TS_CONFIG_TEMPLATE,
    }
  }

  if (moduleSystem === 'esm') {
    return {
      filename: '.keqrc.mjs',
      content: MJS_CONFIG_TEMPLATE,
    }
  }

  return {
    filename: '.keqrc.js',
    content: JS_CONFIG_TEMPLATE,
  }
}

/**
 * Check if any config file already exists
 */
async function findExistingConfigFile(): Promise<string | null> {
  for (const filename of CONFIG_FILENAMES) {
    const filePath = path.join(process.cwd(), filename)
    if (await fs.pathExists(filePath)) {
      return filename
    }
  }

  return null
}

export async function initConfig(options: InitOptions): Promise<void> {
  try {
    // Check for existing config file
    const existingConfig = await findExistingConfigFile()

    if (existingConfig && !options.force) {
      logger.error(`Config file already exists: ${existingConfig}`)
      logger.error('Use --force to overwrite')
      process.exit(1)
    }

    // Get config file info based on project setup
    const { filename, content } = await getConfigFileInfo()
    const filePath = path.join(process.cwd(), filename)

    // Write config file
    await fs.writeFile(filePath, content, 'utf8')

    logger.log(`Created config file: ${filename}`)

    // Print helpful next steps
    console.log('\nNext steps:')
    console.log('1. Edit the config file to add your OpenAPI/Swagger document URLs')
    console.log('2. Run "keq build" to generate API client code')
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
