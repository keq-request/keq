- 功能修改需要同时调整 `../keq-request.github.io` 中的文档。
- 在根目录执行 `pnpm build` 全量构建，然后运行 `pnpm test` 完成测试。

## Agent skills

### Issue tracker

Issue 记录在 GitHub Issues（`keq-request/keq`），通过 `gh` CLI 操作。详见 `docs/agents/issue-tracker.md`。

### Triage labels

沿用默认五角色标签词表（`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`）。详见 `docs/agents/triage-labels.md`。

### Domain docs

single-context 布局：根目录 `GLOSSARY.md` + `docs/adr/`。详见 `docs/agents/domain.md`。
