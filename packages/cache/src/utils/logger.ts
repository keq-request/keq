export class Logger {
  static debug(...args: unknown[]): void {
    console.debug('[@keq-cache] [DEBUG] ', ...args)
  }

  static error(...args: unknown[]): void {
    console.error('[@keq-cache] [ERROR] ', ...args)
  }
}
