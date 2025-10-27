import * as R from 'ramda'
import * as fs from 'fs-extra'
import { OperationDefinition } from '~/tasks/utils/operation-definition.js'
import { ModuleDefinition } from '~/tasks/utils/module-definition.js'


export interface IgnoreMatcherRule {
  persist: boolean
  ignore: boolean
  moduleName: string
  operationMethod: string
  operationPathname: string
}


export class IgnoreMatcher {
  private rules: IgnoreMatcherRule[]

  constructor(rules: IgnoreMatcherRule[]) {
    this.rules = rules
  }

  static async read(filepath: string): Promise<IgnoreMatcher> {
    let content = await fs.readFile(filepath, 'utf-8')

    content = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/#.*$/gm, '')
      .replace(/\n+/g, '\n')
      .trim()

    let rules = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line): IgnoreMatcherRule => {
        const matched = line.match(/^(!)?\s*([^\s/]+)\s+([^\s/]+)\s+([^\s]+)$/)
        if (!matched) throw new Error(`Invalid ignore rule: "${line}"`)

        const [, flag, moduleName, operationMethod, operationPathname] = matched

        return {
          persist: true,
          ignore: !flag,
          moduleName,
          operationMethod: operationMethod.toLowerCase(),
          operationPathname,
        }
      })
    rules = R.sortBy(
      R.prop('ignore'),
      rules,
    )

    rules = R.uniqWith(
      (a, b) => a.moduleName === b.moduleName && a.operationMethod === b.operationMethod && a.operationPathname === b.operationPathname,
      rules,
    )

    return new IgnoreMatcher(rules)
  }

  async write(filepath: string): Promise<void> {
    const ruleGroups = R.compose(
      R.groupBy((rule: IgnoreMatcherRule) => rule.moduleName),
      R.reverse,
      R.uniqWith<IgnoreMatcherRule>(
        (a, b) => a.moduleName === b.moduleName && a.operationMethod === b.operationMethod && a.operationPathname === b.operationPathname,
      ),
      R.filter((rule: IgnoreMatcherRule) => rule.persist),
    )(this.rules)

    const content = Object.entries(ruleGroups)
      .sort((a, b) => {
        const aModuleName = a[0]
        const bModuleName = b[0]

        if (aModuleName === '*') return -1
        if (bModuleName === '*') return 1

        return aModuleName.localeCompare(bModuleName)
      })
      .map(([, rules]) => (rules || [])
        .sort((a, b) => {
          if (a.ignore !== b.ignore) return a.ignore ? -1 : 1

          if (a.operationMethod === '*') return -1
          if (b.operationMethod === '*') return 1
          if (a.operationPathname === '*') return -1
          if (b.operationPathname === '*') return 1

          if (a.operationMethod !== b.operationMethod) return a.operationMethod.localeCompare(b.operationMethod)
          if (a.operationPathname !== b.operationPathname) return a.operationPathname.localeCompare(b.operationPathname)

          return 0
        })
        .map((rule) => `${rule.ignore ? '' : '! '}${rule.moduleName} ${rule.operationMethod.toUpperCase()} ${rule.operationPathname}`)
        .join('\n'))
      .join('\n\n')

    await fs.writeFile(filepath, content, 'utf-8')
  }

  append(rule: IgnoreMatcherRule): void {
    this.rules.unshift(rule)
  }

  // if operation is ignored, return true
  isOperationIgnored(operationDefinition: OperationDefinition): boolean {
    const moduleName = operationDefinition.module.name
    const operationMethod = operationDefinition.method.toLowerCase()
    const operationPathname = operationDefinition.pathname

    for (const rule of this.rules) {
      if (rule.moduleName !== '*' && rule.moduleName !== moduleName) continue
      if (rule.operationMethod !== '*' && rule.operationMethod !== operationMethod) continue
      if (rule.operationPathname !== '*' && rule.operationPathname !== operationPathname) continue

      return rule.ignore
    }

    return false
  }

  isModuleIgnored(moduleDefinition: ModuleDefinition): boolean {
    const moduleName = moduleDefinition.name

    for (const rule of this.rules) {
      if (!rule.ignore) {
        if (rule.moduleName === '*' || rule.moduleName === moduleName) return false
        continue
      }

      if (rule.operationMethod !== '*') continue
      if (rule.operationPathname !== '*') continue

      if (rule.moduleName === '*' || rule.moduleName === moduleName) return true
    }

    return false
  }
}
