import path from 'path'
import fs from 'fs-extra'
import { cosmiconfig } from 'cosmiconfig'
import { Compiler } from '~/compiler/compiler.js'
import { SearchEngine } from '~/search/search-engine.js'
import { EmbedderUnavailableError } from '~/search/embedder.js'
import { FileTracker } from '~/models/file-tracker.js'
import { Matcher } from '~/utils/matcher.js'
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
  private _engineAvailable = false
  private _documents: ApiDocumentV3_1[] = []
  private _context: CompilerContext = {}
  private _matcher: Matcher = new Matcher([])
  private _keqfilterPath = ''
  private _configPath = ''
  private _loaded = false
  private _loadPromise: Promise<void> | null = null
  private options: CompilerProviderOptions

  private constructor(options: CompilerProviderOptions) {
    this.options = options
  }

  get configPath(): string {
    return this._configPath
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

    provider._keqfilterPath = keqfilterPath
    provider._configPath = configFilepath
    await provider.tracker.track(configFilepath)
    await provider.tracker.track(keqfilterPath)

    return provider
  }

  async getDocuments(): Promise<ApiDocumentV3_1[]> {
    await this.ensureLoaded()
    return this._documents
  }

  async getEngine(): Promise<SearchEngine> {
    await this.ensureLoaded()
    if (!this._engineAvailable) {
      throw new EmbedderUnavailableError()
    }
    return this._engine
  }

  async getContext(): Promise<CompilerContext> {
    await this.ensureLoaded()
    return this._context
  }

  async getMatcher(): Promise<Matcher> {
    await this.ensureLoaded()
    return this._matcher
  }

  async invalidate(): Promise<void> {
    await this.tracker.forceReload(() => this.reload())
  }

  private async ensureLoaded(): Promise<void> {
    if (this._loaded) {
      await this.tracker.ensureFresh(() => this.reload())
      return
    }
    if (this._loadPromise) {
      await this._loadPromise
      return
    }
    this._loadPromise = this.reload().finally(() => {
      this._loadPromise = null
    })
    await this._loadPromise
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
      filter: false,
    })
    await compiler.run()
    this._context = compiler.context
    this._documents = compiler.context.documents || []

    try {
      await this._engine.buildIndex(this._documents)
      this._engineAvailable = true
    } catch (e) {
      if (e instanceof EmbedderUnavailableError) {
        this._engineAvailable = false
      } else {
        throw e
      }
    }

    if (await fs.exists(this._keqfilterPath)) {
      this._matcher = await Matcher.read(this._keqfilterPath)
    } else {
      this._matcher = new Matcher([])
    }

    await this.tracker.snapshot()
    this._loaded = true
  }
}
