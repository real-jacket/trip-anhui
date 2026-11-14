import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const site = path.join(fileURLToPath(new URL("../", import.meta.url)), "site");
const html = await readFile(path.join(site, "index.html"), "utf8");

test("安徽路书：PMTiles（底图+地形+地表覆盖）总量不超过 40 MB，路线几何覆盖每个方案的每天，且无 Leaflet/GeoQ", async () => {
  assert.ok(!/leaflet|geoq\.cn|MAP_CONTEXT/i.test(html), "不应残留 Leaflet、GeoQ 或内嵌地图上下文");
  let total = 0;
  for (const tile of ["base", "terrain", "landcover"]) total += (await stat(path.join(site, `map/${tile}.pmtiles`))).size;
  assert.ok(total <= 40 * 1024 * 1024, `base+terrain+landcover ${total} 字节超出 40 MB`);
  const ids = new Set(JSON.parse(await readFile(path.join(site, "map/routes.geojson"), "utf8")).features.map((f) => f.properties.id));
  const used = [...html.matchAll(/["']?\broute["']?\s*:\s*["']([\w-]+)["']/g)];
  assert.ok(used.length > 0);
  for (const [, route] of used) assert.ok(ids.has(route), `routes.geojson 缺少 ${route}`);
});

test("安徽路书：分段导航经共享模块生成，与迁移前的高德链接逐字节一致", async () => {
  const code = await readFile(path.join(site, "vendor/map/trip-map.js"), "utf8");
  const sandbox = { URLSearchParams, Number, Math, RangeError, Array, Object, Set, document: {}, location: { href: "http://x/" } };
  sandbox.window = sandbox;
  vm.runInNewContext(code, sandbox);
  const grab = (re) => html.match(re)?.[0];
  const source = [
    grab(/^const GUIDES = .*;$/m), grab(/^const ROAD_DATA = .*;$/m),
    grab(/^function viewRoutes[\s\S]*?\n\}\n/m), grab(/^function navigationSegments[\s\S]*?\n\}\n/m),
  ];
  assert.ok(source.every(Boolean), "应能从安徽页面取出 GUIDES、ROAD_DATA、viewRoutes、navigationSegments");
  const page = vm.runInContext(`${source.join("\n")}\n({ GUIDES, ROAD_DATA, navigationSegments })`, vm.createContext(sandbox));
  const link = (plan, view) => page.navigationSegments(plan, view).map((s) => sandbox.TripMap.amapRoute(s.stops, "anhui-autumn-guide"));

  const all = link("B4", "all"), local = link("B4", "local");
  assert.equal(all.length, 6);
  assert.equal(local.length, 4);
  assert.equal(all[0], "https://uri.amap.com/navigation?from=114.310945%2C30.590391%2C%E6%AD%A6%E6%B1%89&to=118.419616%2C30.688705%2C%E6%B3%BE%E5%8E%BF%E5%8E%BF%E5%9F%8E&mode=car&policy=0&callnative=1&src=anhui-autumn-guide");
  assert.equal(all[5], "https://uri.amap.com/navigation?from=118.889617%2C30.587837%2C%E5%82%A8%E5%AE%B6%E6%BB%A9&to=114.310945%2C30.590391%2C%E6%AD%A6%E6%B1%89&mode=car&policy=0&callnative=1&src=anhui-autumn-guide&via=118.991806%2C30.632943%2C%E5%AE%81%E5%9B%BD%E5%9F%8E%E5%8C%BA");
  assert.equal(local[0], "https://uri.amap.com/navigation?from=118.419616%2C30.688705%2C%E6%B3%BE%E5%8E%BF%E5%8E%BF%E5%9F%8E&to=118.593829%2C30.509912%2C%E6%A1%83%E5%B2%AD%E7%9B%98%E5%B1%B1%E5%85%AC%E8%B7%AF&mode=car&policy=0&callnative=1&src=anhui-autumn-guide&via=118.567923%2C30.687812%2C%E6%9C%88%E4%BA%AE%E6%B9%BE");
  assert.deepEqual(["B4", "A4", "C4", "B3"].map((plan) => `${link(plan, "local").length}/${link(plan, "all").length}`), ["4/6", "5/7", "6/9", "3/6"]);
});

test("安徽路书：照片是 site/photos/ 下的独立文件，index.html 不内嵌大图、不引用缺失或孤儿照片，且小于 500 KB", async () => {
  const big = [...html.matchAll(/data:image\/[^"')\s]+/g)].filter((m) => m[0].length > 2048);
  assert.deepEqual(big.map((m) => m[0].slice(0, 40)), [], "不应内嵌大于 2 KB 的 data:image");
  assert.ok(Buffer.byteLength(html) < 500 * 1024, "index.html 应小于 500 KB");
  const refs = new Set([...html.matchAll(/photos\/[\w.-]+\.(?:jpg|webp)/g)].map((m) => m[0]));
  assert.ok(refs.size > 0, "页面应引用 photos/ 下的照片");
  const files = new Set((await readdir(path.join(site, "photos"))).map((name) => `photos/${name}`));
  assert.deepEqual([...refs].filter((ref) => !files.has(ref)), [], "引用的照片文件缺失");
  assert.deepEqual([...files].filter((file) => !refs.has(file)), [], "photos/ 下有未被引用的文件");
  for (const ref of refs) assert.ok((await stat(path.join(site, ref))).size > 0, `${ref} 为空`);
});
