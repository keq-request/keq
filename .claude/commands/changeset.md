根据当前 git 变更创建一个 changeset 文件。

## 步骤

1. 运行 `git diff HEAD` 和 `git status` 查看当前所有变更内容
2. 根据变更的文件路径确定涉及哪些包，读取对应目录的 `package.json` 获取包名
3. 调用 `/changeset-format` skill 了解 changeset 的格式规范，根据规范分析变更类型和 bump 级别
4. 检查 `.changeset/` 目录下是否已存在与本次变更相关的 changeset 文件（通过文件名和内容判断关联性），以及检查 `.changeset/pre.json` 是否存在以确定当前是否处于 prerelease 阶段
5. 根据第 4 步的结果决定操作方式（见下方决策规则）
6. 按照 `/changeset-format` skill 提供的格式执行创建或更新

## 决策规则

- **更新已有 changeset**：存在涵盖同一功能的 changeset，且该文件尚未被发布（未包含在任何已发布的 prerelease 版本中）→ 直接更新其描述内容
- **新建 changeset**：本次变更与已有 changeset 均无关联，或关联的 changeset 已被发布 → 生成描述性的 kebab-case slug 作为文件名并创建新文件
- **删除 changeset**：某个已有 changeset 描述的功能被完全回退时

### 如何判断 changeset 是否已发布

- **prerelease 阶段**（`.changeset/pre.json` 存在）：读取 `pre.json` 中的 `changesets` 数组，检查目标文件名（不含 `.md` 后缀）是否在该数组中。在数组中 → 已被某个 prerelease 版本消费，视为已发布；不在数组中 → 尚未发布，可更新
- **正式发布阶段**（无 `pre.json`）：changeset 文件仍存在于 `.changeset/` 目录中即为未发布

## 注意事项

- 如果无法判断变更类型，询问用户
- 判断"同一功能"时，关注变更涉及的模块和逻辑目的，而非仅看文件路径是否完全一致
