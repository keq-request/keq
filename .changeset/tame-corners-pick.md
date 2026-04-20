---
"@keq-request/cli": major
---

**BREAKING CHANGE:** replace `.keqignore` with `.keqfilter` using an INI-style format.

- New format uses `[deny]` / `[allow]` sections with `METHOD module:/pathname` lines
- CLI command renamed: `keq ignore` → `keq filter`, subcommands `add` → `deny`, `except` → `allow`
- Precompile glob matchers for better performance
