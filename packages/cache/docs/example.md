# Usage Examples

## Global Middleware and Global configuration

```typescript
import { request } from "keq";
import { cache, MemoryStorage } from "keq-cache";

request.use(
  cache({
    storage: new MemoryStorage(),
    rules: [
      {
        pattern: (ctx) =>
          ctx.request.method === "get" &&
          ctx.request.url.pathname === "/example",
        strategy: Strategy.STALE_WHILE_REVALIDATE,
        ttl: 5 * 60 * 1000,
        key: (ctx) => ctx.request.__url__.href,
        exclude: async (response) => response.status !== 200,
      },
    ],
  })
);

/// This request will be cache
request.get("/example");

/// This won't be cache
request.post("/cat");
```

## Global Middleware and Enable on demand

<!-- prettier-ignore -->
```typescript
import { request } from "keq";
import { cache, MemoryStorage } from "keq-cache";

request.use(cache({ storage: new MemoryStorage() }));

/// This request will be cache
request
  .get("/example")
  .options({
    cache: {
      strategy: Strategy.STALE_WHILE_REVALIDATE,
      key: "custom-cache-key",
      exclude: async (response) => response.status !== 200,
      ttl: 1000,
    },
  });

/// This won't be cache
request
  .get("/example");
```

## OneTime Middleware

<!-- prettier-ignore -->
```typescript
import { request, KeqMiddleware } from "keq";
import { cache, MemoryStorage } from "keq-cache";

const storage = new MemoryStorage();

function swr(): KeqMiddleware {
  return cache({
    storage,
    rules: [
      {
        pattern: () => true,
        strategy: Strategy.STALE_WHILE_REVALIDATE,
        ttl: 5 * 60 * 1000,
        key: (ctx) => ctx.request.__url__.href,
        exclude: async (response) => response.status !== 200,
      },
    ],
  });
}

/// This request will be cache
request
  .get("/example")
  .use(swr());

/// This won't be cache
request
  .get("/example");
```
