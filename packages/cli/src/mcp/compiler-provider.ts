import path from 'path'
import { cosmiconfig } from 'cosmiconfig'
import { Compiler } from '~/compiler/compiler.js'
import { SearchEngine } from '~/search/search-engine.js'
import { FileTracker } from '~/models/file-tracker.js'
import type { ApiDocumentV3_1 } from '~/models/api-document_v3_1.js'
import type { CompilerContext } from '~/compiler/types/compiler-context.js'

interface CompilerProviderOptions {
  config?: string
  debug: boolean
  tolerant: boolean
}

/**
 * Manages the Compiler lifecycle with automatic lazy reload.
 * Tracks .keqrc and .keqfilter for changes; getters transparently
 * re-compile when config files are modified, with built-in concurrency protection.
 */
export class CompilerProvider {
  private tracker = new FileTracker()
  private _engine = new SearchEngine()
  private _documents: ApiDocumentV3_1[] = []
  private _context: CompilerContext = {}
  private options: CompilerProviderOptions

  private constructor(options: CompilerProviderOptions) {
    this.options = options
  }

  static async init(options: CompilerProviderOptions): Promise<CompilerProvider> {
    const provider = new CompilerProvider(options)

    const explore = cosmiconfig('keq')
    const result = options.config
      ? await explore.load(options.config)
      : await explore.search()

    if (!result) {
      throw new Error('Cannot find config file.')
    }

    const configFilepath = result.filepath
    const keqfilterPath = path.resolve(path.dirname(configFilepath), '.keqfilter')

    await provider.tracker.track(configFilepath)
    await provider.tracker.track(keqfilterPath)

    await provider.reload()

    return provider
  }

  async getDocuments(): Promise<ApiDocumentV3_1[]> {
    await this.tracker.ensureFresh(() => this.reload())
    return this._documents
  }

  async getEngine(): Promise<SearchEngine> {
    await this.tracker.ensureFresh(() => this.reload())
    return this._engine
  }

  async getContext(): Promise<CompilerContext> {
    await this.tracker.ensureFresh(() => this.reload())
    return this._context
  }

  async invalidate(): Promise<void> {
    await this.tracker.forceReload(() => this.reload())
  }

  private async reload(): Promise<void> {
    const { config, debug, tolerant } = this.options
    const compiler = new Compiler({
      build: true,
      persist: false,
      silent: true,
      config,
      debug,
      tolerant,
    })
    await compiler.run()
    this._context = compiler.context
    this._documents = compiler.context.documents || []
    await this._engine.buildIndex(this._documents)
    await this.tracker.snapshot()
  }
}
