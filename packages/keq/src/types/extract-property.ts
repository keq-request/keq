export type ExtractProperty<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}
