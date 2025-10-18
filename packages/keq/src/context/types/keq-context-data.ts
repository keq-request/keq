export interface KeqContextData {
  retry?: {
    // How many times to retry
    attempt: number
  }

  [key: string]: any
}
