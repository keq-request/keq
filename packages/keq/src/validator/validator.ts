/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Validator 类用于类型检查
 */
export class Validator {
  /**
   * 检查是否为浏览器环境
   */
  static isBrowser(): boolean {
    return typeof window !== 'undefined'
  }

  /**
   * 检查是否为字符串
   */
  static isString(value: any): boolean {
    return typeof value === 'string'
  }

  /**
   * 检查是否为对象
   */
  static isObject(value: any): value is Exclude<object, null> {
    return typeof value === 'object' && value !== null
  }

  /**
   * 检查是否为函数
   */
  static isFunction(value: any): boolean {
    return typeof value === 'function'
  }

  /**
   * 检查是否为 ArrayBuffer
   */
  static isArrayBuffer(body: any): body is ArrayBuffer {
    return body instanceof ArrayBuffer
  }

  /**
   * 检查是否为 ReadableStream
   */
  static isReadableStream(body: any): body is ReadableStream {
    return body instanceof ReadableStream
  }

  /**
   * 检查是否为 Blob 或 File 类对象
   */
  static isBlob(value: any): value is Blob {
    if (value instanceof Blob) return true

    const names = ['Blob', 'File']

    return Validator.isObject(value)
      && Validator.isString(value['type'])
      && Validator.isFunction(value['arrayBuffer'])
      && Validator.isFunction(value['stream'])
      && Validator.isFunction(value.constructor)
      && names.includes(value.constructor.name)
      && 'size' in value
  }

  /**
   * 检查是否为 File
   */
  static isFile(object: any): object is File {
    if (Validator.isBrowser()) return object instanceof Blob

    return Validator.isBlob(object)
  }

  /**
   * 检查是否为 Buffer
   */
  static isBuffer(obj: any): obj is Buffer {
    return Validator.isBrowser() ? false : Buffer.isBuffer(obj)
  }

  /**
   * 检查是否为 FormData
   */
  static isFormData(object: any): object is FormData {
    if (object instanceof FormData) return true

    return (
      Validator.isObject(object)
      && Validator.isFunction(object['append'])
      && Validator.isFunction(object['delete'])
      && Validator.isFunction(object['get'])
      && Validator.isFunction(object['getAll'])
      && Validator.isFunction(object['has'])
      && Validator.isFunction(object['set'])
      && Validator.isFunction(object['entries'])
      && Validator.isFunction(object['keys'])
      && Validator.isFunction(object['values'])
    )
  }

  /**
   * 检查是否为 Headers
   */
  static isHeaders(obj: any): obj is Headers {
    if (obj instanceof Headers) return true

    if (
      Validator.isObject(obj)
      && Validator.isFunction(obj['forEach'])
      && Validator.isFunction(obj['get'])
      && Validator.isFunction(obj['has'])
      && Validator.isFunction(obj['set'])
      && Validator.isFunction(obj['append'])
      && Validator.isFunction(obj['delete'])
      && Validator.isFunction(obj['entries'])
      && Validator.isFunction(obj['keys'])
      && Validator.isFunction(obj['values'])
    ) {
      return true
    }

    return false
  }

  /**
   * 检查是否为 URLSearchParams
   */
  static isUrlSearchParams(obj: any): obj is URLSearchParams {
    if (obj instanceof URLSearchParams) return true

    return (
      Validator.isObject(obj)
      && Validator.isFunction(obj['append'])
      && Validator.isFunction(obj['delete'])
      && Validator.isFunction(obj['entries'])
      && Validator.isFunction(obj['forEach'])
      && Validator.isFunction(obj['get'])
      && Validator.isFunction(obj['getAll'])
      && Validator.isFunction(obj['has'])
      && Validator.isFunction(obj['keys'])
      && Validator.isFunction(obj['set'])
      && Validator.isFunction(obj['values'])
      && Validator.isFunction(obj['sort'])
      && Validator.isFunction(obj['toString'])
    )
  }

  /**
   * 检查是否为合法的 Header 值
   * 允许范围: HTAB(\t), 0x20-0x7E, 0x80-0xFF
   * 禁止换行等控制字符
   */
  static isHeaderValue(str: any): boolean {
    const regex = /^[\t\x20-\x7E\x80-\xFF]*$/
    return regex.test(String(str))
  }

  /**
   * 检查是否为 BodyInit 类型
   * BodyInit 包括: Blob | ArrayBuffer | TypedArray | DataView | FormData | URLSearchParams | ReadableStream | string
   */
  static isBodyInit(value: any): value is BodyInit {
    if (value === null || value === undefined) return false

    return (
      Validator.isString(value)
      || Validator.isBlob(value)
      || Validator.isArrayBuffer(value)
      || Validator.isFormData(value)
      || Validator.isUrlSearchParams(value)
      || Validator.isReadableStream(value)
      || Validator.isBuffer(value)
      // TypedArray or DataView
      || ArrayBuffer.isView(value)
    )
  }
}
