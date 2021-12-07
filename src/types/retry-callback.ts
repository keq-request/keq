export type RetryCallback = (error: Error) => void | boolean | Promise<void | boolean>
