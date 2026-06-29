import path from 'path'
import { CompilerProvider } from './compiler-provider.js'
import { findConfigInDir } from './find-config-in-dir.js'

export interface ProjectEntry {
  configPath: string
  projectDir: string
  packageName?: string
}

interface RegistryOptions {
  debug: boolean
  tolerant: boolean
}

/**
 * Manages multiple CompilerProvider instances for monorepo/multi-project support.
 * Lazily initializes providers on first access and dynamically registers new projects
 * when an unknown project directory is requested.
 */
export class CompilerProviderRegistry {
  private entries: Map<string, ProjectEntry> = new Map()
  private providers: Map<string, CompilerProvider> = new Map()
  private options: RegistryOptions

  constructor(options: RegistryOptions) {
    this.options = options
  }

  register(entry: ProjectEntry): void {
    this.entries.set(entry.projectDir, entry)
  }

  has(projectDir: string): boolean {
    return this.entries.has(projectDir)
  }

  list(): ProjectEntry[] {
    return [...this.entries.values()]
  }

  async resolve(projectDir?: string): Promise<CompilerProvider> {
    const entry = await this.resolveEntry(projectDir)
    const cached = this.providers.get(entry.projectDir)
    if (cached) return cached

    const provider = await CompilerProvider.init({
      config: entry.configPath,
      debug: this.options.debug,
      tolerant: this.options.tolerant,
    })
    this.providers.set(entry.projectDir, provider)
    return provider
  }

  getConfigPath(projectDir?: string): string {
    const resolved = this.resolveEntrySync(projectDir)
    return resolved.configPath
  }

  private async resolveEntry(projectDir?: string): Promise<ProjectEntry> {
    if (!projectDir) {
      return this.resolveDefault()
    }

    if (!path.isAbsolute(projectDir)) {
      throw new Error(`The 'project' parameter must be an absolute path. Received: ${projectDir}. Please call 'list_projects' tool to get valid project paths.`)
    }

    const existing = this.entries.get(projectDir)
    if (existing) return existing

    const configPath = await findConfigInDir(projectDir)
    if (!configPath) {
      throw new Error(`No keqrc config file found in ${projectDir}. Please call 'list_projects' tool to get valid project paths.`)
    }

    const entry: ProjectEntry = { configPath, projectDir }
    this.register(entry)
    return entry
  }

  private resolveEntrySync(projectDir?: string): ProjectEntry {
    if (!projectDir) {
      return this.resolveDefault()
    }

    if (!path.isAbsolute(projectDir)) {
      throw new Error(`The 'project' parameter must be an absolute path. Received: ${projectDir}. Please call 'list_projects' tool to get valid project paths.`)
    }

    const existing = this.entries.get(projectDir)
    if (!existing) {
      throw new Error(`No keqrc config file found in ${projectDir}. Please call 'list_projects' tool to get valid project paths.`)
    }
    return existing
  }

  private resolveDefault(): ProjectEntry {
    if (this.entries.size === 0) {
      throw new Error(
        'No keq project found. Please call \'list_projects\' tool first to check available projects, or specify \'project\' parameter with the absolute path to your project directory containing a keqrc config file.',
      )
    }

    if (this.entries.size === 1) {
      return this.entries.values().next().value!
    }

    const projects = [...this.entries.values()]
      .map((e) => {
        const label = e.packageName ? ` [${e.packageName}]` : ''
        return `- ${e.projectDir} (${path.basename(e.configPath)})${label}`
      })
      .join('\n')

    throw new Error(
      `This is a monorepo with multiple keq projects. Please call 'list_projects' tool to get the full project list, then specify 'project' parameter with one of the following project directories:\n${projects}`,
    )
  }
}
