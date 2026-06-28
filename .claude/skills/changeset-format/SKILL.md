---
name: changeset-format
description: >
  Documents the changeset markdown format for this project. Use this skill
  whenever the user asks to create a changeset, add a version bump, write a
  changelog entry, or describe a code change for release. Also use it when
  the user mentions "changesets", "release notes", "versioning", "breaking
  change", or asks what bump type a change needs.
---

# Changeset 格式规范

本项目的 changeset 文件位于 `.changeset/` 目录，使用 `@changesets/cli` 管理。

## 受管理的包

| 包名 | 说明 |
|------|------|
| `keq` | 核心包 |
| `@keq-request/cache` | 缓存模块 |
| `@keq-request/cli` | CLI 工具 |
| `@keq-request/exception` | 异常处理 |
| `@keq-request/headers` | 请求头模块 |
| `@keq-request/nestjs` | NestJS 集成 |
| `@keq-request/test` | 测试工具 |
| `@keq-request/url` | URL 处理 |

## Bump 类型选择

| Bump | 使用场景 |
|------|---------|
| `major` | 公共 API 移除或重命名、行为不兼容变更、会导致调用方代码需要修改的变更 |
| `minor` | 向后兼容的新功能、新增公共方法/选项/类型 |
| `patch` | Bug 修复、性能优化、内部重构（无新 API）、构建/发布调整 |

## Frontmatter 格式

Changeset 文件以 YAML frontmatter 开头，用 `---` 分隔。包名必须加双引号。

**单包：**
```yaml
---
"@keq-request/nestjs": minor
---
```

**多包（每行一个）：**
```yaml
---
"@keq-request/exception": major
"@keq-request/headers": major
"@keq-request/cache": major
"@keq-request/cli": major
"@keq-request/url": major
---
```

## 正文格式约定

正文内容决定了 bump 类型，而非反过来。所有正文**必须使用英文**。

| 正文标签 | Bump 类型 | 含义 |
|---------|----------|------|
| `**BREAKING CHANGE:**` | `major` | 不兼容变更 |
| `**Feat:**` | `minor` | 新功能 |
| `**Fix:**` | `patch` | Bug 修复 |
| `**Perf:**` | `patch` | 性能优化 |
| 纯文本（无标签） | `patch` | 不属于以上类别，或对 pre-release 阶段已合入但尚未正式发布的 feat 的修补 |

标签与 bump 类型必须一致：`**Feat:**` 必须配合 `minor`，`**BREAKING CHANGE:**` 必须配合 `major`。

## 完整示例

### Major — 单包

```markdown
---
"keq": major
---

**BREAKING CHANGE:** Add an options to control query serialization.

- `.query({ a: [1, 2]})` => `?a[0]=1&a[1]=2`
- `.query({ a: [1, 2]}, { arrayFormat: 'brackets' })` => `?a[]=1&a[]=2`(default in keq@2)
- `.query({ a: [1, 2]}, { arrayFormat: 'repeat' })` => `?a=1&a=2`
- `.query({ a: [1, 2]}, { arrayFormat: 'comma' })` => `?a=1,2`
```

### Major — 多包

```markdown
---
"@keq-request/exception": major
"@keq-request/headers": major
"@keq-request/cache": major
"@keq-request/cli": major
"@keq-request/url": major
---

**BREAKING CHANGE:** group all packages under the @keq-request scope

- keq-cache => @keq-request/cache
- keq-headers => @keq-request/headers
- keq-cli => @keq-request/cli
- keq-url => @keq-request/url
- keq-exception => @keq-request/exception
```

### Minor — 单包

```markdown
---
"@keq-request/nestjs": minor
---

**Feat:** Add `exclude()` method to `KeqMiddlewareConfigProxy`, allowing middleware to skip specific routes. Supports `KeqRouteInfo` with `host`, `method`, and `pathname` patterns, following the NestJS `MiddlewareConfigProxy.exclude()` convention.
```

### Patch — `**Fix:**`

```markdown
---
"@keq-request/cli": patch
---

**Fix:** wrap enum union type with parentheses to ensure correct type precedence.
```

### Patch — `**Perf:**`

```markdown
---
"@keq-request/cache": patch
---

**Perf:** add blocking for concurrent requests with same cache key.
```

### Patch — 纯文本

```markdown
---
"keq": patch
---

ensure the monotonicity of middleware execution
```

## 反模式

以下情况应当避免：

- **标签与 bump 类型不匹配**：如正文用 `**Feat:**` 但 frontmatter 写 `patch`（`**Feat:**` 必须对应 `minor`）
- **`**BREAKING CHANGE:**` 配合非 `major` bump**：破坏性变更必须用 `major`
- **正文为空**：每个 changeset 必须有正文描述
- **正文使用中文**：所有正文必须用英文
- **包名未加双引号**：YAML 中包名是字符串，必须加双引号 `"package-name"`
- **包含未实际变更的包**：只列出本次修改涉及的包，不要为了统一版本号而手动添加无关包
