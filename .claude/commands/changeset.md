根据当前 git 变更创建一个 changeset 文件。

## 步骤

1. 运行 `git diff HEAD` 和 `git status` 查看当前所有变更内容
2. 根据变更的文件路径确定涉及哪些包，读取对应目录的 `package.json` 获取包名
3. 调用 `/changeset-format` skill 了解 changeset 的格式规范，根据规范分析变更类型和 bump 级别
4. 检查 `.changeset/` 目录下是否已存在与本次变更相关的未提交 changeset 文件，以及当前是否处于 prerelease 阶段，判断应该新建、更新还是删除已有的 changeset
5. 根据变更内容生成一个描述性的 kebab-case slug 作为文件名
6. 按照 `/changeset-format` skill 提供的格式创建或更新 changeset 文件

## 注意事项

- 如果无法判断变更类型，询问用户
