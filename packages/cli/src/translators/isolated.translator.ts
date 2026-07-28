import { GenerateIsolatedPlugin } from '~/plugins/generate-isolated/index.js'
import type { Plugin } from '~/types/plugin.js'
import type { Translator } from '~/types/translator.js'


export class IsolatedTranslator implements Translator {
  apply(): Plugin[] {
    return [
      new GenerateIsolatedPlugin(),
    ]
  }
}
