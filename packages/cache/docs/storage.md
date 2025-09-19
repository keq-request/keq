# Storage

`Storage` is the container for storing cached data.

## MemoryStorage

`MemoryStorage` store the data in memory and cleared on page refresh.

| **Options** | **Default**                              | **Description**                                                                                             |
| :---------- | :--------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| size        | Infinity                                 | Maximum storage size. cache will be removed. The cache data will be deleted when when size is insufficient. |
| eviction    | [VolatileTTL](./eviction.md#volatilettl) | Eviction policies when memory is insufficient. [See More](./eviction.md)                                    |

```typescript
import { request } from "keq";
import { cache, Strategy, MemoryStorage } from "keq-cache";

const storage = new MemoryStorage({
  size: 10 * 1000 * 1000,
  eviction: Eviction.TTL,
});

request.use(cache({ storage }));
```

## IndexedDBStorage

Storing the cache data in IndexedBD.

| **Options** | **Default**                              | **Description**                                                                                                        |
| :---------- | :--------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| size        | Infinity                                 | Maximum storage size. cache will be removed. The cache data will be deleted when when size is insufficient.            |
| eviction    | [VolatileTTL](./eviction.md#volatilettl) | Eviction policies when memory is insufficient. [See More](./eviction.md)                                               |
| tableName   | `'keq_cache_indexed_db_storage'`         | The table name for the IndexedDB storage, **multiple instances using the same table name will share the cached data**. |

```typescript
import { request } from "keq";
import { cache, Strategy, IndexedDBStorage } from "keq-cache";

const storage = new IndexedDBStorage({
  size: 10 * 1000 * 1000,
  eviction: Eviction.TTL,
  tableName: "custom-cache-table-name",
});

request.use(cache({ storage }));
```

## MultiTierStorage

`MultiTierStorage` provides a multi-tier caching solution that manages multiple storage instances in layers. This is useful for implementing a cache hierarchy where faster but smaller storages (like MemoryStorage) are used as the first tier, and slower but larger storages (like IndexedDBStorage) are used as higher tiers.

| **Options** | **Default** | **Description**                                                                                                                                                                    |
| :---------- | :---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tiers       | -           | Array of storage instances ordered by performance (fastest first). The first storage in the array should be the fastest but typically smallest, subsequent storages can be larger. |

### How it works

- **Reading**: When retrieving cached data, `MultiTierStorage` searches from the lowest tier (fastest) to the highest tier (slowest). When data is found in a higher tier, it automatically syncs the data back to all lower tiers for faster future access.
- **Writing**: When storing cached data, it writes to all tiers concurrently to ensure data consistency across all storage layers.
- **Removing**: When removing cached data, it removes from all tiers concurrently.

```typescript
import { request } from "keq";
import {
  cache,
  MemoryStorage,
  IndexedDBStorage,
  MultiTierStorage,
} from "keq-cache";

const memoryStorage = new MemoryStorage({
  size: 5 * 1000 * 1000, // 5MB memory cache
});

const indexedDBStorage = new IndexedDBStorage({
  size: 50 * 1000 * 1000, // 50MB persistent cache
  tableName: "app-cache",
});

const storage = new MultiTierStorage({
  tiers: [memoryStorage, indexedDBStorage], // Fast memory first, then persistent storage
});

request.use(cache({ storage }));
```

## TierStorage

`TierStorage` is a convenient two-tier caching solution that combines `MemoryStorage` (L1 cache) and `IndexedDBStorage` (L2 cache). It's essentially a simplified wrapper around `MultiTierStorage` that provides a common caching pattern without the complexity of managing multiple storage instances manually.

| **Options** | **Default** | **Description**                                                                                                                                                       |
| :---------- | :---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| memory      | `{}`        | Configuration options for the memory storage (L1 cache) or an existing `MemoryStorage` instance. If not provided, a default `MemoryStorage` will be created.          |
| indexedDB   | `{}`        | Configuration options for the IndexedDB storage (L2 cache) or an existing `IndexedDBStorage` instance. If not provided, a default `IndexedDBStorage` will be created. |

### How it works

`TierStorage` provides the same multi-tier caching behavior as `MultiTierStorage` but specifically for a two-tier setup:

- **L1 Cache (Memory)**: Fast in-memory storage for frequently accessed data
- **L2 Cache (IndexedDB)**: Persistent storage that survives page refreshes

The caching strategy follows the same pattern:

- **Reading**: Searches memory first, then IndexedDB. If found in IndexedDB, automatically promotes to memory for faster future access.
- **Writing**: Stores data in both memory and IndexedDB simultaneously.
- **Removing**: Removes data from both storage tiers.

### Basic Usage

```typescript
import { request } from "keq";
import { cache, TierStorage } from "keq-cache";

// Simple two-tier cache with default settings
const storage = new TierStorage();

request.use(cache({ storage }));
```

### Custom Configuration

```typescript
import { request } from "keq";
import { cache, TierStorage, Eviction } from "keq-cache";

const storage = new TierStorage({
  memory: {
    size: 5 * 1000 * 1000, // 5MB memory cache
    eviction: Eviction.LRU,
  },
  indexedDB: {
    size: 50 * 1000 * 1000, // 50MB persistent cache
    eviction: Eviction.TTL,
    tableName: "app-cache",
  },
});

request.use(cache({ storage }));
```

### Using Existing Storage Instances

```typescript
import { request } from "keq";
import {
  cache,
  TierStorage,
  MemoryStorage,
  IndexedDBStorage,
  Eviction,
} from "keq-cache";

// Create storage instances with specific configurations
const memoryStorage = new MemoryStorage({
  size: 10 * 1000 * 1000,
  eviction: Eviction.LFU,
});

const indexedDBStorage = new IndexedDBStorage({
  size: 100 * 1000 * 1000,
  tableName: "shared-cache",
});

// Use existing instances
const storage = new TierStorage({
  memory: memoryStorage,
  indexedDB: indexedDBStorage,
});

request.use(cache({ storage }));
```

### Mixed Configuration

You can also mix existing instances with configuration options:

```typescript
import { request } from "keq";
import { cache, TierStorage, MemoryStorage } from "keq-cache";

const existingMemoryStorage = new MemoryStorage({
  size: 8 * 1000 * 1000,
});

const storage = new TierStorage({
  memory: existingMemoryStorage, // Use existing instance
  indexedDB: {
    // Configure new instance
    size: 80 * 1000 * 1000,
    tableName: "mixed-cache",
  },
});

request.use(cache({ storage }));
```

## Custom Storage

You can define your own `Storage`, if you want to use other ways to store cache (such as `SessionStorage`), Let's see an simple example:

```typescript
import { KeqCacheStorage, CacheEntry } from "keq-cache";

class MyStorage extends KeqCacheStorage {
  private storage = new Map<string, CacheEntry>();

  get(key: string): CacheEntry {
    return this.storage.get(key);
  }

  set(entry: string): void {
    this.storage.set(entry);
  }

  remove(key: string): void {
    this.storage.delete(entry.key);
  }
}
```

For more details , please refer to the codes of [`MemoryStorage`](../src/storage/memory-storage/memory-storage.ts) and [`IndexedDBStorage`](../src/storage/indexed-db-storage/indexed-db-storage.ts)
