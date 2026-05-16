import * as R from 'ramda'
import fs from 'fs-extra'
import picomatch from 'picomatch'
import { OperationDefinition, ModuleDefinition } from '~/models/index.js'


const ALL_HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']

export interface FilterRule {
  persist: boolean
  deny: boolean
  moduleName: string
  operationMethod: string
  operationPathname: string
  /** Lines (comment or blank) that appear before this rule in the file */
  leadingComments?: string[]
  /** Inline comment at end of the rule line, e.g. `# some note` */
  inlineComment?: string
}

interface FilterMeta {
  preambleComments?: string[]
  trailingComments?: string[]
}

function deduplicateRules(rules: FilterRule[]): FilterRule[] {
  const sorted = R.sortBy(R.prop('deny'), rules)
  return R.uniqWith(
    (a, b) => a.moduleName === b.moduleName && a.operationMethod === b.operationMethod && a.operationPathname === b.operationPathname,
    sorted,
  )
}

function sortRulesForOutput(rules: FilterRule[]): FilterRule[] {
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

function renderBlock(section: 'deny' | 'allow', rules: FilterRule[]): string {
  if (rules.length === 0) return ''
  const maxMethodLen = Math.max(...rules.map((r) => r.operationMethod.toUpperCase().length))
  const lines: string[] = []
  for (const r of rules) {
    if (r.leadingComments && r.leadingComments.length > 0) {
      lines.push(...r.leadingComments)
    }
    const ruleLine = `${r.operationMethod.toUpperCase().padEnd(maxMethodLen + 2)}${r.moduleName}:${r.operationPathname}`
    lines.push(r.inlineComment ? `${ruleLine}  ${r.inlineComment}` : ruleLine)
  }
  return `[${section}]\n${lines.join('\n')}`
}


interface CompiledRule {
  rule: FilterRule
  matchModuleName: (s: string) => boolean
  matchMethod: (s: string) => boolean
  matchPathname: (s: string) => boolean
}

function compileRule(rule: FilterRule): CompiledRule {
  return {
    rule,
    matchModuleName: picomatch(rule.moduleName),
    matchMethod: picomatch(rule.operationMethod),
    matchPathname: picomatch(rule.operationPathname),
  }
}


/**
 * Matches API operations and modules against `.keqfilter` rules to determine
 * which should be denied (excluded) or allowed during code generation.
 * Supports glob patterns (via picomatch) for module names, HTTP methods, and pathnames.
 */
export class Matcher {
  private compiled: CompiledRule[]
  private preambleComments: string[]
  private trailingComments: string[]

  constructor(rules: FilterRule[], meta: FilterMeta = {}) {
    this.compiled = rules.map(compileRule)
    this.preambleComments = meta.preambleComments ?? []
    this.trailingComments = meta.trailingComments ?? []
  }

  private get rules(): FilterRule[] {
    return this.compiled.map((c) => c.rule)
  }

  /**
   * Parse `.keqfilter` file content into a Matcher instance.
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
  static parse(content: string): Matcher {
    const normalized = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')

    const rules: FilterRule[] = []
    let currentDeny: boolean | null = null
    let firstSectionSeen = false
    let preambleComments: string[] = []
    const pendingComments: string[] = []

    for (const rawLine of normalized.split('\n')) {
      const line = rawLine.replace(/#.*$/, '').trim()

      if (!line) {
        // blank line or comment-only line — buffer it
        pendingComments.push(rawLine)
        continue
      }

      if (line === '[deny]') {
        if (!firstSectionSeen) {
          preambleComments = [...pendingComments]
          pendingComments.length = 0
          firstSectionSeen = true
        } else {
          while (pendingComments.length > 0 && pendingComments[0].trim() === '') {
            pendingComments.shift()
          }
        }
        currentDeny = true
        continue
      }
      if (line === '[allow]') {
        if (!firstSectionSeen) {
          preambleComments = [...pendingComments]
          pendingComments.length = 0
          firstSectionSeen = true
        } else {
          while (pendingComments.length > 0 && pendingComments[0].trim() === '') {
            pendingComments.shift()
          }
        }
        currentDeny = false
        continue
      }
      if (currentDeny === null) continue

      const matched = line.match(/^([^\s]+)\s+([^:\s]+):(.*)$/)
      if (!matched) throw new Error(`Invalid filter rule: "${line}"`)

      const [, operationMethod, moduleName, operationPathname] = matched

      // extract inline comment from the original raw line (whitespace + # + text at end)
      const inlineCommentMatch = rawLine.match(/\s+(#.*)$/)
      const inlineComment = inlineCommentMatch ? inlineCommentMatch[1] : undefined

      rules.push({
        persist: true,
        deny: currentDeny,
        moduleName,
        operationMethod: operationMethod.toLowerCase(),
        operationPathname,
        leadingComments: pendingComments.length > 0 ? [...pendingComments] : undefined,
        inlineComment,
      })
      pendingComments.length = 0
    }

    const trailingComments = [...pendingComments]
    // strip trailing empty strings that are artifacts of the file's trailing newline
    while (trailingComments.length > 0 && trailingComments[trailingComments.length - 1].trim() === '') {
      trailingComments.pop()
    }
    // strip trailing empty strings from preamble for the same reason
    while (preambleComments.length > 0 && preambleComments[preambleComments.length - 1].trim() === '') {
      preambleComments.pop()
    }
    return new Matcher(deduplicateRules(rules), { preambleComments, trailingComments })
  }

  static async read(filepath: string): Promise<Matcher> {
    const content = await fs.readFile(filepath, 'utf-8')
    return Matcher.parse(content)
  }

  async write(filepath: string): Promise<void> {
    const persistRules: FilterRule[] = R.compose(
      R.reverse,
      R.uniqWith<FilterRule>(
        (a, b) => a.moduleName === b.moduleName && a.operationMethod === b.operationMethod && a.operationPathname === b.operationPathname,
      ),
      R.filter((rule: FilterRule) => rule.persist),
    )(this.rules) as FilterRule[]

    const denyRules = sortRulesForOutput(persistRules.filter((r) => r.deny))
    const allowRules = sortRulesForOutput(persistRules.filter((r) => !r.deny))

    const blocks = [
      renderBlock('deny', denyRules),
      renderBlock('allow', allowRules),
    ].filter(Boolean)

    if (blocks.length === 0) return

    const blockContent = blocks.join('\n\n')

    // prepend preamble comments (file-level comments before the first section)
    const mainContent = this.preambleComments.length > 0
      ? `${this.preambleComments.join('\n')}\n${blockContent}`
      : blockContent

    // append trailing comments (after the last rule)
    const output = this.trailingComments.length > 0
      ? `${mainContent}\n\n${this.trailingComments.join('\n')}`
      : mainContent

    await fs.writeFile(filepath, output, 'utf-8')
  }

  append(rule: FilterRule): void {
    this.compiled.unshift(compileRule(rule))
  }

  isOperationDenied(operationDefinition: OperationDefinition): boolean {
    const moduleName = operationDefinition.module.name
    const operationMethod = operationDefinition.method.toLowerCase()
    const operationPathname = operationDefinition.pathname

    for (const { rule, matchModuleName, matchMethod, matchPathname } of this.compiled) {
      if (!matchModuleName(moduleName)) continue
      if (!matchMethod(operationMethod)) continue
      if (!matchPathname(operationPathname)) continue

      return rule.deny
    }

    return false
  }

  isModuleDenied(moduleDefinition: ModuleDefinition): boolean {
    const moduleName = moduleDefinition.name

    for (const { rule, matchModuleName, matchMethod, matchPathname } of this.compiled) {
      if (!matchModuleName(moduleName)) continue

      if (!rule.deny) return false

      if (!ALL_HTTP_METHODS.every((m) => matchMethod(m))) continue
      if (!matchPathname('/a/b/c/d')) continue

      return true
    }

    return false
  }
}
