/**
 * 通用 URL 验证正则表达式，支持任意协议
 *
 * 格式: protocol://[user:password@][host][:port][/path][?query][#fragment]
 *
 * 支持的协议示例:
 * - http://, https://
 * - file:// (支持 file:///path 和 file://host/path 两种格式)
 * - ftp://, sftp://
 * - ws://, wss://
 * - 以及任何其他自定义协议
 */
const URL_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/(?:[^\s@]+@)?[^\s/:?#]*(?::\d+)?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?$/

/**
 * 验证是否为有效的 URL
 *
 * @param url - 待验证的 URL 字符串
 * @returns 如果是有效的 URL 返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isValidURL('http://example.com') // true
 * isValidURL('https://example.com:8080/path?query=1#fragment') // true
 * isValidURL('file:///path/to/file.json') // true
 * isValidURL('not a url') // false
 * ```
 */
export function isValidURL(url: string): boolean {
  return URL_REGEX.test(url)
}
