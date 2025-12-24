import * as changeCase from 'change-case'
import { ApiDocumentV3_1 } from '~/models/api-document_v3_1.js'

export interface ApiDocumentNestjsModuleRendererOptions {
  esm?: boolean

  getNestjsClientFilepath(document: ApiDocumentV3_1): string
}

export class NestjsModuleRenderer {
  constructor(
    private readonly document: ApiDocumentV3_1,
    private readonly options: ApiDocumentNestjsModuleRendererOptions,
  ) {
  }

  render(): string {
    const moduleName = changeCase.pascalCase(this.document.module.name)
    const clientFilepath = this.options.getNestjsClientFilepath(this.document)
      .replace(/(\.ts|\.mts|\.cts|\.js|\.cjs|\.mjs)?$/, this.options.esm ? '.js' : '')

    return [
      '/* @anchor:file:start */',
      'import { Module, Inject, ConfigurableModuleBuilder, Global } from "@nestjs/common"',
      'import { KeqRequest } from "keq"',
      'import { KeqModuleOptions } from "@keq-request/nestjs"',
      `import { ${moduleName}Client } from "${clientFilepath}"`,
      '',
      '',
      'const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } = new ConfigurableModuleBuilder<KeqModuleOptions>().build()',
      '',
      '@Global()',
      '@Module({',
      '  imports: [],',
      '  controllers: [],',
      `  providers: [${moduleName}Client],`,
      `  exports: [${moduleName}Client],`,
      '})',
      `export class ${moduleName}Module extends ConfigurableModuleClass {`,
      '',
      '  constructor(',
      '    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: KeqModuleOptions,',
      '    private readonly request: KeqRequest,',
      '  ) {',
      '    super()',
      '  }',
      '',
      '  onModuleInit() {',
      '    if (this.options.middlewares) {',
      '      for (const middleware of this.options.middlewares) {',
      '        this.request.use(middleware)',
      '      }',
      '    }',
      '  }',
      '}',
      '',
      '/* @anchor:file:end */',
    ].join('\n')
  }
}
