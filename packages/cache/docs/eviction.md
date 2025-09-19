# Eviction

### `Eviction.LRU`

Keeps most recently used keys removes least recently used (LRU) keys

> 淘汰整个键值中最久未使用的键值

### `Eviction.RANDOM`

Randomly removes keys to make space for the new data added.

> 随机淘汰任意键值

### `Eviction.LFU`

Keeps frequently used keys removes least frequently used (LFU) keys

> 淘汰整个键值中最少使用的键值

### `Eviction.TTL`

Removes keys with expire field set to true and the shortest remaining time-to-live (TTL) value

> 优先淘汰更早过期的键值
