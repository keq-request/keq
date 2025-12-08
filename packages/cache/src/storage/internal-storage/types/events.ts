export interface OnCacheGetEvent {
  readonly key: string
}

export interface OnCacheSetEvent {
  readonly key: string
}

export interface OnCacheRemoveEvent {
  readonly key: string
}

export interface OnCacheEvictEvent {
  readonly keys: string[]
}

export interface OnCacheExpiredEvent {
  readonly keys: string[]
}
