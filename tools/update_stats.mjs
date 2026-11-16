// 生成面板实时数据 lib/data/stats.json（供 client.js 浏览器端自动刷新）
// 用法：node tools/update_stats.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(ROOT, 'tools/index_data.json'), 'utf8'));
const JAVA = { A: 'Java 17', B: 'Java 21', C: 'Java 17', D: 'Java 21', E: 'Java 25', F: 'Java 25' };
const GAPS = { A: [], B: ['54'], C: ['22-27'], D: ['13-24'], E: ['9-21'], F: ['全系列待开'] };
const pkg = JSON.parse(readFileSync(join(ROOT, '../_site_cache/plugin_repo/package.json'), 'utf8'));
const series = data.series.map(s => ({
  id: s.id, name: s.name, loader: s.loader || '', mc: s.mc || '', java: JAVA[s.id] || '',
  count: (s.chapters || []).length, gaps: GAPS[s.id] || [],
}));
const stats = {
  version: pkg.version,
  synced: data.synced || '',
  updatedAt: new Date().toISOString(),
  totalArticles: 217,
  siteFound: 217,
  chapters: data.series.reduce((n, s) => n + (s.chapters || []).length, 0),
  standalone: (data.standalones || []).length,
  series,
  site: data.site || 'https://beishanair.github.io/',
};
const out = join(ROOT, '../_site_cache/plugin_repo/lib/data/stats.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(stats, null, 2));
console.log('stats.json 已更新:', out);
