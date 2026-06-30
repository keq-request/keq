import fs from 'fs-extra'

interface TrackedFile {
  filepath: string
  mtimeMs: number
}

/**
 * Passive file change tracker based on mtime comparison.
 * Instead of actively watching filesystem events, it checks for changes on demand,
 * suitable for lazy reload of config files in long-lived processes.
 */
export class FileTracker {
  private files: TrackedFile[] = []
  private reloadPromise: Promise<void> | null = null

  async track(filepath: string): Promise<void> {
    let mtimeMs = 0
    try {
      const stat = await fs.stat(filepath)
      mtimeMs = stat.mtimeMs
    } catch {
      // file does not exist yet
    }
    this.files.push({ filepath, mtimeMs })
  }

  async ensureFresh(reload: () => Promise<void>): Promise<void> {
    if (!await this.isChanged()) return
    if (this.reloadPromise) {
      await this.reloadPromise
      return
    }
    if (!await this.isChanged()) return
    this.reloadPromise = reload().finally(() => {
      this.reloadPromise = null
    })
    await this.reloadPromise
  }

  async forceReload(reload: () => Promise<void>): Promise<void> {
    if (this.reloadPromise) {
      await this.reloadPromise
    }
    this.reloadPromise = reload().finally(() => {
      this.reloadPromise = null
    })
    await this.reloadPromise
  }

  async snapshot(): Promise<void> {
    for (const file of this.files) {
      try {
        const stat = await fs.stat(file.filepath)
        file.mtimeMs = stat.mtimeMs
      } catch {
        file.mtimeMs = 0
      }
    }
  }

  async isChanged(): Promise<boolean> {
    for (const file of this.files) {
      try {
        const stat = await fs.stat(file.filepath)
        if (stat.mtimeMs !== file.mtimeMs) return true
      } catch {
        if (file.mtimeMs !== 0) return true
      }
    }
    return false
  }
}
