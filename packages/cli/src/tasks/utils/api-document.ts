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
import { SwaggerUtils } from '../../utils/swagger-utils/index.js'


export class ApiDocument<T extends OpenAPI.Document = OpenAPI.Document> {
  readonly module: ModuleDefinition
  readonly swagger: T

  constructor(swagger: T, module: ModuleDefinition) {
    this.module = module
    this.swagger = swagger
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
        e.message = `Unable get the swagger file from ${url}: ${e.message}`
      }

      throw e
    }


    try {
      return JSON.parse(content) as OpenAPI.Document
    } catch (e) {
      throw new Error(`The swagger file get from url isn't json: ${url}`)
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

    const swagger = validUrl.isUri(address)
      ? await this.download(address)
      : await this.read(address)

    return new ApiDocument(swagger, moduleDefinition)
  }

  async validate(): ReturnType<typeof validate> {
    return await validate(this.swagger)
  }

  // remove chinese and special symbols
  fix(): ApiDocument {
    const swagger: T = fixSwagger(this.swagger as any)

    return new ApiDocument(
      swagger,
      new ModuleDefinition(
        this.module.name,
        `file://${this.module.name}.fixed.json`,
      ),
    )
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async toV3_1(rc?: RuntimeConfig): Promise<ApiDocumentV3_1> {
    const debug = new Debugger(rc)
    let swagger: any = this.swagger

    const { specification } = upgrade(swagger)
    swagger = specification
    debug.writeSwagger(`.keq/${this.module.name}.3_1.json`, swagger)

    swagger = SwaggerUtils.dereferenceOperation(swagger)
    debug.writeSwagger(`.keq/${this.module.name}.3_1.sharked.json`, swagger)

    if (rc?.operationIdFactory) {
      const operationIdFactory = rc.operationIdFactory
      swagger = SwaggerUtils.updateOperationId(
        swagger,
        (method, pathname, operation) => operationIdFactory({ method, pathname, operation, module: this.module }),
      )
      debug.writeSwagger(`.keq/${this.module.name}.3_1.formatted.json`, swagger)
    }

    return new ApiDocumentV3_1(
      swagger,
      new ModuleDefinition(
        this.module.name,
        `file://${this.module.name}.v3_1.json`,
      ),
    )
  }
}

