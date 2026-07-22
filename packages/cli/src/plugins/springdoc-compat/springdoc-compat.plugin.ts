import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/plugin.js'


function flattenExtensions(obj: unknown): void {
  if (typeof obj !== 'object' || obj === null) return

  if (Array.isArray(obj)) {
    for (const item of obj) {
      flattenExtensions(item)
    }
    return
  }

  const record = obj as Record<string, unknown>

  if ('extensions' in record && typeof record.extensions === 'object' && record.extensions !== null) {
    const extensions = record.extensions as Record<string, unknown>
    for (const [key, value] of Object.entries(extensions)) {
      if (!(key in record)) {
        record[key] = value
      }
    }
    delete record.extensions
  }

  for (const value of Object.values(record)) {
    flattenExtensions(value)
  }
}

function patchParameterList(parameters: unknown): void {
  if (!Array.isArray(parameters)) return

  for (const param of parameters) {
    if (typeof param !== 'object' || param === null) continue
    if ('$ref' in param) continue

    const record = param as Record<string, unknown>
    if (!('schema' in record) && !('content' in record)) {
      record.schema = {}
    }
  }
}

function ensureParameterSchema(spec: unknown): void {
  if (typeof spec !== 'object' || spec === null) return

  const root = spec as Record<string, unknown>
  const paths = root.paths as Record<string, unknown> | undefined
  if (paths) {
    for (const pathItem of Object.values(paths)) {
      if (typeof pathItem !== 'object' || pathItem === null) continue
      const item = pathItem as Record<string, unknown>

      patchParameterList(item.parameters)

      for (const method of ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']) {
        const operation = item[method] as Record<string, unknown> | undefined
        if (operation) {
          patchParameterList(operation.parameters)
        }
      }
    }
  }

  const components = root.components as Record<string, unknown> | undefined
  if (components?.parameters) {
    const params = components.parameters as Record<string, unknown>
    for (const param of Object.values(params)) {
      if (typeof param !== 'object' || param === null) continue
      if ('$ref' in param) continue

      const record = param as Record<string, unknown>
      if (!('schema' in record) && !('content' in record)) {
        record.schema = {}
      }
    }
  }
}


/**
 * Springdoc (Java/Spring Boot) 生成的 OpenAPI 文档兼容插件。
 *
 * Springdoc 输出的文档存在若干不符合 OpenAPI 规范的结构，此插件在验证前进行修正。
 * 当前处理：
 * - 将嵌套的 `extensions` 对象展平为同级 x-* 属性
 * - 为缺少 `schema` 和 `content` 的 parameter 补充 `schema: {}`
 */
export class SpringdocCompatPlugin implements Plugin {
  apply(compiler: Compiler): void {
    compiler.hooks.beforeValidate.tap(SpringdocCompatPlugin.name, (spec) => {
      flattenExtensions(spec)
      ensureParameterSchema(spec)
    })
  }
}
