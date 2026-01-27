import { Plugin } from './plugin.js'


export interface Translator {
  apply(): Plugin[]
}
