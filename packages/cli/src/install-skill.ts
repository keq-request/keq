import * as fs from 'fs-extra'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { logger } from './utils/logger.js'


export async function installSkill(): Promise<void> {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const skillsSourceDir = path.resolve(currentDir, '..', 'skills')

  if (!await fs.pathExists(skillsSourceDir)) {
    logger.error('Skills directory not found. This may indicate a corrupted installation.')
    process.exit(1)
  }

  const entries = await fs.readdir(skillsSourceDir)

  if (entries.length === 0) {
    logger.warn('No skill files found to install.')
    return
  }

  const targetDir = path.join(process.cwd(), '.claude', 'skills')

  for (const entry of entries) {
    const sourcePath = path.join(skillsSourceDir, entry)
    const targetPath = path.join(targetDir, entry)

    await fs.copy(sourcePath, targetPath, { overwrite: true })
    logger.log(`Installed: ${entry}`)
  }

  logger.log(`\n${entries.length} skill(s) installed to .claude/skills/`)
}
