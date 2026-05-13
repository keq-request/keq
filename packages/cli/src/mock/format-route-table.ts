import chalk from 'chalk'
import type { RouteTableEntry } from './types.js'


const METHOD_COLORS: Record<string, (s: string) => string> = {
  GET: chalk.green,
  POST: chalk.blue,
  PUT: chalk.yellow,
  DELETE: chalk.red,
  PATCH: chalk.cyan,
  HEAD: chalk.magenta,
  OPTIONS: chalk.gray,
}

const METHOD_ORDER = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

function colorMethod(method: string): string {
  const color = METHOD_COLORS[method] || chalk.white
  return color(method.padEnd(7))
}

export function formatRouteTable(entries: RouteTableEntry[]): string {
  if (entries.length === 0) return ''

  const grouped = new Map<string, RouteTableEntry[]>()
  for (const entry of entries) {
    const group = grouped.get(entry.moduleName) || []
    group.push(entry)
    grouped.set(entry.moduleName, group)
  }

  const maxPathLen = Math.max(...entries.map((e) => e.pathname.length))

  const lines: string[] = []

  for (const [moduleName, group] of grouped) {
    group.sort((a, b) => {
      const pathCmp = a.pathname.localeCompare(b.pathname)
      if (pathCmp !== 0) return pathCmp
      return METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method)
    })

    lines.push(`  ${chalk.bold(moduleName)}:`)

    for (const entry of group) {
      const method = colorMethod(entry.method)
      const path = entry.pathname.padEnd(maxPathLen + 2)
      const opId = entry.operationId ? chalk.dim(entry.operationId) : ''
      lines.push(`    ${method} ${path} ${opId}`)
    }

    lines.push('')
  }

  return lines.join('\n')
}
