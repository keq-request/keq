import * as changeCase from 'change-case'
import { FileNamingStyle } from '~/constants/file-naming-style.js'

export function convertFilename(name: string, style: FileNamingStyle): string {
  if (style === FileNamingStyle.raw) return name
  return changeCase[style](name)
}
