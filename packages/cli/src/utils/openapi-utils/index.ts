import { dereference } from './dereference.js'
import { dereferenceOperation } from './dereference-operation.js'
import { isRefDefined } from './is-ref-defined.js'
import { removeUndefinedRef } from './remove-undefined-ref.js'
import { updateOperationId } from './update-operation-id.js'
import { dereferenceDeep } from './dereference-deep.js'
import { To3_1 } from './to-3_1.js'


export class OpenapiUtils {
  static isRefDefined = isRefDefined
  static dereference = dereference
  static dereferenceDeep = dereferenceDeep
  static removeUndefinedRef = removeUndefinedRef
  static dereferenceOperation = dereferenceOperation
  static updateOperationId = updateOperationId
  static to3_1 = To3_1
}
