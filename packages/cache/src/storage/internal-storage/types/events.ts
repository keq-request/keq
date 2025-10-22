export interface OnCacheGetEvent {
  key: string
}

export interface OnCacheSetEvent {
  key: string
}

export interface OnCacheRemoveEvent {
  key: string
}

export interface OnCacheEvictEvent {
  keys: string[]
}

export interface OnCacheExpiredEvent {
  keys: string[]
}
