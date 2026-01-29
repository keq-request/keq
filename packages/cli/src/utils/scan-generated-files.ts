import * as path from 'path'
import fs from 'fs-extra'

export interface GeneratedFile {
  /** Absolute path to the file */
  absolutePath: string
  /** Relative path from outdir */
  relativePath: string
}

/**
 * Recursively find all files in a directory
 */
async function findAllFiles(dir: string, extensions?: string[]): Promise<string[]> {
  const results: string[] = []

  async function scan(currentDir: string): Promise<void> {
    let entries: string[]
    try {
      entries = await fs.readdir(currentDir)
    } catch (err) {
      // Skip directories that can't be read
      return
    }

    for (const entry of entries) {
      // Skip node_modules and .git directories
      if (entry === 'node_modules' || entry === '.git') {
        continue
      }

      const fullPath = path.join(currentDir, entry)
      let stat: fs.Stats
      try {
        stat = await fs.stat(fullPath)
      } catch (err) {
        // Skip entries that can't be stat'd
        continue
      }

      if (stat.isDirectory()) {
        await scan(fullPath)
      } else if (stat.isFile()) {
        if (!extensions) {
          // If no extensions specified, include all files
          results.push(fullPath)
        } else {
          const ext = path.extname(fullPath)
          if (extensions.includes(ext)) {
            results.push(fullPath)
          }
        }
      }
    }
  }

  await scan(dir)
  return results
}

/**
 * Scan all files in the output directory
 * @param outdir The output directory to scan
 * @returns List of all files with their paths
 */
async function scanAllFiles(outdir: string): Promise<GeneratedFile[]> {
  const absoluteOutdir = path.resolve(outdir)

  // Check if outdir exists
  if (!await fs.exists(absoluteOutdir)) {
    return []
  }

  // Find all files in outdir (no extension filter)
  const files = await findAllFiles(absoluteOutdir)

  return files.map((file) => ({
    absolutePath: file,
    relativePath: path.relative(absoluteOutdir, file),
  }))
}

/**
 * Find invalid files that are not in the current artifacts list
 * This includes both non-generated files and outdated generated files
 * @param outdir The output directory
 * @param validFilePaths List of valid file paths (relative to outdir)
 * @returns List of invalid files
 */
export async function findInvalidFiles(
  outdir: string,
  validFilePaths: string[],
): Promise<GeneratedFile[]> {
  const allFiles = await scanAllFiles(outdir)
  const validPathsSet = new Set(validFilePaths.map((p) => path.normalize(p)))

  return allFiles.filter((file) => {
    const normalizedPath = path.normalize(file.relativePath)
    return !validPathsSet.has(normalizedPath)
  })
}
