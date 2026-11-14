import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const skip = new Set(["node_modules", "work", "site", ".git"]);

async function markdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const groups = await Promise.all(entries.filter((entry) => !skip.has(entry.name)).map((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? markdown(file) : /\.md$/i.test(entry.name) ? [file] : [];
  }));
  return groups.flat();
}

test("Markdown 文档中的相对链接都指向存在的文件", async () => {
  const files = [
    ...["README.md", "AGENTS.md"].map((name) => path.join(root, name)),
    ...(await Promise.all(["docs", "skills"].map((name) => markdown(path.join(root, name))))).flat(),
  ];
  const broken = [];
  for (const file of files) {
    const text = (await readFile(file, "utf8")).replace(/```[\s\S]*?```/g, "");
    for (const [, raw] of text.matchAll(/\[[^\]]*\]\(\s*<?([^)\s>]+)/g)) {
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(raw)) continue;
      const target = decodeURIComponent(raw.split("#")[0].split("?")[0]);
      if (!target) continue;
      const resolved = target.startsWith("/") ? path.join(root, target) : path.resolve(path.dirname(file), target);
      if (!(await access(resolved).then(() => true, () => false))) broken.push(`${path.relative(root, file)} -> ${raw}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("文档按维护这份路书的结构组织：有维护指南，没有新建旅行的模板与流程", async () => {
  const exists = (file) => access(path.join(root, file)).then(() => true, () => false);
  assert.ok(await exists("docs/maintain.md"));
  for (const gone of ["docs/add-a-trip.md", "templates/trip-brief.md"]) assert.equal(await exists(gone), false, `${gone} 应已移除`);
  const files = ["README.md", "AGENTS.md", "docs/README.md", "docs/maintain.md", "skills/travel-journal/SKILL.md"];
  for (const file of files) {
    const text = await readFile(path.join(root, file), "utf8");
    assert.doesNotMatch(text, /add-a-trip|trip-brief|<仓库名>|<name>/, `${file} 仍引用已移除的新建旅行材料或占位符`);
  }
  assert.match(await readFile(path.join(root, "AGENTS.md"), "utf8"), /docs\/maintain\.md/);
  assert.match(await readFile(path.join(root, "README.md"), "utf8"), /https:\/\/real-jacket\.github\.io\/trip-anhui\//);
});
