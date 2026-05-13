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


/**
 * Springdoc (Java/Spring Boot) 生成的 OpenAPI 文档兼容插件。
 *
 * Springdoc 输出的文档存在若干不符合 OpenAPI 规范的结构，此插件在验证前进行修正。
 * 当前处理：
 * - 将嵌套的 `extensions` 对象展平为同级 x-* 属性
 */
export class SpringdocCompatPlugin implements Plugin {
  apply(compiler: Compiler): void {
    compiler.hooks.beforeValidate.tap(SpringdocCompatPlugin.name, (spec) => {
      flattenExtensions(spec)
    })
  }
}
