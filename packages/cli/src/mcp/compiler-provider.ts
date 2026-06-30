import path from 'path'
import fs from 'fs-extra'
import { cosmiconfig } from 'cosmiconfig'
import { Compiler } from '~/compiler/compiler.js'
import { SearchEngine } from '~/search/search-engine.js'
import { EmbedderUnavailableError } from '~/search/embedder.js'
import { Matcher } from '~/utils/matcher.js'
import { FileSystemCacheStore } from '~/cache-store/index.js'
import type { CacheStore } from '~/cache-store/index.js'
import type { ApiDocumentV3_1 } from '~/models/api-document_v3_1.js'
import type { CompilerContext } from '~/compiler/types/compiler-context.js'

interface CompilerProviderOptions {
  config?: string
  debug: boolean
  tolerant: boolean
  cacheStore?: CacheStore
}

export class CompilerProvider {
  private _engine: SearchEngine
  private _engineAvailable: boolean
  private _documents: ApiDocumentV3_1[]
  private _context: CompilerContext
  private _matcher: Matcher
  private _configPath: string

  private constructor(
    context: CompilerContext,
    documents: ApiDocumentV3_1[],
    engine: SearchEngine,
    engineAvailable: boolean,
    matcher: Matcher,
    configPath: string,
  ) {
    this._context = context
    this._documents = documents
    this._engine = engine
    this._engineAvailable = engineAvailable
    this._matcher = matcher
    this._configPath = configPath
  }

  get configPath(): string {
    return this._configPath
  }

  get documents(): ApiDocumentV3_1[] {
    return this._documents
  }

  get context(): CompilerContext {
    return this._context
  }

  get matcher(): Matcher {
    return this._matcher
  }

  getEngine(): SearchEngine {
    if (!this._engineAvailable) {
      throw new EmbedderUnavailableError()
    }
    return this._engine
  }

  static async init(options: CompilerProviderOptions): Promise<CompilerProvider> {
    const explore = cosmiconfig('keq')
    const result = options.config
      ? await explore.load(options.config)
      : await explore.search()

    if (!result) {
      throw new Error('Cannot find config file.')
    }

    const configFilepath = result.filepath
    const keqfilterPath = path.resolve(path.dirname(configFilepath), '.keqfilter')
    const cacheStore: CacheStore = options.cacheStore ?? new FileSystemCacheStore(
      path.resolve(path.dirname(configFilepath), '.keq/cache'),
    )

    const compiler = new Compiler({
      build: true,
      persist: false,
      silent: true,
      config: options.config,
      debug: options.debug,
      tolerant: options.tolerant,
      filter: false,
      cacheStore,
    })
    await compiler.run()

    const context = compiler.context
    const documents = context.documents || []

    const engine = new SearchEngine()
    let engineAvailable = false
    try {
      await engine.buildIndex(documents)
      engineAvailable = true
    } catch (e) {
      if (!(e instanceof EmbedderUnavailableError)) {
        throw e
      }
    }

    const matcher = await fs.exists(keqfilterPath)
      ? await Matcher.read(keqfilterPath)
      : new Matcher([])

    return new CompilerProvider(context, documents, engine, engineAvailable, matcher, configFilepath)
  }
}
