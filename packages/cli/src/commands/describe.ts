import chalk from 'chalk'
import { Command, Option } from 'commander'
import { SupportedMethods } from '../constants/supported-methods.js'
import { Compiler } from '../compiler/compiler.js'
import { SearchEngine } from '../search/search-engine.js'
import type { ApiDocumentV3_1 } from '../models/api-document_v3_1.js'


export function registerDescribeCommand(program: Command): void {
  const describe = program
    .command('describe')
    .description('Describe detailed structure of an API operation or schema component')

  describe
    .command('operation')
    .description('Show full detail of an API operation including parameters, request body and responses')
    .requiredOption('--module <module>', 'Module name')
    .addOption(
      new Option('--method <method>', 'HTTP method')
        .choices([
          ...SupportedMethods,
          ...SupportedMethods.map((m) => m.toUpperCase()),
        ])
        .makeOptionMandatory(true),
    )
    .requiredOption('--pathname <pathname>', 'API pathname (e.g. /api/v1/users)')
    .option('-c --config <config>', 'The keq-cli config file')
    .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
    .addOption(
      new Option('--format <format>', 'Output format')
        .choices(['json']),
    )
    .option('--json', 'Output in JSON format (shortcut for --format json)')
    .option('--debug', 'Print debug information')
    .action(handleDescribeOperation)

  describe
    .command('schema')
    .description('Show full detail of a schema component')
    .requiredOption('--module <module>', 'Module name')
    .requiredOption('--name <name>', 'Schema component name')
    .option('-c --config <config>', 'The keq-cli config file')
    .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
    .addOption(
      new Option('--format <format>', 'Output format')
        .choices(['json']),
    )
    .option('--json', 'Output in JSON format (shortcut for --format json)')
    .option('--debug', 'Print debug information')
    .action(handleDescribeSchema)
}


interface DescribeOperationOptions {
  module: string
  method: string
  pathname: string
  config?: string
  tolerant?: boolean
  format?: string
  json?: boolean
  debug?: boolean
}

interface DescribeSchemaOptions {
  module: string
  name: string
  config?: string
  tolerant?: boolean
  format?: string
  json?: boolean
  debug?: boolean
}

async function loadDocuments(options: { config?: string; debug?: boolean; tolerant?: boolean }): Promise<ApiDocumentV3_1[]> {
  const compiler = new Compiler({
    build: true,
    persist: false,
    silent: true,
    config: options.config,
    debug: !!options.debug,
    tolerant: !!options.tolerant,
    filter: false,
  })

  await compiler.run()
  return compiler.context.documents || []
}

function findDocument(documents: ApiDocumentV3_1[], moduleName: string): ApiDocumentV3_1 {
  const doc = documents.find((d) => d.module.name === moduleName)
  if (!doc) {
    const available = documents.map((d) => d.module.name)
    console.error(`Module "${moduleName}" not found.`)
    if (available.length > 0) {
      console.error(`Available modules: ${available.join(', ')}`)
    }
    process.exit(1)
  }
  return doc
}


async function handleDescribeOperation(options: DescribeOperationOptions): Promise<void> {
  const documents = await loadDocuments(options)
  const doc = findDocument(documents, options.module)

  const engine = new SearchEngine(documents)
  const detail = engine.getDetail(options.module, options.method, options.pathname)

  if (!detail) {
    console.error(`Operation ${options.method.toUpperCase()} ${options.pathname} not found in module "${options.module}".`)
    console.error(`Run ${chalk.cyan(`keq apis --module ${options.module}`)} to see available operations.`)
    process.exit(1)
  }

  const opDef = doc.operations.find(
    (o) => o.method.toLowerCase() === options.method.toLowerCase() && o.pathname === options.pathname,
  )

  const format = options.format || (options.json ? 'json' : undefined)

  if (format === 'json') {
    const result = {
      module: detail.module,
      method: detail.method,
      pathname: detail.pathname,
      operationId: detail.operationId,
      summary: detail.summary,
      description: detail.description,
      tags: detail.tags,
      deprecated: opDef?.operation.deprecated ?? false,
      parameters: detail.parameters,
      requestBody: detail.requestBody,
      responses: detail.responses,
    }
    console.log(JSON.stringify(result, null, 2))
    return
  }

  printOperationCompact(detail, opDef)
}

async function handleDescribeSchema(options: DescribeSchemaOptions): Promise<void> {
  const documents = await loadDocuments(options)
  const doc = findDocument(documents, options.module)

  const schemaDef = doc.schemas.find((s) => s.name === options.name)

  if (!schemaDef) {
    const available = doc.schemas.map((s) => s.name)
    console.error(`Schema "${options.name}" not found in module "${options.module}".`)
    if (available.length > 0) {
      const shown = available.slice(0, 10)
      console.error(`Available schemas: ${shown.join(', ')}${available.length > 10 ? ` ... (${available.length} total)` : ''}`)
    }
    process.exit(1)
  }

  const format = options.format || (options.json ? 'json' : undefined)

  if (format === 'json') {
    console.log(JSON.stringify({
      module: options.module,
      name: schemaDef.name,
      schema: schemaDef.schema,
    }, null, 2))
    return
  }

  printSchemaCompact(options.module, schemaDef.name, schemaDef.schema)
}


// ---------------------------------------------------------------------------
// Compact formatters
// ---------------------------------------------------------------------------

interface DetailLike {
  module: string
  method: string
  pathname: string
  operationId: string
  summary: string
  description: string
  tags: string[]
  parameters: unknown[]
  requestBody: unknown
  responses: unknown
}

interface OperationDefLike {
  operation: { deprecated?: boolean }
}

function printOperationCompact(detail: DetailLike, opDef?: OperationDefLike): void {
  console.log(`\nModule: ${detail.module}`)
  console.log(`${chalk.bold(detail.method)} ${detail.pathname}`)

  const meta: Array<[string, string]> = []
  meta.push(['operationId', detail.operationId])
  if (detail.summary) meta.push(['summary', detail.summary])
  if (detail.description) meta.push(['description', detail.description])
  if (detail.tags.length > 0) meta.push(['tags', detail.tags.join(', ')])
  meta.push(['deprecated', opDef?.operation.deprecated ? 'yes' : 'no'])

  const labelWidth = Math.max(...meta.map(([k]) => k.length))
  for (const [label, value] of meta) {
    console.log(`  ${chalk.dim(label.padEnd(labelWidth))}  ${value}`)
  }

  // Parameters
  const params = detail.parameters as Array<Record<string, unknown>> | undefined
  console.log(`\n${chalk.bold('Parameters:')}`)
  if (!params || params.length === 0) {
    console.log('  (none)')
  } else {
    formatParameters(params)
  }

  // Request Body
  console.log(`\n${chalk.bold('Request Body:')}`)
  if (!detail.requestBody) {
    console.log('  (none)')
  } else {
    formatRequestBody(detail.requestBody as Record<string, unknown>)
  }

  // Responses
  console.log(`\n${chalk.bold('Responses:')}`)
  if (!detail.responses) {
    console.log('  (none)')
  } else {
    formatResponses(detail.responses as Record<string, unknown>)
  }

  console.log()
}

function printSchemaCompact(moduleName: string, name: string, schema: Record<string, unknown>): void {
  console.log(`\nModule: ${moduleName}`)
  console.log(`Schema: ${chalk.bold(name)}`)

  if (typeof schema.description === 'string' && schema.description) {
    console.log(`  ${schema.description}`)
  }
  console.log()

  formatSchemaBlock(schema, 1, new Set())
  console.log()
}


// ---------------------------------------------------------------------------
// Parameter formatting
// ---------------------------------------------------------------------------

function formatParameters(params: Array<Record<string, unknown>>): void {
  const rows = params.map((p) => {
    const loc = `[${String(p.in)}]`
    const name = String(p.name)
    const schemaObj = (p.schema || {}) as Record<string, unknown>
    const type = formatTypeLabel(schemaObj)
    const req = p.required ? '(required)' : ''
    const desc = typeof p.description === 'string' ? p.description : ''
    return { loc, name, type, req, desc }
  })

  const maxLoc = Math.max(...rows.map((r) => r.loc.length))
  const maxName = Math.max(...rows.map((r) => r.name.length))
  const maxType = Math.max(...rows.map((r) => r.type.length))
  const maxReq = Math.max(...rows.map((r) => r.req.length))

  for (const row of rows) {
    const parts = [
      '  ',
      chalk.dim(row.loc.padEnd(maxLoc)),
      '  ',
      row.name.padEnd(maxName),
      '  ',
      chalk.cyan(row.type.padEnd(maxType)),
      '  ',
      row.req ? chalk.yellow(row.req.padEnd(maxReq)) : ' '.repeat(maxReq),
      row.desc ? `  ${chalk.dim(row.desc)}` : '',
    ]
    console.log(parts.join(''))
  }
}


// ---------------------------------------------------------------------------
// Request Body formatting
// ---------------------------------------------------------------------------

function formatRequestBody(body: Record<string, unknown>): void {
  if (typeof body.description === 'string' && body.description) {
    console.log(`  ${body.description}`)
  }

  const content = body.content as Record<string, Record<string, unknown>> | undefined
  if (!content) {
    console.log('  (no content)')
    return
  }

  for (const [mediaType, mediaObj] of Object.entries(content)) {
    console.log(`  ${chalk.dim(`(${mediaType})`)}`)
    const schema = mediaObj.schema as Record<string, unknown> | undefined
    if (schema) {
      formatSchemaBlock(schema, 2, new Set())
    }
  }
}


// ---------------------------------------------------------------------------
// Responses formatting
// ---------------------------------------------------------------------------

function formatResponses(responses: Record<string, unknown>): void {
  for (const [statusCode, responseObj] of Object.entries(responses)) {
    const resp = responseObj as Record<string, unknown>

    if ('$ref' in resp) {
      const refName = extractRefName(String(resp.$ref))
      console.log(`  ${chalk.bold(statusCode)} ${chalk.dim(`→ ${refName} (ref)`)}`)
      continue
    }

    const desc = typeof resp.description === 'string' ? resp.description : ''
    const content = resp.content as Record<string, Record<string, unknown>> | undefined

    if (!content) {
      console.log(`  ${chalk.bold(statusCode)}${desc ? ` - ${desc}` : ''}`)
      console.log('    (no content)')
      continue
    }

    for (const [mediaType, mediaObj] of Object.entries(content)) {
      console.log(`  ${chalk.bold(statusCode)}${desc ? ` - ${desc}` : ''} ${chalk.dim(`(${mediaType})`)}`)
      const schema = mediaObj.schema as Record<string, unknown> | undefined
      if (schema) {
        formatSchemaBlock(schema, 2, new Set())
      }
    }
  }
}


// ---------------------------------------------------------------------------
// Schema block formatting (recursive)
// ---------------------------------------------------------------------------

const MAX_DEPTH = 3

function formatSchemaBlock(schema: Record<string, unknown>, indent: number, visited: Set<string>): void {
  const pad = '  '.repeat(indent)

  if ('$ref' in schema) {
    const refName = extractRefName(String(schema.$ref))
    console.log(`${pad}${chalk.dim(`→ ${refName} (ref)`)}`)
    return
  }

  const type = schema.type as string | undefined
  if (type) {
    const extra: string[] = []
    if (typeof schema.format === 'string') extra.push(`format: ${schema.format}`)
    if (Array.isArray(schema.enum)) extra.push(`enum: ${schema.enum.join(', ')}`)
    if (typeof schema.pattern === 'string') extra.push(`pattern: ${schema.pattern}`)

    const typeStr = extra.length > 0 ? `${type} (${extra.join(', ')})` : type
    console.log(`${pad}type: ${chalk.cyan(typeStr)}`)
  }

  // allOf / oneOf / anyOf
  for (const keyword of ['allOf', 'oneOf', 'anyOf'] as const) {
    const list = schema[keyword] as Array<Record<string, unknown>> | undefined
    if (!list) continue
    console.log(`${pad}${keyword}:`)
    for (const item of list) {
      formatSchemaBlock(item, indent + 1, visited)
    }
  }

  // array items
  if (type === 'array' && schema.items) {
    console.log(`${pad}items:`)
    formatSchemaBlock(schema.items as Record<string, unknown>, indent + 1, visited)
  }

  // object properties
  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined
  if (properties) {
    const requiredSet = new Set(Array.isArray(schema.required) ? schema.required as string[] : [])

    console.log(`${pad}properties:`)

    if (indent >= MAX_DEPTH) {
      console.log(`${pad}  ${chalk.dim('...')}`)
      return
    }

    const propPad = '  '.repeat(indent + 1)
    const entries = Object.entries(properties)
    const maxNameLen = entries.length > 0 ? Math.max(...entries.map(([n]) => n.length)) : 0

    for (const [propName, propSchema] of entries) {
      if ('$ref' in propSchema) {
        const refName = extractRefName(String(propSchema.$ref))
        const req = requiredSet.has(propName) ? chalk.yellow('(required)') + '  ' : ''
        console.log(`${propPad}${propName.padEnd(maxNameLen)}  ${chalk.dim(`→ ${refName}`)}  ${req}`)
        continue
      }

      const typeLabel = formatTypeLabel(propSchema)
      const req = requiredSet.has(propName) ? chalk.yellow('(required)') + '  ' : ''
      const desc = typeof propSchema.description === 'string' ? chalk.dim(propSchema.description) : ''

      console.log(`${propPad}${propName.padEnd(maxNameLen)}  ${chalk.cyan(typeLabel)}  ${req}${desc}`)

      // Recurse into nested objects
      const propType = propSchema.type as string | undefined
      if (propType === 'object' && propSchema.properties && indent + 1 < MAX_DEPTH) {
        const refId = `prop:${propName}`
        if (!visited.has(refId)) {
          visited.add(refId)
          formatSchemaBlock(propSchema, indent + 2, visited)
        } else {
          console.log(`${'  '.repeat(indent + 2)}${chalk.dim('(circular)')}`)
        }
      }

      if (propType === 'array' && propSchema.items) {
        const items = propSchema.items as Record<string, unknown>
        if ('$ref' in items) {
          console.log(`${'  '.repeat(indent + 2)}items: ${chalk.dim(`→ ${extractRefName(String(items.$ref))}`)}`)
        } else if ((items.type === 'object' && items.properties) && indent + 1 < MAX_DEPTH) {
          console.log(`${'  '.repeat(indent + 2)}items:`)
          formatSchemaBlock(items, indent + 3, visited)
        }
      }
    }
  }

  // additionalProperties
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    console.log(`${pad}additionalProperties:`)
    formatSchemaBlock(schema.additionalProperties as Record<string, unknown>, indent + 1, visited)
  }
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTypeLabel(schema: Record<string, unknown>): string {
  if ('$ref' in schema) {
    return `→ ${extractRefName(String(schema.$ref))}`
  }

  const type = schema.type as string | undefined
  if (!type) return 'unknown'

  if (type === 'array') {
    const items = schema.items as Record<string, unknown> | undefined
    if (items) {
      if ('$ref' in items) return `${extractRefName(String(items.$ref))}[]`
      return `${String(items.type || 'unknown')}[]`
    }
    return 'array'
  }

  const parts: string[] = [type]
  if (typeof schema.format === 'string') parts.push(`(${schema.format})`)
  if (Array.isArray(schema.enum)) parts.push(`(enum: ${schema.enum.join(', ')})`)
  if (typeof schema.pattern === 'string') parts.push(`(pattern: ${schema.pattern})`)

  return parts.join(' ')
}

function extractRefName(ref: string): string {
  const parts = ref.split('/')
  return parts[parts.length - 1]
}
