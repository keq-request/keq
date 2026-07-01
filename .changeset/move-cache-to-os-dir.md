---
"@keq-request/cli": minor
---

**Feat:** Migrate file system cache from project directory (`.keq/cache/`) to OS standard cache directory (`~/Library/Caches/keq-request/cli/v5/` on macOS, `$XDG_CACHE_HOME/keq-request/cli/v5/` on Linux, `%LOCALAPPDATA%/keq-request/cli/Cache/v5/` on Windows). Each project's cache is isolated by a SHA-256 hash of the project path. Added `--all` option to `cache clear` command for clearing all projects' caches.
