根据当前代码变更，更新文档站 `../keq-request.github.io` 中的相关文档。

## 步骤

1. 运行 `git diff main...HEAD --name-only` 和 `git diff HEAD --name-only` 确定变更文件，读取变更的源文件理解具体内容（新增 API、修改签名、行为变化、新增选项等）
2. 如果变更仅涉及内部重构且无公共 API 变化，告知用户无需更新文档并结束
3. 浏览 `../keq-request.github.io/docs/` 目录结构，找到与变更相关的文档页面
4. 读取受影响的文档文件，了解当前文档状态
5. 根据代码变更内容更新文档
6. 检查 `../keq-request.github.io/i18n/en/docusaurus-plugin-content-docs/current/` 下是否存在对应的英文翻译文件，如存在则同步更新

## 版本处理

- `docs/` 是当前开发版本（5.x Next），代码变更应更新此目录
- `versioned_docs/version-v2/` 是 v2 版本快照，仅在修复旧版文档错误时修改
- 正常开发只需更新 `docs/` 下的文件

## 文档格式约定

- 文件格式为 MDX，可使用 `docs/components/` 下的共享组件
- 代码块使用 TypeScript，支持 Shiki 注释：`// [!code ++]`、`// [!code --]`、`// [!code highlight]`
- 提示框：`:::tip`、`:::info`、`:::warning`、`:::caution`、`:::note`
- 参数表格格式：| 参数 | 类型 | 默认值 | 描述 |
- 主语言为中文简体（zh-Hans）
- 新建文件使用数字前缀排序：`<序号>.<kebab-case-name>.mdx`

## 注意事项

- 如果无法确定文档更新范围，向用户确认
- 优先更新中文文档，英文翻译可后续补充
