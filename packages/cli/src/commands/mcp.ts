import * as path from 'path'
import { Command } from 'commander'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import fs from 'fs-extra'
import picomatch from 'picomatch'
import { Compiler } from '../compiler/compiler.js'
import { findInvalidFiles } from '../utils/scan-generated-files.js'
import { xprodFilterRules } from './utils/xprod-filter-rules.js'
import { CompilerProvider } from '../mcp/compiler-provider.js'
import type { FilterRule } from '../utils/matcher.js'

export function registerMcpCommand(program: Command): void {
  program
    .command('mcp')
    .description('Start keq MCP server')
    .option('-c --config <config>', 'The keq-cli config file')
    .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
    .option('--debug', 'Print debug information')
    .action(async (options) => {
      const config = options.config
      const tolerant = !!options.tolerant
      const debug = !!options.debug

      const provider = await CompilerProvider.init({ config, debug, tolerant })

      const server = new McpServer({
        name: 'keq',
        version: '1.0.0',
        description: 'keq 是一个 HTTP Client 库，keq CLI 基于 Swagger/OpenAPI 规范为 keq 自动生成类型安全的请求函数。功能：API 语义搜索、接口详情查询、代码生成、过滤规则管理、生成文件管理。',
      })

      server.registerTool(
        'search_apis',
        {
          description: '通过自然语言语义搜索项目中的 API 接口，支持中英文跨语言匹配。当你需要找到某个功能对应的 API 时使用。',
          inputSchema: {
            query: z.string().describe('Natural language search query'),
            module: z.array(z.string()).optional()
              .describe('Filter by module names'),
            limit: z.number().optional()
              .default(10)
              .describe('Maximum number of results'),
          },
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async ({ query, module, limit }) => {
          try {
            const engine = await provider.getEngine()
            const results = await engine.search(query, { limit, module })
            return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'get_api_detail',
        {
          description: '获取指定接口的完整定义，包含请求参数、请求体和响应体的 JSON Schema。当你需要了解如何调用某个接口时使用。',
          inputSchema: {
            module: z.string().describe('Module name'),
            method: z.string().describe('HTTP method (GET, POST, PUT, DELETE, etc.)'),
            pathname: z.string().describe('API pathname (e.g. /api/v1/users)'),
          },
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async ({ module, method, pathname }) => {
          try {
            const engine = await provider.getEngine()
            const detail = engine.getDetail(module, method, pathname)
            if (!detail) {
              return { content: [{ type: 'text', text: 'API not found' }], isError: true }
            }
            return { content: [{ type: 'text', text: JSON.stringify(detail, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'list_modules',
        {
          description: '列出 .keqrc 中配置的所有 API 模块（Swagger/OpenAPI 规范来源）。当你需要了解项目接入了哪些服务时使用。',
          inputSchema: {},
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async () => {
          try {
            const engine = await provider.getEngine()
            const modules = engine.listModules()
            return { content: [{ type: 'text', text: JSON.stringify(modules, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'list_apis',
        {
          description: '列出项目中所有 API 接口的结构化信息，包含模块、方法、路径、operationId 和摘要。当你需要浏览所有可用接口时使用。',
          inputSchema: {
            module: z.array(z.string()).optional()
              .describe('Filter by module names'),
            method: z.string().optional()
              .describe('Filter by HTTP method (GET, POST, PUT, DELETE, etc.)'),
            pathname: z.string().optional()
              .describe('Filter by pathname pattern (glob supported)'),
            includes: z.array(z.enum(['operations', 'components'])).optional()
              .default(['operations'])
              .describe('What to include in results'),
          },
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async ({ module, method, pathname, includes }) => {
          try {
            const documents = await provider.getDocuments()
            const result = documents
              .filter((doc) => !module || module.includes(doc.module.name))
              .map((document) => {
                const item: {
                  module: string
                  operations?: Array<{ method: string; path: string; operationId: string; summary: string; description: string }>
                  components?: { schemas: Array<{ name: string; description: string }> }
                } = { module: document.module.name }

                if (includes.includes('operations')) {
                  let ops = document.operations
                  if (method) {
                    ops = ops.filter((op) => op.method.toLowerCase() === method.toLowerCase())
                  }
                  if (pathname) {
                    const match = picomatch(pathname)
                    ops = ops.filter((op) => match(op.pathname))
                  }
                  item.operations = ops.map((op) => ({
                    method: op.method.toUpperCase(),
                    path: op.pathname,
                    operationId: op.operationId,
                    summary: op.operation.summary || '',
                    description: op.operation.description || '',
                  }))
                }

                if (includes.includes('components')) {
                  item.components = {
                    schemas: document.schemas.map((schema) => {
                      const schemaObj = schema.schema as { description?: string }
                      return { name: schema.name, description: schemaObj.description || '' }
                    }),
                  }
                }

                return item
              })

            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'build_apis',
        {
          description: '为指定的 API 接口生成类型安全的 TypeScript 客户端代码。可按模块、方法、路径范围生成。生成后文件会写入 .keqrc 配置的输出目录。',
          inputSchema: {
            module: z.array(z.string()).optional()
              .describe('Module(s) to generate code for'),
            method: z.string().optional()
              .describe('HTTP method filter (e.g. GET, POST)'),
            pathname: z.string().optional()
              .describe('Pathname filter (glob pattern supported, e.g. /api/v1/users/**)'),
            fresh: z.boolean().optional()
              .default(false)
              .describe('Clean output directory before building'),
          },
          annotations: { readOnlyHint: false, destructiveHint: false },
        },
        async ({ module, method, pathname, fresh }) => {
          try {
            const filterRules: FilterRule[] = []

            if (module || method || pathname) {
              filterRules.push(
                {
                  deny: true,
                  persist: false,
                  moduleName: '*',
                  operationMethod: '*',
                  operationPathname: '/**',
                },
                ...xprodFilterRules({
                  module,
                  method,
                  pathname,
                  persist: false,
                }),
              )
            }

            const buildCompiler = new Compiler({
              build: true,
              persist: true,
              silent: true,
              fresh,
              config,
              debug,
              tolerant,
              filter: filterRules.length > 0 ? { rules: filterRules } : undefined,
            })

            await buildCompiler.run()

            const artifacts = buildCompiler.context.artifacts || []
            const rc = buildCompiler.context.rc
            const files = artifacts.map((a) => (rc ? `./${path.join(rc.outdir, a.filepath)}` : a.filepath))

            await provider.invalidate()

            return { content: [{ type: 'text', text: JSON.stringify({ generated: files.length, files }, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'list_generated_files',
        {
          description: '列出已生成的 TypeScript 客户端文件。可选择只列出无效/过期文件（不在当前构建产物中的文件）。',
          inputSchema: {
            invalid: z.boolean().optional()
              .default(false)
              .describe('If true, only list invalid/stale files not matching current build'),
          },
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async ({ invalid }) => {
          try {
            const context = await provider.getContext()
            const rc = context.rc
            if (!rc) {
              return { content: [{ type: 'text', text: 'Error: Failed to load configuration' }], isError: true }
            }

            if (invalid) {
              const validFilePaths = (context.artifacts || []).map((a) => a.filepath)
              const invalidFiles = await findInvalidFiles(rc.outdir, validFilePaths)
              const files = invalidFiles.map((f) => `./${path.join(rc.outdir, f.relativePath)}`)
              return { content: [{ type: 'text', text: JSON.stringify({ count: files.length, files }, null, 2) }] }
            }

            const artifacts = context.artifacts || []
            const files = artifacts.map((a) => `./${path.join(rc.outdir, a.filepath)}`)
            return { content: [{ type: 'text', text: JSON.stringify({ count: files.length, files }, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'get_filter_rules',
        {
          description: '查看当前 .keqfilter 文件中的过滤规则。过滤规则控制哪些 API 会被生成代码。',
          inputSchema: {},
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async () => {
          try {
            const filterPath = '.keqfilter'
            if (!await fs.exists(filterPath)) {
              return { content: [{ type: 'text', text: JSON.stringify({ exists: false, content: '' }, null, 2) }] }
            }
            const content = await fs.readFile(filterPath, 'utf-8')
            return { content: [{ type: 'text', text: JSON.stringify({ exists: true, content }, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'add_filter_rule',
        {
          description: '向 .keqfilter 添加过滤规则。deny 规则排除 API 不生成代码，allow 规则允许生成。',
          inputSchema: {
            mode: z.enum(['deny', 'allow']).describe('Rule mode: deny excludes APIs, allow includes them'),
            module: z.string().optional()
              .default('*')
              .describe('Module name pattern (glob supported)'),
            method: z.string().optional()
              .default('*')
              .describe('HTTP method pattern (e.g. GET, POST, or * for all)'),
            pathname: z.string().describe('Pathname pattern (glob supported, e.g. /api/v1/users/**)'),
            build: z.boolean().optional()
              .default(false)
              .describe('Whether to rebuild after adding the rule'),
          },
          annotations: { readOnlyHint: false, destructiveHint: false },
        },
        async ({ mode, module, method, pathname, build }) => {
          try {
            const filterCompiler = new Compiler({
              build,
              persist: true,
              silent: true,
              config,
              debug,
              tolerant,
              filter: {
                rules: [{
                  persist: true,
                  deny: mode === 'deny',
                  moduleName: module,
                  operationMethod: method.toLowerCase(),
                  operationPathname: pathname,
                }],
              },
            })

            await filterCompiler.run()

            if (build) {
              await provider.invalidate()
            }

            return { content: [{ type: 'text', text: JSON.stringify({ success: true, rule: { mode, module, method, pathname } }, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'remove_filter_rule',
        {
          description: '从 .keqfilter 中移除指定的过滤规则。',
          inputSchema: {
            mode: z.enum(['deny', 'allow']).describe('Which section the rule is in'),
            module: z.string().describe('Exact module name pattern to match'),
            method: z.string().describe('Exact method pattern to match'),
            pathname: z.string().describe('Exact pathname pattern to match'),
            build: z.boolean().optional()
              .default(false)
              .describe('Whether to rebuild after removing the rule'),
          },
          annotations: { readOnlyHint: false, destructiveHint: false },
        },
        async ({ mode, module, method, pathname, build }) => {
          try {
            const filterPath = '.keqfilter'
            if (!await fs.exists(filterPath)) {
              return { content: [{ type: 'text', text: 'Error: .keqfilter file not found' }], isError: true }
            }

            const content = await fs.readFile(filterPath, 'utf-8')
            const isDeny = mode === 'deny'
            const targetMethod = method.toLowerCase()

            const lines = content.split('\n')
            const resultLines: string[] = []
            let currentSection: 'deny' | 'allow' | null = null
            let skipNext = false

            for (const line of lines) {
              const trimmed = line.replace(/#.*$/, '').trim()

              if (trimmed === '[deny]') {
                currentSection = 'deny'
                resultLines.push(line)
                continue
              }
              if (trimmed === '[allow]') {
                currentSection = 'allow'
                resultLines.push(line)
                continue
              }

              if (!trimmed) {
                if (!skipNext) resultLines.push(line)
                skipNext = false
                continue
              }

              const matched = trimmed.match(/^([^\s]+)\s+([^:\s]+):(.*)$/)
              if (matched && currentSection === (isDeny ? 'deny' : 'allow')) {
                const [, ruleMethod, ruleModule, rulePathname] = matched
                if (
                  ruleMethod.toLowerCase() === targetMethod
                  && ruleModule === module
                  && rulePathname === pathname
                ) {
                  skipNext = false
                  continue
                }
              }

              resultLines.push(line)
              skipNext = false
            }

            await fs.writeFile(filterPath, resultLines.join('\n'), 'utf-8')

            if (build) {
              const buildCompiler = new Compiler({
                build: true,
                persist: true,
                silent: true,
                config,
                debug,
                tolerant,
              })
              await buildCompiler.run()
              await provider.invalidate()
            }

            return { content: [{ type: 'text', text: JSON.stringify({ success: true, removed: { mode, module, method, pathname } }, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      const transport = new StdioServerTransport()
      await server.connect(transport)

      provider.getEngine().catch(() => {})
    })
}
