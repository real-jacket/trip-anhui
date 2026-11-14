# 皖南秋日摄影自驾

武汉出发、电车自驾的四天皖南摄影路书：沿皖南川藏线找方塘红杉、储家滩晨雾和桃岭盘山公路，也可切换到古村线。

在线阅读：<https://real-jacket.github.io/trip-anhui/>

![方塘的一排红杉立在静水与薄雾中，湖岸与倒影构成画面。](site/cover.webp)

封面：9527是只猫 · 方塘摄影参考，[原帖](https://www.xiaohongshu.com/explore/692afba9000000001e028e2a)。

## 状态

这是**候选计划**（`planned`），不是已订或已完成的行程。候选日期为 2026.11.19—11.22（四天三晚，请周四、周五两天假）；住宿都是候选，页面注明未查询具体出行日的房量、最终房价和充电空位。“计划中”表示路书用来比较和准备，出发前仍要复核物候、天气、路况、住处和桩况。

## 这份路书里有什么

- **路线**：默认方案 B 为 武汉 → 泾县 → 月亮湾 → 桃岭 → 板桥 → 方塘 → 储家滩 → 宁国 → 武汉，泾县、方塘、储家滩各住一晚，规划约 1,250 km。
- **方案**：A 古村与醉美218（塔川、卢村、宏村，规划约 1,150 km）；B 川藏线慢拍（默认）；C 古村加川藏线的四天双线（规划约 1,400 km）；另有 B 的三天两晚压缩版。页面也比较了 11.05—08、11.12—15、11.19—22、11.26—29 几个候选窗口。
- **逐日行程**：每个方案按天列出时间、地点、拍摄安排、吃饭休息和当晚住处，可从行程跳到地图和对应机位。
- **地图**：土地覆盖地形底图（区分森林、植被、农田、城镇、水体等，叠山体阴影）、分级道路与行政境界地名、按方案和天切换的真实道路路线、带编号的沿路点位，以及按段的“用高德查看路线”导航清单。
- **机位与成片**：塔川、卢村、协里、宏村、方塘、储家滩、月亮湾、桃岭等机位，配成片、位置说明、拍法建议，以及方塘找点用的停车与步行示意。成片旁标明摄影师、平台、发布日期，拍摄日未标的会写明。
- **其他**：日出日落参考、电车续航与补能计算（按用户输入的实测续航）、逐晚住宿、沿途餐饮、天气与器材、预算（一车两人口径）、攻略来源列表，以及打印。

## 本地查看与检查

要求 Node >= 24 和 pnpm。`package.json` 没有依赖，不需要安装。

```sh
pnpm preview   # http://127.0.0.1:4190/trip-anhui/，支持 Range 请求
pnpm check     # 零依赖测试：清单、相对资源、公开文件安全、地图体积、高德分段、文档链接
```

`pnpm preview` 按 `/<目录名>/` 提供 `site/`，因此本地目录名应保持 `trip-anhui`，才能与线上同一子路径。

## 修改这份路书

- 页面内容在 `site/index.html`（单文件，25 张照片内嵌），首页卡片信息在 `site/trip.json`。
- 地图数据由根目录 `map.json` 描述，用 `pnpm map:build --routes|--extract|--landcover|--validate` 重新生成到 `site/map/`，合计不超过 40 MB（测试强制）。重生成的二进制会留在 Git 历史里，定稿后不要反复重建。
- 流程、规则和发布条件见 [维护这份路书](docs/maintain.md)，其余文档见 [文档索引](docs/README.md)。协作约定在 [AGENTS.md](AGENTS.md)。

## 仓库结构

| 路径 | 内容 |
|---|---|
| `site/` | 发布内容：`index.html`、`trip.json`、`cover.webp`、`map/`（PMTiles 与路线）、`vendor/map/`（地图模块与第三方库） |
| `map.json`、`scripts/` | 地图数据配置，以及地图生成和本地预览脚本 |
| `tests/` | 零依赖检查，`pnpm check` 运行 |
| `docs/` | 维护指南、地图选型、迁移记录 |
| `skills/travel-journal/` | 给 Claude Code / Codex 用的维护技能（`.claude/skills/` 下有指向它的链接） |
| `.github/workflows/pages.yml` | 检查并把 `site/` 发布到 GitHub Pages |

工具链文件最初来自 `real-jacket/trip-template`，仅作来源说明。

## 照片与数据来源

页面里的照片归各自摄影师所有，页内标有摄影师与原帖链接；本仓库不对这些照片重新授权，署名和原帖链接也不构成转载许可。地图数据署名与页面一致：© OpenStreetMap · Protomaps · Mapterhorn · ESA WorldCover（WorldCover 为 CC BY 4.0）；选型与处理细节见 [地图选型](docs/map-selection.md)。`site/vendor/` 内的 MapLibre GL JS 与 PMTiles 保留各自的 LICENSE 文件。本仓库目前没有 LICENSE 文件。

## 被旅行首页收录

[旅行首页](https://real-jacket.github.io/travel-journal/)读取 `site/trip.json` 作为这份路书的卡片清单，格式见[旅行清单规范](https://github.com/real-jacket/travel-journal/blob/main/docs/trip-spec.md)。没有首页，路书也能独立使用。
