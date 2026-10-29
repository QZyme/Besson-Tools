// 插件 v2.0.0 全工具冒烟测试（模拟 DSH registry）
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const mod = await import(pathToFileURL(repo + '/dsh-plugin/besson-tools.mjs').href);
const registered = new Map();
const ctx = { tools: { register: (def) => { registered.set(def.name, def); return () => registered.delete(def.name); } } };
mod.apply(ctx);
console.log('registered:', [...registered.keys()].join(', '), '| name:', mod.name);

const call = async (name, args) => {
  const def = registered.get(name);
  if (!def) throw new Error('missing tool ' + name);
  const out = await def.execute(args || {});
  return out.value !== undefined ? out.value : out;
};
let fail = 0;
const check = (cond, label) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + label); if (!cond) fail++; };

const look = await call('besson_tutorial_lookup', { query: '附魔', limit: 3 });
check(look.total >= 1, 'lookup total=' + look.total);
const idx = await call('besson_tutorial_index', {});
check(idx.dataHealth.totalChapters === 202, 'index dataHealth=' + idx.dataHealth.totalChapters);
const ser = await call('besson_tutorial_series', { series: 'D' });
check(ser.meta.id === 'D' && ser.chapters.length === 32, 'series D len=' + ser.chapters.length);
const one = await call('besson_tutorial_series', { series: 'D', chapter: '44' });
check(!!one.chapter && one.chapter.title, 'D#44=' + one.chapter.title);
const ftc = await call('besson_tutorial_fetch', { query: '第一个物品', maxChars: 3000 });
check(ftc.text && ftc.text.length > 100, 'fetch chars=' + (ftc.text || '').length);
const ftb = await call('besson_tutorial_fetch', { url: 'https://example.com/evil', maxChars: 300 });
check(!!ftb.error, 'fetch evil rejected');
const plan = await call('besson_tutorial_plan', { goal: 'NeoForge 进阶 网络包' });
check(plan.route.length >= 2, 'plan steps=' + plan.route.length);
const cmp = await call('besson_tutorial_compare', { a: 'A', b: 'D' });
check(cmp.diffCount >= 5 && cmp.javaSteps === 'Java 17 → Java 21', 'compare javaSteps=' + cmp.javaSteps);
const env = await call('besson_tutorial_env', { mcVersion: '26.1', loader: 'fabric' });
check(env.series === 'E' && env.jdk === '25', 'env series=' + env.series);
const empt = await call('besson_tutorial_lookup', { query: '' });
check(empt.hint === '请输入查询关键词', 'empty query hint=' + JSON.stringify(empt.hint));
process.exitCode = fail ? 1 : 0;
