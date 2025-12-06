import fs from 'fs-extra'
import * as path from 'path'
import * as yaml from 'js-yaml'
import * as validUrl from 'valid-url'
import { request } from 'keq'
import type { OpenAPI } from '@scalar/openapi-types'
import { ModuleDefinition } from './module-definition.js'
import { upgrade, validate } from '@scalar/openapi-parser'
import { ApiDocumentV3_1 } from './api-document_v3_1.js'
import { fixSwagger } from 'swagger-fix'
import { RuntimeConfig } from '~/types/runtime-config.js'
import { Debugger } from '~/utils/debugger.js'
import { OpenapiUtils } from '../../utils/openapi-utils/index.js'


export class ApiDocument<T extends OpenAPI.Document = OpenAPI.Document> {
  readonly module: ModuleDefinition
  readonly specification: T

  constructor(specification: T, module: ModuleDefinition) {
    this.module = module
    this.specification = specification
  }

  static cache: Map<string, ApiDocument> = new Map()

  private static async download(url: string): Promise<OpenAPI.Document> {
    let content: string
    try {
      const res = await request
        .get(url)
        .resolveWith('response')

      if (res.status >= 400) throw new Error(`Request failed with status code ${res.status}`)

      content = await res.text()
    } catch (e) {
      if (e instanceof Error) {
        e.message = `Unable get the openapi/swagger file from ${url}: ${e.message}`
      }

      throw e
    }


    try {
      return JSON.parse(content) as OpenAPI.Document
    } catch (e) {
      throw new Error(`The openapi/swagger file get from url isn't json: ${url}`)
    }
  }

  private static async read(filePath: string): Promise<OpenAPI.Document> {
    const fileExt = path.extname(filePath)
    const content = await fs.readFile(filePath, 'utf8')

    if (['.yml', '.yaml'].includes(fileExt)) {
      return yaml.load(content) as OpenAPI.Document
    } else if (fileExt === '.json') {
      return JSON.parse(content) as OpenAPI.Document
    }

    throw new Error(`File ${fileExt} not support.`)
  }

  static async create(moduleDefinition: ModuleDefinition): Promise<ApiDocument> {
    const { address } = moduleDefinition

    if (this.cache.has(moduleDefinition.address)) {
      return this.cache.get(moduleDefinition.address)!
    }

    const openapi = validUrl.isUri(address)
      ? await this.download(address)
      : await this.read(address)

    return new ApiDocument(openapi, moduleDefinition)
  }

  async validate(): ReturnType<typeof validate> {
    return await validate(this.specification)
  }

  // remove chinese and special symbols
  fix(): ApiDocument {
    const openapi: T = fixSwagger(this.specification as any)

    return new ApiDocument(
      openapi,
      new ModuleDefinition(
        this.module.name,
        `file://${this.module.name}.fixed.json`,
      ),
    )
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async toV3_1(rc?: RuntimeConfig): Promise<ApiDocumentV3_1> {
    const debug = new Debugger(rc)
    let spec: any = this.specification

    const { specification } = upgrade(spec)
    spec = specification
    debug.writeOpenapi(`.keq/${this.module.name}.3_1.json`, spec)

    spec = OpenapiUtils.dereferenceOperation(spec)
    debug.writeOpenapi(`.keq/${this.module.name}.3_1.sharked.json`, spec)

    if (rc?.operationIdFactory) {
      const operationIdFactory = rc.operationIdFactory
      spec = OpenapiUtils.updateOperationId(
        spec,
        (method, pathname, operation) => operationIdFactory({ method, pathname, operation, module: this.module }),
      )
      debug.writeOpenapi(`.keq/${this.module.name}.3_1.formatted.json`, spec)
    }

    return new ApiDocumentV3_1(
      spec,
      new ModuleDefinition(
        this.module.name,
        `file://${this.module.name}.v3_1.json`,
      ),
    )
  }
}

