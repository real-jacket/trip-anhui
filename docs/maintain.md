# 维护这份路书

本仓库是「皖南秋日摄影自驾」一份路书的源文件，发布为 `https://real-jacket.github.io/trip-anhui/`。以下路径均相对仓库根目录；研究草稿放被 Git 忽略的 `work/`，访客只看到路书内容。

## 执行分工

协调者负责需求与路线、设计决策、计划与任务拆解，以及独立最终验收。协调者同时负责分析与审核；实际执行交给用户指定的 Sonnet 5.5 子代理（high effort），分派时明确目标文件、预期行为与验收证据。执行者提交实际产物和检查结果，不能以自报成功代替协调者验收。发布仍遵守用户当前授权。

## 内容在哪

| 内容 | 位置 |
|---|---|
| 路书页面（单文件，照片以内嵌方式保存） | `site/index.html` |
| 首页卡片清单与封面 | `site/trip.json`、`site/cover.webp` |
| 共用地图模块 | `site/vendor/map/` |
| 地图数据（底图、地形、土地覆盖、路线） | `site/map/`，由 `map.json` 与 `pnpm map:build` 生成 |
| 检查 | `tests/`（零依赖，`pnpm check`） |

Pages 原样发布 `site/`，页面只用相对路径，不引用 `site/` 之外。这是四天候选计划（`planned`），不是已订或已完成的行程；日期过去不等于旅行完成，若改成历史记录用 `archived`。

## 修改页面

- 保留全部照片署名与原帖链接、日期/方案选择、行程切换、机位展开、电车续航计算、打印和已有存储容错（`localStorage` 键 `anhui-autumn-2026-v2`）。
- 保留桌面与手机均可见的“回旅行首页”链接，指向 `https://real-jacket.github.io/travel-journal/`。
- 访客页面不出现框架、地图服务商和部署细节；视觉沿用暖纸色、深绿、秋色点缀和摄影杂志风。
- 更新机位或成片时按 [调研手册](../skills/travel-journal/references/research.md) 查证并落盘，来源链接用规范化形式（不含 `xsec_token`）；公开页只呈现署名、出处与必要的不确定性。原帖链接不是转载授权，第三方图片的授权状态另行核对。
- 日程要给交通、吃饭、睡眠和停拍留时间；住宿、餐饮、补能、价格与开放时间按临近行程重新核对，历史信息与当前可用性分开写。

## 更新 `site/trip.json`

首页读取这份清单；改动后字段仍须满足 [旅行清单规范](https://github.com/real-jacket/travel-journal/blob/main/docs/trip-spec.md)（`tests/trip.test.mjs` 检查必填字段、状态与标签对应、日期以四位年份开头、封面存在且格式与扩展名一致）。日期、状态、路线或封面变化时同步改这里。

## 重做地图数据

编辑根目录 `map.json`（bbox、分层抽取范围、路线途经点；坐标均为 WGS-84），然后：

```sh
pnpm map:build --routes             # OSRM 生成 site/map/routes.geojson（≤1 请求/秒，非商用）
pnpm map:build --extract --dry-run  # 先看底图/地形体积
pnpm map:build --extract            # 生成 base.pmtiles 与 terrain.pmtiles（需要 pmtiles CLI）
pnpm map:build --landcover          # 由 ESA WorldCover 生成 landcover.pmtiles（需要 uv）
pnpm map:build --validate           # 复用旧路线时，只检查回头路
```

低缩放层用大范围、高缩放层只覆盖路线走廊和点位；页面 `maxBounds` 不超出已制作范围。`site/map/` 合计不超过 40 MB（测试强制）；重生成的二进制会永久留在 Git 历史里，定稿后不要反复重建。选型依据见 [地图选型](map-selection.md)。

地图规则：

- 底图是土地覆盖地形图：森林、灌草、农田、城镇、水体/湿地、裸地用不同颜色区分，上面叠浅山体阴影，再叠分级道路（含 G/S 编号）和省/市/县界与地名。土地覆盖只能叠加，不能替换路网和行政层；国界与争议线保持隐藏。页面用 `TripMap.renderLegend` 放中文图例。
- 地图下方保留“用高德查看路线”分段清单：按当前方案/天把相邻点位切成“起点 → 途经 → 终点”段，用 `TripMap.navSegments` 与 `TripMap.amapRoute` 生成高德驾车导航链接（坐标转 GCJ-02）。画出的路线用来看，分段导航用来走，两者都要有；`tests/anhui.test.mjs` 锁定了链接内容。
- 点击地图点位只定位并更新侧栏；技术接口、坐标转换和密钥说明不写进访客页面。

## 检查与验收

```sh
pnpm check
pnpm preview            # http://127.0.0.1:4190/trip-anhui/，支持 Range，与 Pages 同一子路径
```

`check` 覆盖：清单契约、相对资源、公开文件安全、地图数据与体积、高德分段、文档链接。测试通过不是地图或视觉验证。

- 在真实浏览器按 1280px 桌面与 390px 手机检查：标题、图片、控件可读，无横向溢出，无控制台错误，“回旅行首页”可见可点。
- 地图渲染出土地覆盖、分级道路、境界与地名、按天路线和图例；高德分段链接数量与方案/天一致。
- 照片加载、放大/关闭、日期与方案选择、地图缩放与按天路线、点位侧栏等核心交互实际可用。
- 公开文件不含私有地图配置、平台临时签名、`xsec_token`、`/Users/` 或本地服务路径。无证据的事项保留明确边界。

第三方地图与平台链接受网络影响；出发前仍要复核路况、物候、住处和桩况。

## 发布

仅当用户本次明确要求上传或上线时执行，授权范围以本次请求为准。

1. 提交并推送 `main`，Pages 的 Source 为 GitHub Actions，等待对应 commit 的工作流（`.github/workflows/pages.yml`，先跑检查再部署 `site/`）完成。
2. 打开 `https://real-jacket.github.io/trip-anhui/` 与 `.../trip.json`，核对图片、地图（PMTiles Range 请求返回 206）与返回首页链接。

部署成功与网站可用分别确认；报告仓库、网站 URL 和验证边界。本流程不提供空白发布授权。
