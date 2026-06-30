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
import { CompilerProviderRegistry } from '../mcp/compiler-provider-registry.js'
import { discoverProjects } from '../mcp/discover-projects.js'
import type { Matcher } from '../utils/matcher.js'
import type { FilterRule } from '../utils/matcher.js'
import type { OperationDefinition } from '../models/index.js'

function getFilterAnnotation(matcher: Matcher, op: OperationDefinition | undefined): string {
  if (op && matcher.isOperationDenied(op)) {
    return 'This API is excluded from the code generation list by .keqfilter rules'
  }
  return 'This API is included in the code generation list'
}

export function registerMcpCommand(program: Command): void {
  program
    .command('mcp')
    .description('Start keq MCP server')
    .option('-c --config <config>', 'The keq-cli config file')
    .option('--tolerant', 'Tolerate wrong swagger/openapi structure')
    .option('--debug', 'Print debug information')
    .action(async (options) => {
      const config: string | undefined = options.config
      const tolerant = !!options.tolerant
      const debug = !!options.debug

      const entries = await discoverProjects(config)
      const registry = new CompilerProviderRegistry({ debug, tolerant })
      for (const entry of entries) {
        registry.register(entry)
      }

      const server = new McpServer({
        name: 'keq',
        version: '1.0.0',
        description: '查询和搜索项目中对接的所有后端服务 API 接口。当用户想了解后端有哪些接口、查找某个功能的 API、查看接口的请求参数和响应格式时使用。支持自然语言语义搜索（中英文）。也可为接口生成 TypeScript 客户端代码。数据来源：项目配置的 Swagger/OpenAPI 规范文档。',
      })

      const projectParam = z.string().optional()
        .describe('项目目录绝对路径，用于 monorepo 中指定操作哪个子项目。非 monorepo 项目无需提供。')

      server.registerTool(
        'list_projects',
        {
          description: '列出工作区中所有 keq 项目。用于获取其他工具的 project 参数可选值，monorepo 环境中应首先调用此工具确定目标项目。',
          inputSchema: {},
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async () => {
          try {
            const projects = registry.list()
            const result = projects.map((entry) => ({
              projectDir: entry.projectDir,
              configFile: path.basename(entry.configPath),
              packageName: entry.packageName || null,
            }))
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  count: result.length,
                  isMonorepo: result.length > 1,
                  projects: result,
                }, null, 2),
              }],
            }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'search_apis',
        {
          description: '通过语义匹配搜索项目中的后端 API 接口。仅当用户描述了具体功能或业务场景（如"用户登录"、"搜索商品"）来查找相关接口时使用。如果用户想查看所有接口或按模块/路径浏览接口列表，应使用 list_apis 而非此工具。支持中英文自然语言，返回按相关度排序的接口列表。',
          inputSchema: {
            project: projectParam,
            query: z.string().describe('自然语言搜索词，如"用户登录"、"搜索商品"、"订单列表"等'),
            module: z.array(z.string()).optional()
              .describe('按模块名筛选，限定在特定后端服务中搜索'),
            limit: z.number().optional()
              .default(10)
              .describe('返回结果数量上限'),
          },
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async ({ project, query, module, limit }) => {
          try {
            const provider = await registry.resolve(project)
            const engine = provider.getEngine()
            const matcher = provider.matcher
            const documents = provider.documents
            const results = await engine.search(query, { limit, module })

            const annotated = results.map((result) => {
              const { score, ...rest } = result
              const doc = documents.find((d) => d.module.name === result.module)
              const op = doc?.operations.find(
                (o) => o.method.toLowerCase() === result.method.toLowerCase() && o.pathname === result.pathname,
              )
              return {
                ...rest,
                'x-keq-score': score,
                'x-keq-filter': getFilterAnnotation(matcher, op),
              }
            })

            return { content: [{ type: 'text', text: JSON.stringify(annotated, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'get_api_detail',
        {
          description: '获取某个 API 接口的完整详情，包含请求参数、请求体、响应体的结构定义。当用户想知道某个接口怎么调用、需要传什么参数、返回什么数据时使用。需要先通过 search_apis 或 list_apis 获取接口的 module、method、pathname。',
          inputSchema: {
            project: projectParam,
            module: z.string().describe('Module name'),
            method: z.string().describe('HTTP method (GET, POST, PUT, DELETE, etc.)'),
            pathname: z.string().describe('API pathname (e.g. /api/v1/users)'),
          },
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async ({ project, module, method, pathname }) => {
          try {
            const provider = await registry.resolve(project)
            const engine = provider.getEngine()
            const matcher = provider.matcher
            const documents = provider.documents
            const detail = engine.getDetail(module, method, pathname)
            if (!detail) {
              return { content: [{ type: 'text', text: 'API not found' }], isError: true }
            }

            const doc = documents.find((d) => d.module.name === module)
            const op = doc?.operations.find(
              (o) => o.method.toLowerCase() === method.toLowerCase() && o.pathname === pathname,
            )

            return { content: [{ type: 'text', text: JSON.stringify({ ...detail, 'x-keq-filter': getFilterAnnotation(matcher, op) }, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'list_modules',
        {
          description: '列出项目对接的所有后端服务模块。当用户想知道项目接入了哪些后端系统、有哪些服务可用时使用。每个模块对应一个后端服务的 API 文档。',
          inputSchema: {
            project: projectParam,
          },
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async ({ project }) => {
          try {
            const provider = await registry.resolve(project)
            const engine = provider.getEngine()
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
          description: '列出项目中所有可用的后端 API 接口。当用户想查看所有接口、浏览某个服务的全部接口、查询某个系统有哪些接口、或按条件筛选接口（如只看 GET 请求或某个路径下的接口）时使用。如果用户描述了具体功能来查找接口（如"搜索商品的接口"），应使用 search_apis。',
          inputSchema: {
            project: projectParam,
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
        async ({ project, module, method, pathname, includes }) => {
          try {
            const provider = await registry.resolve(project)
            const documents = provider.documents
            const matcher = provider.matcher
            const result = documents
              .filter((doc) => !module || module.includes(doc.module.name))
              .map((document) => {
                const item: {
                  module: string
                  operations?: Array<{ method: string; path: string; operationId: string; summary: string; description: string; 'x-keq-filter': string }>
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
                    'x-keq-filter': getFilterAnnotation(matcher, op),
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
          description: '为后端 API 接口生成类型安全的 TypeScript 请求函数代码。当用户想生成某个接口的调用代码、需要类型安全的 HTTP 客户端时使用。可按模块、方法、路径范围筛选要生成的接口。生成的文件写入项目配置的输出目录。',
          inputSchema: {
            project: projectParam,
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
        async ({ project, module, method, pathname, fresh }) => {
          try {
            const configPath = registry.getConfigPath(project)
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
              config: configPath,
              debug,
              tolerant,
              filter: filterRules.length > 0 ? { rules: filterRules } : undefined,
            })

            await buildCompiler.run()

            const artifacts = buildCompiler.context.artifacts || []
            const rc = buildCompiler.context.rc
            const files = artifacts.map((a) => (rc ? path.join(rc.outdir, a.filepath) : a.filepath))

            return { content: [{ type: 'text', text: JSON.stringify({ generated: files.length, files }, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'list_generated_files',
        {
          description: '列出已生成的 API 客户端代码文件。当用户想查看哪些接口已经生成了代码、或想找出过期/无效的生成文件时使用。',
          inputSchema: {
            project: projectParam,
            invalid: z.boolean().optional()
              .default(false)
              .describe('If true, only list invalid/stale files not matching current build'),
          },
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async ({ project, invalid }) => {
          try {
            const provider = await registry.resolve(project)
            const context = provider.context
            const rc = context.rc
            if (!rc) {
              return { content: [{ type: 'text', text: 'Error: Failed to load configuration' }], isError: true }
            }

            if (invalid) {
              const validFilePaths = (context.artifacts || []).map((a) => a.filepath)
              const invalidFiles = await findInvalidFiles(rc.outdir, validFilePaths)
              const files = invalidFiles.map((f) => path.join(rc.outdir, f.relativePath))
              return { content: [{ type: 'text', text: JSON.stringify({ count: files.length, files }, null, 2) }] }
            }

            const artifacts = context.artifacts || []
            const files = artifacts.map((a) => path.join(rc.outdir, a.filepath))
            return { content: [{ type: 'text', text: JSON.stringify({ count: files.length, files }, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'get_filter_rules',
        {
          description: '查看当前的接口过滤规则。过滤规则决定哪些 API 接口会被纳入代码生成范围。当用户想了解哪些接口被排除或包含在生成列表中时使用。',
          inputSchema: {
            project: projectParam,
          },
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
        async ({ project }) => {
          try {
            await registry.resolve(project)
            const configPath = registry.getConfigPath(project)
            const filterPath = path.resolve(path.dirname(configPath), '.keqfilter')
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
          description: '添加接口过滤规则，控制哪些 API 需要生成代码。当用户想排除某些不需要的接口、或只保留特定接口时使用。deny 模式排除接口，allow 模式包含接口。',
          inputSchema: {
            project: projectParam,
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
        async ({ project, mode, module, method, pathname, build }) => {
          try {
            const configPath = registry.getConfigPath(project)

            const filterCompiler = new Compiler({
              build,
              persist: true,
              silent: true,
              config: configPath,
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

            return { content: [{ type: 'text', text: JSON.stringify({ success: true, rule: { mode, module, method, pathname } }, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      server.registerTool(
        'remove_filter_rule',
        {
          description: '移除已有的接口过滤规则。当用户想恢复之前被排除的接口、或调整过滤策略时使用。',
          inputSchema: {
            project: projectParam,
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
        async ({ project, mode, module, method, pathname, build }) => {
          try {
            const configPath = registry.getConfigPath(project)
            const filterPath = path.resolve(path.dirname(configPath), '.keqfilter')

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
                config: configPath,
                debug,
                tolerant,
              })
              await buildCompiler.run()
            }

            return { content: [{ type: 'text', text: JSON.stringify({ success: true, removed: { mode, module, method, pathname } }, null, 2) }] }
          } catch (error) {
            return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
          }
        },
      )

      const transport = new StdioServerTransport()
      await server.connect(transport)

      if (registry.list().length === 1) {
        registry.resolve().catch(() => {})
      }
    })
}
