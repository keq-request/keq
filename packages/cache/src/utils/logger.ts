export class Logger {
  static debug(...args: unknown[]): void {
    console.debug('[@keq-request/cache] [DEBUG] ', ...args)
  }

  static error(...args: unknown[]): void {
    console.error('[@keq-request/cache] [ERROR] ', ...args)
  }
}
