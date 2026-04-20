import * as R from 'ramda'
import fs from 'fs-extra'
import picomatch from 'picomatch'
import { OperationDefinition, ModuleDefinition } from '~/models/index.js'


const ALL_HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']

export interface IgnoreMatcherRule {
  persist: boolean
  ignore: boolean
  moduleName: string
  operationMethod: string
  operationPathname: string
}

function deduplicateRules(rules: IgnoreMatcherRule[]): IgnoreMatcherRule[] {
  const sorted = R.sortBy(R.prop('ignore'), rules)
  return R.uniqWith(
    (a, b) => a.moduleName === b.moduleName && a.operationMethod === b.operationMethod && a.operationPathname === b.operationPathname,
    sorted,
  )
}

function sortRulesForOutput(rules: IgnoreMatcherRule[]): IgnoreMatcherRule[] {
  return [...rules].sort((a, b) => {
    if (a.moduleName === '*' && b.moduleName !== '*') return -1
    if (a.moduleName !== '*' && b.moduleName === '*') return 1
    if (a.moduleName !== b.moduleName) return a.moduleName.localeCompare(b.moduleName)
    if (a.operationMethod === '*' && b.operationMethod !== '*') return -1
    if (a.operationMethod !== '*' && b.operationMethod === '*') return 1
    if (a.operationMethod !== b.operationMethod) return a.operationMethod.localeCompare(b.operationMethod)
    return a.operationPathname.localeCompare(b.operationPathname)
  })
}

function renderBlock(section: 'deny' | 'allow', rules: IgnoreMatcherRule[]): string {
  if (rules.length === 0) return ''
  const maxMethodLen = Math.max(...rules.map((r) => r.operationMethod.toUpperCase().length))
  const lines = rules.map((r) => `${r.operationMethod.toUpperCase().padEnd(maxMethodLen + 2)}${r.moduleName}:${r.operationPathname}`)
  return `[${section}]\n${lines.join('\n')}`
}


interface CompiledRule {
  rule: IgnoreMatcherRule
  matchModuleName: (s: string) => boolean
  matchMethod: (s: string) => boolean
  matchPathname: (s: string) => boolean
}

function compileRule(rule: IgnoreMatcherRule): CompiledRule {
  return {
    rule,
    matchModuleName: picomatch(rule.moduleName),
    matchMethod: picomatch(rule.operationMethod),
    matchPathname: picomatch(rule.operationPathname),
  }
}


export class IgnoreMatcher {
  private compiled: CompiledRule[]

  constructor(rules: IgnoreMatcherRule[]) {
    this.compiled = rules.map(compileRule)
  }

  private get rules(): IgnoreMatcherRule[] {
    return this.compiled.map((c) => c.rule)
  }

  /**
   * Parse .keqfilter file content into an IgnoreMatcher.
   *
   * File format:
   * ```
   * [deny]
   * GET     petStore:/pets
   * *       userService:/**
   *
   * [allow]
   * GET     petStore:/pets/details
   * ```
   *
   * Line format: `METHOD module:/pathname`
   * - method: HTTP method or `*`, case-insensitive
   * - module:/pathname: module name + `:` + path pattern (glob supported)
   */
  static parse(content: string): IgnoreMatcher {
    const normalized = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')

    const rules: IgnoreMatcherRule[] = []
    let currentIgnore: boolean | null = null

    for (const rawLine of normalized.split('\n')) {
      const line = rawLine.replace(/#.*$/, '').trim()
      if (!line) continue

      if (line === '[deny]') {
        currentIgnore = true
        continue
      }
      if (line === '[allow]') {
        currentIgnore = false
        continue
      }
      if (currentIgnore === null) continue

      const matched = line.match(/^([^\s]+)\s+([^:\s]+):(.*)$/)
      if (!matched) throw new Error(`Invalid filter rule: "${line}"`)

      const [, operationMethod, moduleName, operationPathname] = matched
      rules.push({
        persist: true,
        ignore: currentIgnore,
        moduleName,
        operationMethod: operationMethod.toLowerCase(),
        operationPathname,
      })
    }

    return new IgnoreMatcher(deduplicateRules(rules))
  }

  static async read(filepath: string): Promise<IgnoreMatcher> {
    const content = await fs.readFile(filepath, 'utf-8')
    return IgnoreMatcher.parse(content)
  }

  async write(filepath: string): Promise<void> {
    const persistRules: IgnoreMatcherRule[] = R.compose(
      R.reverse,
      R.uniqWith<IgnoreMatcherRule>(
        (a, b) => a.moduleName === b.moduleName && a.operationMethod === b.operationMethod && a.operationPathname === b.operationPathname,
      ),
      R.filter((rule: IgnoreMatcherRule) => rule.persist),
    )(this.rules) as IgnoreMatcherRule[]

    const denyRules = sortRulesForOutput(persistRules.filter((r) => r.ignore))
    const allowRules = sortRulesForOutput(persistRules.filter((r) => !r.ignore))

    const blocks = [
      renderBlock('deny', denyRules),
      renderBlock('allow', allowRules),
    ].filter(Boolean)

    if (blocks.length === 0) return

    await fs.writeFile(filepath, blocks.join('\n\n'), 'utf-8')
  }

  append(rule: IgnoreMatcherRule): void {
    this.compiled.unshift(compileRule(rule))
  }

  // if operation is ignored, return true
  isOperationIgnored(operationDefinition: OperationDefinition): boolean {
    const moduleName = operationDefinition.module.name
    const operationMethod = operationDefinition.method.toLowerCase()
    const operationPathname = operationDefinition.pathname

    for (const { rule, matchModuleName, matchMethod, matchPathname } of this.compiled) {
      if (!matchModuleName(moduleName)) continue
      if (!matchMethod(operationMethod)) continue
      if (!matchPathname(operationPathname)) continue

      return rule.ignore
    }

    return false
  }

  isModuleIgnored(moduleDefinition: ModuleDefinition): boolean {
    const moduleName = moduleDefinition.name

    for (const { rule, matchModuleName, matchMethod, matchPathname } of this.compiled) {
      if (!matchModuleName(moduleName)) continue

      if (!rule.ignore) return false

      // only treat as module-level ignore when method and pathname patterns cover all values:
      // - method pattern must match every known HTTP method
      // - pathname pattern must match a deeply-nested path (i.e. crosses slashes)
      if (!ALL_HTTP_METHODS.every((m) => matchMethod(m))) continue
      if (!matchPathname('/a/b/c/d')) continue

      return true
    }

    return false
  }
}
