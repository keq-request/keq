export interface CliOptions {
  /**
   * The build config file
   */
  config?: string

  /**
   * Interactive select the scope of generation
   */
  interactive?: boolean

  /**
   * Filter module(s) to generate
   */
  module?: string[]

  /**
   * Only generate files of the specified operation method
   */
  method?:
        | 'get'
        | 'post'
        | 'put'
        | 'delete'
        | 'patch'
        | 'head'
        | 'option'
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'DELETE'
        | 'PATCH'
        | 'HEAD'
        | 'OPTION'

  /**
   * Only generate files of the specified operation pathname
   */
  pathname?: string[]

  /**
   * Print debug information
   */
  debug?: boolean

  /**
   * Tolerate wrong swagger structure
   */
  tolerant?: boolean
}
