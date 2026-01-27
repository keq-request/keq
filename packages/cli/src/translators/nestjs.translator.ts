import { GenerateDeclarationPlugin, GenerateNestjsModulePlugin } from '~/plugins/index.js'
import { Translator, Plugin } from '~/types/index.js'


export class NestjsTranslator implements Translator {
  apply(): Plugin[] {
    return [
      new GenerateDeclarationPlugin(),
      new GenerateNestjsModulePlugin(),
    ]
  }
}
