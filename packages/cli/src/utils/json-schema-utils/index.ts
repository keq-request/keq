import { isArray } from './is-array.js'
import { isMixed } from './is-mixed.js'
import { isNonArray } from './is-non-array.js'
import { isRef } from './is-ref.js'


export class JsonSchemaUtils {
  static isRef = isRef
  static isArray = isArray
  static isNonArray = isNonArray
  static isMixed = isMixed
}
