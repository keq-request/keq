import { JSONPath } from 'jsonpath-plus'
import { Compiler } from '~/compiler/index.js'
import { Plugin } from '~/types/plugin.js'


export interface MockRule {
  given: string
  when?: {
    type?: string | string[]
    format?: string
  }
  then:
    | { example: unknown }
    | { faker: string; args?: unknown }
    | { default: unknown }
}

export interface MockPluginOptions {
  rules: MockRule[]
}

type SchemaNode = Record<string, unknown>

function resolveRef(root: object, ref: string): SchemaNode | undefined {
  if (!ref.startsWith('#/')) return undefined
  const parts = ref.slice(2).split('/')
  let current: unknown = root
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'object' && current !== null ? current as SchemaNode : undefined
}

function resolveSchemaNode(root: object, node: SchemaNode): SchemaNode | undefined {
  if ('$ref' in node && typeof node['$ref'] === 'string') {
    return resolveRef(root, node['$ref'])
  }
  return node
}

function hasExplicitValue(node: SchemaNode): boolean {
  return 'example' in node
    || 'examples' in node
    || 'enum' in node
    || 'const' in node
    || 'x-faker' in node
}

function matchesCondition(node: SchemaNode, when: NonNullable<MockRule['when']>): boolean {
  if (when.type) {
    const types = Array.isArray(when.type) ? when.type : [when.type]
    if (!types.includes(node.type as string)) return false
  }
  if (when.format && node.format !== when.format) return false
  return true
}

function applyAction(node: SchemaNode, then: MockRule['then']): void {
  if ('example' in then) {
    node.example = then.example
  } else if ('faker' in then) {
    node['x-faker'] = then.args
      ? { [then.faker]: then.args }
      : then.faker
  } else if ('default' in then) {
    node.default = then.default
  }
}

function extractPropertyTarget(given: string): string | undefined {
  const match = given.match(/\.properties\.([^.[]+)$/)
  return match ? match[1] : undefined
}

function extractSchemaEntryPath(given: string): string | undefined {
  const idx = given.lastIndexOf('.properties.')
  if (idx === -1) return undefined
  return given.slice(0, idx)
}

function walkSchemaProperties(
  schema: SchemaNode,
  root: object,
  visitor: (propName: string, propSchema: SchemaNode) => void,
  visited: Set<object> = new Set(),
): void {
  const resolved = resolveSchemaNode(root, schema)
  if (!resolved) return
  if (visited.has(resolved)) return
  visited.add(resolved)

  if (resolved.properties && typeof resolved.properties === 'object') {
    for (const [name, propValue] of Object.entries(resolved.properties as Record<string, unknown>)) {
      if (typeof propValue !== 'object' || propValue === null) continue
      const propSchema = propValue as SchemaNode
      visitor(name, propSchema)
      walkSchemaProperties(propSchema, root, visitor, visited)
    }
  }

  if (resolved.items && typeof resolved.items === 'object') {
    walkSchemaProperties(resolved.items as SchemaNode, root, visitor, visited)
  }

  for (const key of ['allOf', 'oneOf', 'anyOf'] as const) {
    const arr = resolved[key]
    if (Array.isArray(arr)) {
      for (const sub of arr) {
        if (typeof sub === 'object' && sub !== null) {
          walkSchemaProperties(sub as SchemaNode, root, visitor, visited)
        }
      }
    }
  }
}

export class MockPlugin implements Plugin {
  private rules: MockRule[]

  constructor(options: MockPluginOptions) {
    this.rules = options.rules
  }

  apply(compiler: Compiler): void {
    compiler.hooks.beforeValidate.tap(MockPlugin.name, (spec) => {
      for (const rule of this.rules) {
        this.applyRule(spec, rule)
      }
    })
  }

  private applyRule(spec: object, rule: MockRule): void {
    const propertyTarget = extractPropertyTarget(rule.given)

    if (!propertyTarget) {
      const matches: Array<{ value: unknown }> = JSONPath({
        path: rule.given,
        json: spec,
        resultType: 'all',
      })
      for (const match of matches) {
        const node = match.value
        if (typeof node !== 'object' || node === null) continue
        const schema = node as SchemaNode
        if (hasExplicitValue(schema)) continue
        if (rule.when && !matchesCondition(schema, rule.when)) continue
        applyAction(schema, rule.then)
      }
      return
    }

    const schemaEntryPath = extractSchemaEntryPath(rule.given)
    if (!schemaEntryPath) return

    const entries: Array<{ value: unknown }> = JSONPath({
      path: schemaEntryPath,
      json: spec,
      resultType: 'all',
    })

    for (const entry of entries) {
      if (typeof entry.value !== 'object' || entry.value === null) continue
      const schemaEntry = entry.value as SchemaNode

      walkSchemaProperties(schemaEntry, spec, (propName, propSchema) => {
        if (propName !== propertyTarget) return
        if (hasExplicitValue(propSchema)) return
        if (rule.when && !matchesCondition(propSchema, rule.when)) return
        applyAction(propSchema, rule.then)
      })
    }
  }
}
