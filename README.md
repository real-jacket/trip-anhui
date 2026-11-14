# 皖南秋日摄影自驾

四天候选计划（2026.11.19—22，计划中），不是已订或已完成的行程。发布为独立站点 `https://real-jacket.github.io/trip-anhui/`，在[旅行首页](https://real-jacket.github.io/travel-journal/)收录。

路书为单文件页面（25 张照片内嵌），含 A/B/C 三个方案及 3/4 天变体，默认方案 B4；摄影师署名与原帖链接保持原样。

- `site/`：发布内容（`index.html`、`trip.json`、`cover.webp`、`vendor/map/`、`map/`），Pages 原样发布
- `map.json`、`scripts/`：地图数据制作（`pnpm map:build`）与本地预览（`pnpm preview`）
- `tests/`：零依赖检查（`pnpm check`）
- `docs/`：[文档索引](docs/README.md)，流程见 [制作一份旅行路书](docs/add-a-trip.md)
- `skills/travel-journal/`：给 Claude Code / Codex 用的技能；协作约定见 `AGENTS.md`

本仓库由 `real-jacket/trip-template` 派生，工具链文件（`scripts/`、`site/vendor/`、工作流、通用测试）与模板一致。
