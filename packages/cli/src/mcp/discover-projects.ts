import path from 'path'
import fs from 'fs-extra'
import * as yaml from 'js-yaml'
import picomatch from 'picomatch'
import { cosmiconfig } from 'cosmiconfig'
import { findConfigInDir } from './find-config-in-dir.js'

export interface ProjectEntry {
  configPath: string
  projectDir: string
}

export async function discoverProjects(config?: string): Promise<ProjectEntry[]> {
  if (config) {
    const configPath = path.resolve(config)
    return [{ configPath, projectDir: path.dirname(configPath) }]
  }

  const cwd = process.cwd()
  const monorepoEntries = await discoverFromMonorepo(cwd)
  if (monorepoEntries.length > 0) {
    return monorepoEntries
  }

  const explore = cosmiconfig('keq')
  const result = await explore.search()
  if (result) {
    return [{ configPath: result.filepath, projectDir: path.dirname(result.filepath) }]
  }

  return []
}

async function discoverFromMonorepo(root: string): Promise<ProjectEntry[]> {
  const workspaceGlobs = await getWorkspaceGlobs(root)
  if (workspaceGlobs.length === 0) return []

  const memberDirs = await expandWorkspaceGlobs(root, workspaceGlobs)

  const dirs = [root, ...memberDirs]
  const entries: ProjectEntry[] = []

  for (const dir of dirs) {
    const configPath = await findConfigInDir(dir)
    if (configPath) {
      entries.push({ configPath, projectDir: dir })
    }
  }

  return entries
}

async function getWorkspaceGlobs(root: string): Promise<string[]> {
  const pnpmWorkspacePath = path.join(root, 'pnpm-workspace.yaml')
  if (await fs.pathExists(pnpmWorkspacePath)) {
    const content = await fs.readFile(pnpmWorkspacePath, 'utf-8')
    const parsed = yaml.load(content) as { packages?: string[] } | null
    if (parsed?.packages) {
      return parsed.packages
    }
  }

  const packageJsonPath = path.join(root, 'package.json')
  if (await fs.pathExists(packageJsonPath)) {
    const pkg = await fs.readJson(packageJsonPath) as { workspaces?: string[] | { packages?: string[] } }
    if (Array.isArray(pkg.workspaces)) {
      return pkg.workspaces
    }
    if (Array.isArray(pkg.workspaces?.packages)) {
      return pkg.workspaces.packages
    }
  }

  return []
}

async function expandWorkspaceGlobs(root: string, globs: string[]): Promise<string[]> {
  const dirs: string[] = []

  for (const glob of globs) {
    const parts = glob.split('/')
    const baseParts: string[] = []
    let globPart = ''

    for (let i = 0; i < parts.length; i++) {
      if (parts[i].includes('*') || parts[i].includes('{') || parts[i].includes('?')) {
        globPart = parts.slice(i).join('/')
        break
      }
      baseParts.push(parts[i])
    }

    const baseDir = path.join(root, ...baseParts)
    if (!await fs.pathExists(baseDir)) continue

    if (!globPart) {
      const fullPath = path.resolve(root, glob)
      if (await fs.pathExists(fullPath)) {
        dirs.push(fullPath)
      }
      continue
    }

    const matcher = picomatch(globPart)
    const candidates = await fs.readdir(baseDir, { withFileTypes: true })

    for (const entry of candidates) {
      if (!entry.isDirectory()) continue
      if (matcher(entry.name)) {
        dirs.push(path.join(baseDir, entry.name))
      }
    }
  }

  return dirs
}
