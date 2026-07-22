---
"@keq-request/cli": minor
---

**Feat:** Add download cache store system with `FileSystemCacheStore`, `MemoryCacheStore`, `NullCacheStore`, and `NamespacedCacheStore` implementations.

- Supports `--no-cache` flag in `build` command and a new `cache clear` subcommand (with `--all` option) for managing cached downloads
- Cache stored in OS standard directory (`~/Library/Caches/keq-request/cli/v5/` on macOS, `$XDG_CACHE_HOME/keq-request/cli/v5/` on Linux, `%LOCALAPPDATA%/keq-request/cli/Cache/v5/` on Windows), isolated by project path hash
- Built-in 7-day max TTL to prevent cache files from accumulating indefinitely
