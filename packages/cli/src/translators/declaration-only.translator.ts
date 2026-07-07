import { GenerateDeclarationPlugin } from '~/plugins/generate-declaration/generate-declaration.plugin.js'
import type { Plugin } from '~/types/plugin.js'
import type { Translator } from '~/types/translator.js'


export class DeclarationOnlyTranslator implements Translator {
  apply(): Plugin[] {
    return [
      new GenerateDeclarationPlugin(),
    ]
  }
}
