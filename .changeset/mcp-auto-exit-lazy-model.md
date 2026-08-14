---
"@keq-request/cli": patch
---

**Fix:** the MCP server no longer accumulates orphaned processes that exhaust memory. Each stdio subprocess now exits when the client disconnects, its parent dies, it receives a termination signal, or after 30 minutes idle. The semantic search model is loaded lazily on the first `search_apis` call, so metadata-only tools no longer consume model memory.
