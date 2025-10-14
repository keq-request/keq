export interface BuildCliOptions {
  /**
   * The build config file
   */
  config?: string

  /**
   * Filter module(s) to generate
   */
  module?: string[]

  /**
   * Print debug information
   */
  debug?: boolean

  /**
   * Tolerate wrong swagger structure
   */
  tolerant?: boolean
}
