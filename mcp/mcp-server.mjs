// 北山Besson 教程检索 MCP 服务器（v2.4.6 · 适配 DeepSeek Harness 0.2.2-rc.3）
// 用法：
//   stdio（默认）: node mcp-server.mjs
//   HTTP        : node mcp-server.mjs --http   （环境变量 PORT，默认 3987）
// 数据：默认读取 ../tools/index_data.json（仓库根目录），可用环境变量 BESSON_DATA_PATH 覆盖。
// 11 个工具：lookup / index / series / fetch / plan / compare / env / mod_project / mod_migrate / mod_scaffold / mod_mapping，与 dsh-plugin 能力对齐。
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VERSION = '2.4.6';

// ── 数据加载 ──────────────────────────────────────────────────────────────
function loadData() {
  const candidates = [
    process.env.BESSON_DATA_PATH,
    join(__dirname, '..', 'tools', 'index_data.json'),
    join(__dirname, 'index_data.json'),
  ];
  for (const p of candidates) {
    if (!p) continue;
    try {
      return JSON.parse(readFileSync(resolve(p), 'utf8'));
    } catch (e) { /* 继续尝试下一个 */ }
  }
  throw new Error('找不到教程索引数据：请设置 BESSON_DATA_PATH 或在仓库中保留 tools/index_data.json');
}

const DATA = loadData();
const SITE = DATA.site || 'https://beishanair.github.io/';

const JAVA = { A: 'Java 17', B: 'Java 21', C: 'Java 17', D: 'Java 21', E: 'Java 25', F: 'Java 25' };
const GAPS = { A: [], B: ['54（本站无 #54）'], C: ['22-27（未发布）'], D: ['13-24（未发布）'], E: [], F: ['全系列待开'] };

// 系列画像（compare / env / plan 共用；与 dsh-plugin 版一致）
const SERIES_INFO = {
  A: { mc: '1.20.1', loader: 'Fabric', java: 'Java 17', jdk: '17', build: 'Gradle + fabric-loom', pkg: 'net.fabricmc（Yarn 映射）', modfile: 'fabric.mod.json', entrypoint: 'ModInitializer（main / client 入口点）', registry: 'Registry.register + 静态字段', events: 'fabric-events（回调注册）', datagen: 'FabricDataGenerator' },
  B: { mc: '1.21.X', loader: 'Fabric', java: 'Java 21', jdk: '21', build: 'Gradle + fabric-loom', pkg: 'net.fabricmc（Yarn 映射）', modfile: 'fabric.mod.json', entrypoint: 'ModInitializer（main / client 入口点）', registry: 'Registry.register + 静态字段', events: 'fabric-events（回调注册）', datagen: 'FabricDataGenerator' },
  C: { mc: '1.20.1', loader: 'Forge', java: 'Java 17', jdk: '17', build: 'Gradle + ForgeGradle', pkg: 'net.minecraftforge（官方映射）', modfile: 'META-INF/mods.toml', entrypoint: '@Mod 主类 + IEventBus', registry: 'DeferredRegister + RegisterEvent', events: '@SubscribeEvent（Forge 事件总线）', datagen: 'GatherDataEvent' },
  D: { mc: '1.21.1', loader: 'NeoForge', java: 'Java 21', jdk: '21', build: 'Gradle + NeoGradle / ModDevGradle', pkg: 'net.neoforged（官方映射）', modfile: 'META-INF/neoforge.mods.toml', entrypoint: '@Mod 主类 + IEventBus', registry: 'DeferredRegister（DeferredHolder）', events: '@SubscribeEvent（NeoForge 事件总线）', datagen: 'GatherDataEvent' },
  E: { mc: '26.1', loader: 'Fabric', java: 'Java 25', jdk: '25', build: 'Gradle + fabric-loom', pkg: 'net.fabricmc（Yarn 映射）', modfile: 'fabric.mod.json', entrypoint: 'ModInitializer（新版本 API 收缩期，以 E 系列首章为准）', registry: 'Registry.register + 静态字段', events: 'fabric-events', datagen: 'FabricDataGenerator' },
  F: { mc: '26.1', loader: 'NeoForge', java: 'Java 25', jdk: '25', build: 'Gradle + NeoGradle / ModDevGradle（26.1 适配 2026-03）', pkg: 'net.neoforged（官方映射）', modfile: 'META-INF/neoforge.mods.toml', entrypoint: '@Mod 主类 + IEventBus', registry: 'DeferredRegister（DeferredHolder）', events: '@SubscribeEvent（NeoForge 事件总线）', datagen: 'GatherDataEvent' },
};

const TEMPLATES = {
  A: 'https://github.com/BeiShanair/TutorialMod-1.20.1',
  B: 'https://github.com/BeiShanair/TutorialMod-1.20.1',
  C: 'https://github.com/BeiShanair/TutorialMod-1.20.1',
  D: 'https://github.com/BeiShanair/Tutorial-Mod-1.21.1-NeoForge',
  E: 'https://github.com/BeiShanair/Tutorial-Mod-26.1-Fab',
  F: 'https://github.com/BeiShanair/Tutorial-Mod-26.1-Neo',
};

// ── 检索逻辑（与 dsh-plugin/besson-tools.mjs 一致）────────────────────────
function buildSearchIndex() {
  const items = [];
  for (const s of DATA.series) {
    for (const c of s.chapters || []) {
      items.push({
        kind: 'chapter', series: s.id, seriesName: s.name, loader: s.loader || '',
        mc: s.mc || '', java: JAVA[s.id] || '', chapter: c.n, title: c.title, url: c.url,
        haystack: [s.id, s.name, s.loader, s.mc, c.n, c.title].join(' ').toLowerCase(),
      });
    }
  }
  for (const a of DATA.standalones) {
    items.push({
      kind: 'article', series: '', seriesName: '其他独立文章', loader: '', mc: '', java: '',
      chapter: '', title: a.title, url: a.url,
      haystack: [a.title].join(' ').toLowerCase(),
    });
  }
  return items;
}
const INDEX = buildSearchIndex();

function clampInt(value, min, max, fallback) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function tokenize(q) {
  return q.toLowerCase()
    .replace(/[、，。；：·&+（）()"'\-—_|/\\]/g, ' ')
    .split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
}

function search(query, limit, opts = {}) {
  const tokens = tokenize(String(query || ''));
  const lim = clampInt(limit, 1, 25, 8);
  if (tokens.length === 0) return { matched: [], total: 0, titleTotal: 0, metaTotal: 0, hint: '请输入查询关键词' };
  const o = opts && typeof opts === 'object' ? opts : {};
  const wantSeries = /^[a-f]$/i.test(String(o.series || '').trim()) ? String(o.series).trim().toUpperCase() : '';
  const wantLoader = String(o.loader || '').trim().toLowerCase();
  const wantMc = String(o.mcVersion || o.mc || '').trim().toLowerCase();
  const phraseQ = tokens.join(' ');
  const scored = [];
  for (const it of INDEX) {
    if (wantSeries && it.series !== wantSeries) continue;
    if (wantLoader && String(it.loader || '').toLowerCase() !== wantLoader) continue;
    if (wantMc && !String(it.mc || '').toLowerCase().startsWith(wantMc)) continue;
    const title = it.title.toLowerCase();
    const meta = [it.series, it.seriesName, it.loader, it.mc, String(it.chapter)].join(' ').toLowerCase();
    let hits = 0;
    let titleHits = 0;
    let weight = 0;
    for (const tok of tokens) {
      const inTitle = title.includes(tok);
      const inMeta = meta.includes(tok);
      if (!inTitle && !inMeta) continue;
      hits += 1;
      if (inTitle) {
        titleHits += 1;
        weight += 10;
      } else {
        weight += 2;
      }
      if (/^[a-f]$/.test(tok) && it.series.toLowerCase() === tok) weight += 6;
      if (String(it.chapter) === tok) weight += 14;
      else if (/^\d+$/.test(tok) && String(it.chapter).startsWith(tok)) weight += 6;
      if (/^(neoforge|forge|fabric)$/.test(tok) && String(it.loader).toLowerCase() === tok) weight += 8;
      if (/^\d+(\.\d+){1,2}$/.test(tok) && String(it.mc).toLowerCase() === tok) weight += 8;
      if (wantSeries && it.series === wantSeries) weight += 25;
    }
    if (hits === 0) continue;
    if (title.includes(phraseQ)) weight += 40;
    scored.push({ item: it, hits, titleHits, weight });
  }
  scored.sort((a, b) => (b.titleHits - a.titleHits) || (b.hits - a.hits) || (b.weight - a.weight));
  const matched = scored.slice(0, lim).map(({ item }) => ({
    kind: item.kind,
    series: item.series,
    seriesName: item.seriesName,
    loader: item.loader,
    mc: item.mc,
    java: item.java,
    chapter: item.chapter,
    title: item.title,
    url: item.url,
  }));
  const titleTotal = scored.filter((x) => x.titleHits > 0).length;
  const filters = { series: wantSeries || '', loader: wantLoader || '', mcVersion: wantMc || '' };
  return { matched, total: scored.length, titleTotal, metaTotal: scored.length - titleTotal, filters };
}

function seriesMeta(id) {
  const s = DATA.series.find((x) => x.id === id);
  if (!s) return null;
  return {
    id: s.id, name: s.name, loader: s.loader || '', mc: s.mc || '', java: JAVA[id] || '',
    tag: s.tag || '',
    status: (s.chapters || []).length > 0 ? (id === 'B' ? '完整' : '进行中') : '待开',
    gaps: GAPS[id] || [], chapters: (s.chapters || []).length,
  };
}

function dateOf(url) {
  const m = String(url).match(/\/20(\d\d)\/(\d\d)\/(\d\d)\//);
  return m ? `20${m[1]}/${m[2]}/${m[3]}` : '';
}

function chapterUrl(id, n) {
  const s = DATA.series.find((x) => x.id === id);
  if (!s) return null;
  const c = (s.chapters || []).find((x) => String(x.n) === String(n));
  return c ? { chapter: c.n, title: c.title, url: c.url } : null;
}

function resolveSeries(key) {
  const k = String(key == null ? '' : key).trim().toLowerCase();
  if (!k) return null;
  let s = DATA.series.find((x) => x.id.toLowerCase() === k);
  if (s) return s;
  return DATA.series.find((x) => [x.id, x.name, x.loader, x.mc].join(' ').toLowerCase().includes(k)) || null;
}

function chapterMatches(id, keyword, limit) {
  const s = DATA.series.find((x) => x.id === id);
  if (!s) return [];
  return (s.chapters || [])
    .filter((c) => c.title.toLowerCase().includes(String(keyword).toLowerCase()))
    .slice(0, limit)
    .map((c) => ({ series: id, chapter: c.n, title: c.title, url: c.url }));
}

function planGoal(goal, level, opts = {}) {
  const g = String(goal || '').trim().toLowerCase();
  const o = opts && typeof opts === 'object' ? opts : {};
  const optSeries = String(o.series || '').trim().toUpperCase();
  let prefer = /^[A-F]$/.test(optSeries) ? optSeries : '';
  if (!prefer && o.path) {
    try {
      const pj = scanProject(String(o.path));
      if (pj && pj.matchedSeries && pj.matchedSeries.id) prefer = pj.matchedSeries.id;
    } catch (e) { /* 忽略体检失败，退回默认选系列 */ }
  }
  if (!prefer) {
    const ld = String(o.loader || '').trim().toLowerCase();
    const mc = String(o.mcVersion || o.mc || '').trim().toLowerCase();
    if (ld || mc) {
      const hit = DATA.series.find((x) => (!ld || String(x.loader || '').toLowerCase() === ld) && (!mc || String(x.mc || '').toLowerCase().startsWith(mc)));
      if (hit) prefer = hit.id;
    }
  }

  const wantsLoader = /neoforge/.test(g) ? 'NeoForge' : /forge/.test(g) ? 'Forge' : /fabric/.test(g) ? 'Fabric' : '';
  const wantsLatest = /26\.1|最新|新版本|前沿|新api/.test(g);
  const wantsAdvanced = /进阶|高级|网络|渲染|粒子|配方|rei|精炼|罐装|工具|附魔|结构|生物群系|维度|gui|声音|mixin|数据|事件/.test(g);
  const wantsMigrate = /迁移|升级|转版本|移植|对比/.test(g);

  const topicTokens = tokenize(String(goal || '')).filter((t) => !/^(a|b|c|d|e|f|neoforge|forge|fabric|进阶|高级|入门|基础|新手|学习|教程|方式|\d+(\.\d+){1,3})$/.test(t));
  const seriesIds = ['A', 'B', 'C', 'D', 'E', 'F'];
  const topicScore = (id) => {
    let n = 0;
    for (const t of topicTokens) {
      n += chapterMatches(id, t, 3).length;
      if (t.length >= 2) n += chapterMatches(id, t.slice(0, 2), 1).length;
    }
    return n;
  };

  const pick = [];
  if (prefer) {
    pick.push(prefer);
  } else if (wantsMigrate) {
    pick.push('A', 'D');
  } else if (wantsLatest) {
    pick.push(wantsLoader === 'NeoForge' ? 'F' : 'E');
  } else if (wantsLoader === 'NeoForge') {
    pick.push('D');
  } else if (wantsLoader === 'Forge') {
    pick.push('C');
  } else if (wantsLoader === 'Fabric') {
    pick.push('A');
  } else {
    const scoredSeries = seriesIds
      .map((id) => ({ id, n: topicScore(id) }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);
    if (scoredSeries.length > 0) pick.push(scoredSeries[0].id);
    if (scoredSeries.length > 1) pick.push(scoredSeries[1].id);
    if (pick.length === 0) pick.push('A', 'B');
    else if (pick.length === 1 && /进阶|高级|网络|渲染|粒子|配方/.test(g)) pick.push('C', 'D');
  }

  const steps = [];
  for (const id of pick) {
    const info = SERIES_INFO[id] || {};
    steps.push({
      order: steps.length + 1,
      series: id,
      seriesName: (seriesMeta(id) || {}).name || id,
      loader: info.loader,
      mc: info.mc,
      java: info.java,
      role: '主线',
      note: prefer ? ('按工程识别系列 ' + id + ' 推进；调用时传 path/series/loader/mcVersion 可随时切换优先系列') : '按目标语义命中的系列推进；传 path（工程目录）或 loader/mcVersion 可按工程版本优先',
    });
    const topicSeen = new Set();
    const addTopic = (c, role) => {
      const key = id + '#' + c.chapter;
      if (topicSeen.has(key) || topicSeen.size >= 6) return;
      topicSeen.add(key);
      steps.push({ order: steps.length + 1, series: id, chapter: c.chapter, title: c.title, url: c.url, role: role || '专题' });
    };
    for (const t of topicTokens) {
      for (const c of chapterMatches(id, t, 2)) addTopic(c);
      if (t.length >= 2) for (const c of chapterMatches(id, t.slice(0, 2), 2)) addTopic(c);
    }
    if (topicSeen.size === 0 && !prefer) {
      for (const c of chapterMatches(id, '第一个', 1)) addTopic(c, '起步');
    }
  }

  if (prefer) {
    const extSeen = new Set();
    for (const t of topicTokens) {
      for (const id2 of seriesIds) {
        if (id2 === prefer || extSeen.size >= 3) continue;
        for (const c of chapterMatches(id2, t, 2)) {
          const key = id2 + '#' + c.chapter;
          if (extSeen.has(key)) continue;
          extSeen.add(key);
          steps.push({ order: steps.length + 1, series: id2, chapter: c.chapter, title: c.title, url: c.url, role: '扩展' });
        }
      }
    }
  }
  void level;
  return steps;
}

function text(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

// ── 正文抓取与提取（besson_tutorial_fetch 使用）───────────────────────────
function htmlToText(html) {
  const container = html.match(/<article[\s>][\s\S]*?<\/article>/i)
    || html.match(/<main[\s>][\s\S]*?<\/main>/i)
    || html.match(/<div[^>]*class="[^"]*(?:post-content|entry-content|page-content)[^"]*"[\s>][\s\S]*?<\/div>/i);
  const frag = container ? container[0] : html;
  return frag
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<td[^>]*class="[^"]*(?:gutter|rouge-gutter)[^"]*"[^>]*>[\s\S]*?<\/td>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(?:h[1-6])[^>]*>/gi, '\n\n## ')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<pre[^>]*>/gi, '\n\n```\n')
    .replace(/<\/pre>/gi, '\n```\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&#x2F;/g, '/')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const SITE_URL_RE = /^https:\/\/beishanair\.github\.io(\/|$)/;
function isSiteUrl(value) {
  return SITE_URL_RE.test(String(value == null ? '' : value));
}

async function fetchArticle(url) {
  const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
  if (!isSiteUrl(r.url)) return { error: `跳转到了站外，已拒绝：${r.url}` };
  if (!r.ok) return { error: `HTTP ${r.status}` };
  const html = await r.text();
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1]?.trim() || '';
  return { title, text: htmlToText(html), bytes: html.length };
}

// ── MCP 服务 ──────────────────────────────────────────────────────────────
const server = new McpServer({
  name: 'besson-tutorials-mcp',
  version: VERSION,
});

server.registerTool('besson_tutorial_lookup', {
  title: '检索北山Besson 教程章节',
  description: '在 BeiShan_Besson（北山Besson）的 Minecraft 模组开发教程站（' + SITE + '）中检索教程章节。' +
    '站内系列：A=Fabric 1.20.1（Java 17）、B=Fabric 1.21.X（Java 21）、C=Forge 1.20.1（Java 17）、D=NeoForge 1.21.1（Java 21）、E=Fabric 26.1（Java 25）、F=NeoForge 26.1（待开）。' +
    '输入关键词（例如："NeoForge 生物群系"、"Fabric 1.20.1 流体"、"附魔"、"粒子"、"D 44"），返回匹配章节的标题与链接，并可用 limit 控制返回条数。',
  inputSchema: {
    query: z.string().describe('检索关键词，可组合使用：系列字母（A-F）、Loader、MC 版本、章节号、主题词'),
    series: z.string().optional().describe('可选：限定/优先系列 A-F（如工程是 NeoForge 1.21.1 就传 D）'),
    loader: z.string().optional().describe('可选：fabric / forge / neoforge'),
    mcVersion: z.string().optional().describe('可选：1.20.1 / 1.21.1 / 26.1'),
    limit: z.number().int().min(1).max(25).optional().describe('最多返回的匹配条数（1-25，默认 8）'),
  },
}, async ({ query, series, loader, mcVersion, limit }) => {
  const r = search(query, limit, { series, loader, mcVersion });
  const lines = [`「${query}」在 北山Besson 教程站 中共命中 ${r.total} 条，展示前 ${r.matched.length} 条：`];
  if (r.hint) lines.push(r.hint);
  if (r.matched.length === 0 && !r.hint) lines.push('未命中任何章节，建议换关键词，或调用 besson_tutorial_index 查看系列总览');
  for (const m of r.matched) {
    const label = m.series ? `[${m.series} ${m.seriesName} #${m.chapter} / ${m.java}]` : '[独立文章]';
    lines.push(`${label} ${m.title} — ${m.url}`);
  }
  return text({ query: String(query), total: r.total, matched: r.matched, indexed: INDEX.length, hint: r.hint || '', note: lines.join('\n') });
});

server.registerTool('besson_tutorial_index', {
  title: '北山Besson 教程系列总览',
  description: '查看教程站六大系列总览：MC 版本、Java、章节数量、状态与缺号，独立文章、教程总汇页、生态现状（当前 MC 26.2、Fabric Loader 0.19.3）与工具清单。不需要参数，直接调用。',
  inputSchema: {},
}, async () => text({
  site: DATA.site, author: DATA.author, synced: DATA.synced, version: VERSION, totalArticlesOnSite: 217,
  series: DATA.series.map((s) => seriesMeta(s.id)),
  standalones: DATA.standalones,
  dataHealth: {
    totalChapters: DATA.series.reduce((n, s) => n + (s.chapters || []).length, 0),
    standalones: (DATA.standalones || []).length,
    sampleTitle: (DATA.series[0] && DATA.series[0].chapters && DATA.series[0].chapters[0] && DATA.series[0].chapters[0].title) || '',
  },
  tutorialIndexPage: SITE + '2099/12/31/sum/',
  javaMatrix: Object.entries(SERIES_INFO).map(([id, info]) => ({ series: id, mc: info.mc, loader: info.loader, java: info.java, jdk: info.jdk })),
  ecosystem: {
    currentMinecraft: '26.2（正式版；26.1.1/26.1.2 已发布，26.3 快照开发中）',
    fabricLoader: '0.19.3',
    neoforge261: '官方已适配（2026-03）但教程站 F 系列待开',
    note: '教程总汇页（sum）部分章节列表滞后，以实际文章为准',
  },
  tools: {
    besson_tutorial_lookup: '关键词检索章节（先搜再做）',
    besson_tutorial_index: '系列/版本/数据健康总览（本工具）',
    besson_tutorial_series: '列某系列全部章节，或取单章详情',
    besson_tutorial_fetch: '抓取一篇文章正文（url 或 query 自动解析）',
    besson_tutorial_plan: '按目标生成学习路线（新手/进阶/迁移/26.1 前沿）',
    besson_tutorial_compare: '两个系列/版本的 API 与工程差异对比',
    besson_tutorial_env: '某 MC 版本 + Loader 的环境搭建清单与命令',
    besson_mod_project: '检查本地模组工程：加载器/版本/清单/主类/常见问题',
    besson_mod_migrate: '跨系列迁移清单：映射/构建插件/注册/事件/清单文件',
    besson_mod_scaffold: '生成工程骨架（gradle/主类/清单）',
    besson_mod_mapping: '中文 ↔ 官方映射名对照',
  },
}));

server.registerTool('besson_tutorial_series', {
  title: '北山Besson 单系列全部章节',
  description: '列出教程站某个系列（A-F）的全部章节（章节号、标题、日期、链接）与系列元信息（Loader、MC 版本、Java、状态、缺号）。可选 chapter 只取某一章。',
  inputSchema: {
    series: z.string().describe('系列标识：字母 A-F，或名称关键词（fabric 1.20.1 / fabric 1.21 / forge / neoforge / 26.1）'),
    chapter: z.string().optional().describe('可选：只返回该章节号（如 "44"、"2-1"）'),
  },
}, async ({ series, chapter }) => {
  const s = resolveSeries(series);
  if (!s) {
    return text({ error: `未找到系列「${series}」。可用：A=Fabric 1.20.1, B=Fabric 1.21.X, C=Forge 1.20.1, D=NeoForge 1.21.1, E=Fabric 26.1, F=NeoForge 26.1` });
  }
  const meta = seriesMeta(s.id);
  if (chapter != null && String(chapter).trim() !== '') {
    const c = chapterUrl(s.id, String(chapter).trim());
    if (!c) return text({ error: `系列 ${s.id} 中没有章节「${chapter}」`, meta });
    return text({ meta, chapter: { ...c, date: dateOf(c.url) } });
  }
  return text({
    meta,
    chapters: (s.chapters || []).map((c) => ({ chapter: c.n, date: dateOf(c.url), title: c.title, url: c.url })),
  });
});

server.registerTool('besson_tutorial_fetch', {
  title: '抓取北山Besson 教程正文',
  description: '抓取教程站一篇文章的正文。直接传 url（来自 lookup/series/index 返回的链接）即可抓取；' +
    '或只传 query，将按本地索引自动解析最匹配的一篇再抓取。返回标题与正文纯文本（含代码块、图片为引用链接）。' +
    '正文可能较长，可用 maxChars 控制返回长度；仅接受 beishanair.github.io 站内 https 链接。',
  inputSchema: {
    url: z.string().optional().describe('教程文章 URL（仅限 beishanair.github.io 站内 https 链接）'),
    query: z.string().optional().describe('检索关键词，未提供 url 时用于自动解析最匹配的一篇'),
    maxChars: z.number().int().min(200).max(30000).optional().describe('正文最长返回字符数（默认 6000）'),
  },
}, async ({ url: urlArg, query, maxChars }) => {
  const cap = Math.max(200, Math.min(30000, Number.isFinite(maxChars) ? Math.floor(maxChars) : 6000));
  let target = String(urlArg || '').trim();
  let resolved = null;
  if (!target) {
    const q = String(query || '').trim();
    if (!q) return text({ error: '至少要提供 url 或 query 之一' });
    const r = search(q, 1);
    if (!r.matched.length) return text({ error: `未按「${q}」解析到教程，请先调用 besson_tutorial_lookup` });
    resolved = r.matched[0];
    target = resolved.url;
  }
  if (!isSiteUrl(target)) {
    return text({ error: '仅支持本站（beishanair.github.io）的 https 教程链接', url: target });
  }
  try {
    const art = await fetchArticle(target);
    if (art.error) return text({ error: art.error, url: target });
    return text({
      url: target,
      ...(resolved ? { resolvedFrom: `「${query}」→ [${resolved.series} ${resolved.seriesName} #${resolved.chapter}] ${resolved.title}` } : {}),
      title: art.title,
      bytes: art.bytes,
      chars: art.text.length,
      text: art.text.slice(0, cap),
      truncated: art.text.length > cap,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    return text({ error: '抓取失败: ' + ((e && e.message) || e), url: target });
  }
});

server.registerTool('besson_tutorial_plan', {
  title: '生成北山Besson 学习路线',
  description: '按目标生成学习路线：系列选择、关键章节顺序（含链接）与环境提示。goal 支持：新手/入门/基础、进阶/高级/网络/渲染/粒子/配方/REI、neoforge、forge、fabric、迁移/升级、26.1/最新/前沿。',
  inputSchema: {
    goal: z.string().describe('学习目标，例如 "Fabric 入门做第一个模组"、"NeoForge 进阶 网络包"、"迁移到 26.1"'),
    level: z.string().optional().describe('可选：beginner / intermediate / advanced'),
    path: z.string().optional().describe('可选：模组工程目录，传了自动体检并按工程系列排路线'),
    series: z.string().optional().describe('可选：优先系列 A-F'),
    loader: z.string().optional().describe('可选：fabric / forge / neoforge'),
    mcVersion: z.string().optional().describe('可选：1.20.1 / 1.21.1 / 26.1'),
  },
}, async ({ goal, level, path, series, loader, mcVersion }) => {
  const steps = planGoal(goal, level, { path, series, loader, mcVersion });
  const picks = [...new Set(steps.map((s) => s.series).filter(Boolean))];
  return text({
    goal, level: level || 'auto', route: steps,
    env: picks.slice(0, 1).map((id) => ({ series: id, mc: (SERIES_INFO[id] || {}).mc, loader: (SERIES_INFO[id] || {}).loader, java: (SERIES_INFO[id] || {}).java })),
    next: ['besson_tutorial_env：环境搭建步骤', 'besson_tutorial_series：确认系列章节', 'besson_tutorial_fetch：抓取第一章正文'],
    note: '站点章节列表以实际文章为准；F 系列（NeoForge 26.1）尚未开更',
  });
});

server.registerTool('besson_tutorial_compare', {
  title: '对比两个系列/版本的工程差异',
  description: '对比两个系列（或 MC 版本 / Loader）的工程与 API 差异：Java 版本、构建插件、包名映射、mod 清单文件、入口点、注册方式、事件系统、数据生成，并给出迁移章节链接。',
  inputSchema: {
    a: z.string().describe('基准：系列字母或关键词（如 A、1.20.1、forge、fabric）'),
    b: z.string().describe('对照：系列字母或关键词（如 D、1.21.1、neoforge）'),
  },
}, async ({ a, b }) => {
  const sa = resolveSeries(a);
  const sb = resolveSeries(b);
  if (!sa || !sb) {
    return text({ error: `无法解析：a=${a}, b=${b}。可用系列 A-F 或 1.20.1 / 1.21.1 / 26.1 / fabric / forge / neoforge` });
  }
  const ia = SERIES_INFO[sa.id] || {};
  const ib = SERIES_INFO[sb.id] || {};
  const keys = ['mc', 'loader', 'java', 'jdk', 'build', 'pkg', 'modfile', 'entrypoint', 'registry', 'events', 'datagen'];
  const rows = keys.map((k) => ({ aspect: k, [sa.id]: ia[k] || '', [sb.id]: ib[k] || '', same: (ia[k] || '') === (ib[k] || '') }));
  const refs = [sa.id, sb.id].flatMap((id) => {
    const s = DATA.series.find((x) => x.id === id);
    return (s && s.chapters || [])
      .filter((c) => /环境|搭建|迁移|第一个|配置/.test(c.title))
      .slice(0, 3)
      .map((c) => ({ series: id, chapter: c.n, title: c.title, url: c.url }));
  });
  return text({
    a: { series: sa.id, name: sa.name, mc: ia.mc, loader: ia.loader },
    b: { series: sb.id, name: sb.name, mc: ib.mc, loader: ib.loader },
    rows, diffCount: rows.filter((r) => !r.same).length, javaSteps: `${ia.java} → ${ib.java}`,
    refs, templates: { [sa.id]: TEMPLATES[sa.id], [sb.id]: TEMPLATES[sb.id] },
    note: 'F 系列（NeoForge 26.1）未开更，26.1 只参照 E（Fabric 26.1）',
  });
});

server.registerTool('besson_tutorial_env', {
  title: '生成某系列环境搭建清单',
  description: '生成某系列（按 MC 版本 + Loader 匹配）的模组开发环境搭建清单：JDK 版本与下载、Gradle 工程、模板仓库、启动命令、mod 清单文件、首章链接与常见坑。',
  inputSchema: {
    mcVersion: z.string().optional().describe('MC 版本：1.20.1 / 1.21.1 / 26.1（可省略，由 loader 推断）'),
    loader: z.string().optional().describe('fabric / forge / neoforge / auto（默认 auto）'),
  },
}, async ({ mcVersion, loader }) => {
  const mc = String(mcVersion || '').trim();
  const ld = String(loader || 'auto').trim().toLowerCase();
  let id = null;
  if (mc) {
    const wantLd = ld === 'auto' ? '' : ld;
    const cands = DATA.series.filter((s) => String(s.mc || '').toLowerCase().startsWith(mc.toLowerCase()));
    const hit = cands.find((s) => !wantLd || String(s.loader || '').toLowerCase() === wantLd) || cands[0];
    if (hit) id = hit.id;
  }
  if (!id && ld !== 'auto') {
    const hit = DATA.series.find((s) => String(s.loader || '').toLowerCase() === ld);
    if (hit) id = hit.id;
  }
  if (!id) id = ld === 'neoforge' ? 'D' : ld === 'forge' ? 'C' : 'A';
  const info = SERIES_INFO[id] || {};
  const jdkUrl = `https://adoptium.net/temurin/releases/?version=${info.jdk || '21'}`;
  const first = chapterUrl(id, '1');
  return text({
    series: id, seriesName: (seriesMeta(id) || {}).name || id,
    mc: info.mc, loader: info.loader, java: info.java, jdk: info.jdk,
    steps: [
      `1. 安装 JDK ${info.jdk}（Temurin：${jdkUrl}），并设置 JAVA_HOME`,
      `2. 克隆模板仓库：${TEMPLATES[id] || '见 GitHub BeiShanair'}（或手工新建 Gradle 工程）`,
      `3. IDE 打开后等待 Gradle 同步（${info.build || ''}）`,
      `4. 目录约定：mod 清单 ${info.modfile || ''}，主类入口 ${info.entrypoint || ''}`,
      `5. 首次运行：./gradlew runClient（Windows：gradlew.bat runClient）`,
      `6. 按系列章节推进，从「${(first && first.title) || '第一章'}」开始：${(first && first.url) || ''}`,
    ],
    artifacts: { modfile: info.modfile, entrypoint: info.entrypoint, registry: info.registry, events: info.events, datagen: info.datagen },
    pitfalls: [
      'JAVA_HOME 指向了别的 JDK 版本 → gradle 构建报 class 版本不匹配',
      'gradle 首次下载依赖慢 → 配置镜像或耐心等待（不要中断）',
      'mods.toml / neoforge.mods.toml / fabric.mod.json 的 loader 字段写错 → 游戏不加载模组',
      '改完注册代码没重启客户端 → 看不到新内容（注册发生在启动期）',
    ],
    next: ['besson_tutorial_series：列出该系列全部章节', 'besson_tutorial_fetch：抓取第一章正文动手'],
  });
});


// ── 模组工程体检与迁移（v2.3.0 新增，Node 侧可读本地文件）────────────────
function scanProject(pathArg) {
  const base = pathArg ? resolve(String(pathArg)) : resolve('.');
  if (!existsSync(base)) return { error: '目录不存在：' + base };
  const issues = [];
  const info = { path: base };
  const gradleProps = {};
  const propsFile = join(base, 'gradle.properties');
  if (existsSync(propsFile)) {
    const text = readFileSync(propsFile, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const mm = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
      if (mm && !mm[1].startsWith('#')) gradleProps[mm[1]] = mm[2].trim();
    }
    info.gradleProperties = Object.fromEntries(
      Object.entries(gradleProps).filter(([k]) => /version|loader|mapping|moddev|toolchain|java/i.test(k)),
    );
  }
  let buildText = '';
  for (const name of ['build.gradle.kts', 'build.gradle']) {
    const f = join(base, name);
    if (existsSync(f)) { buildText = readFileSync(f, 'utf8'); info.buildFile = name; break; }
  }
  if (!buildText) issues.push('未找到 build.gradle / build.gradle.kts —— 可能不是 Gradle 工程');
  else {
    const plugins = [];
    if (/net\.neoforged\.moddev|net\.neoforged\.gradle\.userdev|neoforge/i.test(buildText)) plugins.push('neoforge');
    if (/fabric-loom|fabric-loader/i.test(buildText) || typeof gradleProps.fabric_loader_version === 'string') plugins.push('fabric');
    if (/net\.minecraftforge\.gradle|forgegradle/i.test(buildText)) plugins.push('forge');
    if (plugins.length === 0) issues.push('无法从构建文件识别加载器插件（fabric-loom / ForgeGradle / NeoGradle / ModDevGradle）');
    info.buildPlugins = plugins;
    const javaMatch = buildText.match(/JavaLanguageVersion\.of\((\d+)\)|languageVersion\s*=\s*[^\d]*(\d+)|JavaVersion\.VERSION_(\d+)/);
    if (javaMatch) info.javaToolchain = 'Java ' + (javaMatch[1] || javaMatch[2] || javaMatch[3]);
  }
  let mc = gradleProps.minecraft_version || gradleProps.fabric_minecraft_version || '';
  if (!mc && gradleProps.neoforge_version) {
    const nm = String(gradleProps.neoforge_version).match(/^(\d+)\.(\d+)\./);
    if (nm) mc = '1.' + nm[1] + '.' + nm[2];
  }
  if (!mc) {
    const bm = buildText.match(/minecraft_version\s*=\s*['\"]([^'\"]+)['\"]/);
    if (bm) mc = bm[1];
  }
  info.minecraft = mc || '';
  const modfiles = [];
  const normPath = (p) => String(p).replace(/\\/g, '/');
  const expandProp = (v) => {
    const vm = String(v).match(/^\$\{([A-Za-z0-9_.-]+)\}$/);
    return vm && gradleProps[vm[1]] != null ? String(gradleProps[vm[1]]) : String(v);
  };
  for (const [sub, rel, loader] of [
    ['resources', 'META-INF/neoforge.mods.toml', 'neoforge'],
    ['resources', 'META-INF/mods.toml', 'forge'],
    ['resources', 'fabric.mod.json', 'fabric'],
    ['templates', 'META-INF/neoforge.mods.toml', 'neoforge'],
    ['templates', 'META-INF/mods.toml', 'forge'],
    ['templates', 'fabric.mod.json', 'fabric'],
  ]) {
    const file = join(base, 'src', 'main', sub, ...rel.split('/'));
    if (!existsSync(file)) continue;
    modfiles.push(file);
    const text = readFileSync(file, 'utf8');
    if (!info.modfile) info.modfile = { file: rel, loader, template: sub === 'templates' };
    if (info.modId == null) {
      const idMatch = text.match(/modId\s*=\s*"([^"]+)"/) || text.match(/"id"\s*:\s*"([^"]+)"/);
      if (idMatch) info.modId = expandProp(idMatch[1]);
    }
  }
  info.modfiles = modfiles.map((f) => normPath(f).split(normPath(base) + '/').join(''));
  if (modfiles.length === 0) issues.push('未找到 mod 清单：src/main/resources 或 src/main/templates 下没有 fabric.mod.json / META-INF/mods.toml / META-INF/neoforge.mods.toml');
  const javaFiles = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.java$/.test(name)) javaFiles.push(p);
    }
  };
  walk(join(base, 'src', 'main', 'java'));
  info.javaFileCount = javaFiles.length;
  const entries = [];
  for (const p of javaFiles) {
    const text = readFileSync(p, 'utf8');
    const clsMatch = text.match(/\bclass\s+([A-Za-z_$][\w$]*)/);
    if (!clsMatch) continue;
    const hasMod = /@Mod\s*\(/.test(text);
    const hasInit = /ModInitializer/.test(text);
    if (!hasMod && !hasInit) continue;
    const cls = clsMatch[1];
    const rel = p.replace(/^.*src[\\/]main[\\/]java[\\/]/, '').replace(/\.java$/, '').replace(/[\\/]/g, '.');
    const isClient = /Client(Mod|Initializer)|Dist\.CLIENT|\.client\./i.test(text) || /Client$/.test(cls);
    entries.push({ class: rel, kind: hasMod ? 'mod' : 'initializer', role: isClient ? 'client' : 'main', file: rel });
  }
  if (entries.length > 0) {
    const mains = entries.filter((e) => e.role !== 'client');
    info.mainClass = (mains[0] || entries[0]).class;
    info.mainClasses = entries;
    if (entries.length > 1) info.mainClassNote = '检测到多个入口类：' + entries.map((e) => e.class + '(' + e.role + ')').join(', ');
  } else if (javaFiles.length) {
    issues.push('src/main/java 中未找到 @Mod 注解或 ModInitializer 入口类');
  }
  let matched = null;
  if (info.minecraft && (info.buildPlugins || []).length) {
    const loader = info.buildPlugins[0];
    const candidates = DATA.series.filter((s) => String(s.mc || '').toLowerCase().replace(/\.x$/, '') === String(info.minecraft).toLowerCase().replace(/\.x$/, '') || String(info.minecraft).startsWith('1.21'));
    matched = candidates.find((s) => String(s.loader || '').toLowerCase() === loader) || candidates[0] || null;
  }
  if (matched) {
    info.matchedSeries = { id: matched.id, name: matched.name, mc: matched.mc, loader: matched.loader, java: JAVA[matched.id] };
    const expectJava = String(SERIES_INFO[matched.id].jdk || '');
    const actualJava = (info.javaToolchain || '').match(/(\d+)/);
    if (expectJava && actualJava && actualJava[1] !== expectJava) {
      issues.push('Java 工具链 ' + info.javaToolchain + ' 与站点预期 Java ' + expectJava + ' 不一致（' + matched.id + ' 系列）');
    }
  } else if (info.minecraft) {
    issues.push('MC 版本 ' + info.minecraft + ' 未匹配到教程系列（A 1.20.1 / B 1.21.X / C 1.20.1 Forge / D 1.21.1 / E 26.1 / F 26.1）');
  }
  return {
    ...info,
    issues,
    ok: issues.length === 0,
    next: ['besson_mod_migrate：从当前系列规划迁移', 'besson_tutorial_env：按匹配系列生成环境清单', 'besson_tutorial_series：查看该系列全部章节'],
  };
}
server.registerTool('besson_mod_project', {
  title: '模组工程体检（本地目录）',
  description: '检查本地 Minecraft 模组工程（目录 path）：识别加载器、MC 版本、Java 工具链、构建插件、mod 清单、主类与入口点，并给出常见问题与下一步建议。path 传项目根目录（含 build.gradle 或 gradle.properties 的目录）。',
  inputSchema: {
    path: z.string().optional().describe('模组工程根目录（绝对路径；缺省为当前工作目录）'),
  },
}, async ({ path: pathArg }) => text(scanProject(pathArg)));

server.registerTool('besson_mod_migrate', {
  title: '跨系列迁移清单',
  description: '生成两个教程系列（或 MC 版本 / Loader）之间的迁移清单：Java 升级、构建插件替换、mod 清单文件替换、包名/映射变化、注册方式与事件系统差异、数据生成迁移，附教程迁移章节链接。from/to 传系列字母（A-F）或关键词（如 1.20.1、1.21.1、26.1、fabric、forge、neoforge）。',
  inputSchema: {
    from: z.string().describe('当前系列：A-F 或关键词'),
    to: z.string().describe('目标系列：A-F 或关键词'),
    level: z.string().optional().describe('可选：beginner / intermediate / advanced'),
  },
}, async ({ from, to, level }) => {
  const sa = resolveSeries(from);
  const sb = resolveSeries(to);
  if (!sa || !sb) {
    return text({ error: '无法解析：from=' + from + ', to=' + to + '。可用系列 A-F 或 1.20.1 / 1.21.1 / 26.1 / fabric / forge / neoforge' });
  }
  if (sa.id === sb.id) return text({ error: 'from 与 to 是同一系列 ' + sa.id + '，无需迁移' });
  const ia = SERIES_INFO[sa.id] || {};
  const ib = SERIES_INFO[sb.id] || {};
  const diff = {};
  for (const k of ['mc', 'loader', 'java', 'jdk', 'build', 'pkg', 'modfile', 'entrypoint', 'registry', 'events', 'datagen']) {
    if ((ia[k] || '') !== (ib[k] || '')) diff[k] = { from: ia[k] || '', to: ib[k] || '' };
  }
  const steps = [];
  const push = (topic, detail) => steps.push({ order: steps.length + 1, topic, detail });
  push('Java 版本与工具链', 'JDK 从 ' + (ia.jdk || '?') + ' 升级到 ' + (ib.jdk || '?') + '；修改 gradle 的 Java toolchain 与 IDE SDK。');
  push('构建插件与 Gradle 配置', '替换构建插件：' + (ia.build || '') + ' → ' + (ib.build || '') + '；同步更新 gradle.properties 中的版本字段。');
  push('mod 清单文件', '清单文件从 ' + (ia.modfile || '') + ' 换成 ' + (ib.modfile || '') + '；loader 字段与依赖版本同步修改。');
  push('包名与映射', '映射从 ' + (ia.pkg || '') + ' 变为 ' + (ib.pkg || '') + '；全局替换 import 前检查映射差异。');
  push('注册方式', (ia.registry || '') + ' → ' + (ib.registry || '') + '；注意注册事件/持有者写法差异。');
  push('事件系统', (ia.events || '') + ' → ' + (ib.events || '') + '；事件注解与监听注册方式不同。');
  push('数据生成', (ia.datagen || '') + ' → ' + (ib.datagen || '') + '；生成器入口与输出目录检查。');
  push('入口点', (ia.entrypoint || '') + ' → ' + (ib.entrypoint || '') + '；主类结构与初始化时机核对。');
  let refs = [];
  for (const id of [sa.id, sb.id]) {
    for (const kw of ['迁移', '环境', '第一个', '配置', '升级']) {
      for (const c of chapterMatches(id, kw, 2)) refs.push(c);
    }
  }
  const seen = new Set();
  refs = refs.filter((c) => { const key = c.series + '#' + c.chapter; if (seen.has(key)) return false; seen.add(key); return true; });
  void level;
  return text({
    from: { series: sa.id, name: sa.name, mc: ia.mc, loader: ia.loader, java: ia.java },
    to: { series: sb.id, name: sb.name, mc: ib.mc, loader: ib.loader, java: ib.java },
    javaSteps: (ia.java || '') + ' → ' + (ib.java || ''),
    diff,
    steps,
    refs,
    templates: { [sa.id]: TEMPLATES[sa.id], [sb.id]: TEMPLATES[sb.id] },
    note: '迁移节奏：先在构建期打通（Gradle/清单/主类可编译），再逐模块迁移注册与事件；F 系列（NeoForge 26.1）未开更，26.1 只参照 E。',
    version: VERSION,
  });
});

// ── v2.4.0：骨架生成与中文映射对照（scaffold / mapping 工具共用）──
const CONCEPT_MAP = [
  ['注册', 'Registry.register / DeferredRegister', '注册表入口'],
  ['物品', 'Item', 'net.minecraft.world.item'],
  ['方块', 'Block', 'net.minecraft.world.level.block'],
  ['生物实体', 'Entity / Mob', 'net.minecraft.world.entity'],
  ['方块实体', 'BlockEntity', 'world.level.block.entity'],
  ['界面', 'Screen / Menu', 'client.gui.screens'],
  ['配方', 'Recipe / RecipeType', 'world.item.crafting'],
  ['数据生成', 'DataGenerator', 'datagen'],
  ['事件', 'Event / @SubscribeEvent', '事件总线'],
  ['属性', 'Attribute', 'entity.ai.attributes'],
  ['伤害来源', 'DamageSource', 'world.damage'],
  ['能力/附件', 'AttachmentType / Capability', 'neoforge attachment / Forge Capability'],
  ['战利品表', 'LootTable', 'world.level.storage.loot'],
  ['标签', 'TagKey', 'tags'],
  ['模型', 'BlockModel / ItemModel', 'client.renderer'],
  ['渲染器', 'BlockEntityRenderer / EntityRenderer', 'client.renderer'],
  ['网络包', 'CustomPacketPayload / Packet', 'network'],
  ['生物群系', 'Biome', 'world.level.biome'],
  ['维度', 'DimensionType / LevelStem', 'world.level.dimension'],
  ['结构', 'Structure / StructureType', 'world.level.levelgen.structure'],
  ['特征', 'Feature', 'level.levelgen.feature'],
  ['放置', 'PlacementModifier', 'level.levelgen.placement'],
  ['音效', 'SoundEvent', 'sounds'],
  ['物品栏', 'CreativeModeTab', 'world.item'],
  ['附魔', 'Enchantment', 'enchantment'],
  ['命令', 'Command / CommandDispatcher', 'commands'],
  ['粒子', 'ParticleType', 'particle'],
  ['流体', 'Fluid / FlowingFluid', 'world.level.fluid'],
  ['进度', 'Advancement', 'advancements'],
  ['刷怪', 'Spawner / EntityType', 'world.entity'],
  ['Mixin', 'Mixin / @Mixin', 'fabric 客户端/服务端注入'],
];

function lookupConcept(keyword) {
  const kw = String(keyword || '').trim().toLowerCase();
  if (!kw) return CONCEPT_MAP;
  return CONCEPT_MAP.filter(([zh, a, b]) =>
    zh.toLowerCase().includes(kw) || String(a).toLowerCase().includes(kw) || String(b).toLowerCase().includes(kw)
  );
}

function scaffoldSeries(loader, mcVersion) {
  const ld = String(loader || '').toLowerCase();
  const mc = String(mcVersion || '').trim();
  if (mc.startsWith('1.20.1')) return ld.includes('forge') && !ld.includes('neo') ? 'C' : 'A';
  if (mc.startsWith('1.21')) return ld.includes('fabric') ? 'B' : 'D';
  if (mc.startsWith('26')) return ld.includes('fabric') ? 'E' : 'F';
  return ld === 'neoforge' ? 'D' : ld === 'forge' ? 'C' : 'A';
}

function scaffoldFiles(args) {
  const a = args && typeof args === 'object' ? args : {};
  const loader = String(a.loader || 'neoforge').toLowerCase();
  const mcVersion = String(a.mcVersion || a.mc || '1.21.1');
  const id = scaffoldSeries(loader, mcVersion);
  const modId = String(a.modId || a.modid || 'examplemod').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const displayName = String(a.name || modId);
  const className = modId.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Mod';
  const group = String(a.group || 'com.example.' + modId).replace(/\.$/, '');
  const groupDir = group.split('.').join('/');
  const fill = (str) => str
    .replaceAll('__ID__', modId)
    .replaceAll('__NAME__', displayName)
    .replaceAll('__CLASS__', className)
    .replaceAll('__GROUP__', group)
    .replaceAll('__GROUPDIR__', groupDir)
    .replaceAll('__VERSION__', '0.0.1')
    .replaceAll('__LICENSE__', 'MIT');
  const isFab = id === 'A' || id === 'B' || id === 'E';
  const jv = id === 'A' ? '17' : id === 'B' ? '21' : id === 'E' ? '25' : '21';
  const mc = id === 'A' ? '1.20.1' : id === 'B' ? '1.21.1' : id === 'E' ? '26.1' : id === 'D' ? '1.21.1' : '1.20.1';
  const files = [];
  if (isFab) {
    files.push(
      { path: 'gradle.properties', content: fill(['minecraft_version=' + mc, 'yarn_mappings=' + mc + '+build.10', 'loader_version=0.16.14', 'fabric_version=0.92.2+1.20.1', 'mod_id=__ID__', 'mod_name=__NAME__', 'mod_version=0.0.1'].join('\n')) },
      { path: 'build.gradle', content: fill(["plugins { id 'fabric-loom' version '1.7-SNAPSHOT' }", 'version = project.mod_version', 'group = project.maven_group', 'dependencies {', '    minecraft "com.mojang:minecraft:${project.minecraft_version}"', '    mappings "net.fabricmc:yarn:${project.yarn_mappings}:v2"', '    modImplementation "net.fabricmc:fabric-loader:${project.loader_version}"', '    modImplementation "net.fabricmc.fabric-api:fabric-api:${project.fabric_version}"', '}', 'java { sourceCompatibility = JavaVersion.VERSION_' + jv + ' }'].join('\n')) },
      { path: 'settings.gradle', content: fill(['pluginManagement { repositories {', "    maven { name = 'Fabric'; url = 'https://maven.fabricmc.net/' }", '    gradlePluginPortal()', '} }', 'rootProject.name = "__ID__"'].join('\n')) },
      { path: 'src/main/java/__GROUPDIR__/__CLASS__.java', content: fill(['package __GROUP__;', '', 'import net.fabricmc.api.ModInitializer;', '', 'public class __CLASS__ implements ModInitializer {', '    public static final String MODID = "__ID__";', '    @Override', '    public void onInitialize() { }', '}'].join('\n')) },
      { path: 'src/main/resources/fabric.mod.json', content: fill(['{', '  "schemaVersion": 1,', '  "id": "__ID__",', '  "version": "0.0.1",', '  "name": "__NAME__",', '  "environment": "*",', '  "entrypoints": { "main": [ "__GROUP__.__CLASS__" ] },', '  "depends": { "fabricloader": ">=0.15", "minecraft": "' + mc + '", "java": ">=' + jv + '" }', '}'].join('\n')) },
    );
  } else {
    const isNeo = id === 'D' || id === 'F';
    files.push(
      { path: 'gradle.properties', content: fill(['minecraft_version=' + mc, isNeo ? 'neo_version=21.1.217' : 'forge_version=47.3.0', 'mod_id=__ID__', 'mod_name=__NAME__', 'mod_version=0.0.1'].join('\n')) },
      { path: 'build.gradle', content: fill(isNeo
        ? ["plugins { id 'java-library'", "id 'net.neoforged.moddev' version '2.0.78' }", 'java.toolchain.languageVersion = JavaLanguageVersion.of(21)', 'neoForge { version = project.neo_version }', 'dependencies { }'].join('\n')
        : ["plugins { id 'net.minecraftforge.gradle' version '[6.0,6.2)' }", 'version = project.mod_version', 'minecraft { mappings channel: \'official\', version: project.minecraft_version }', 'dependencies { minecraft "net.minecraftforge:forge:${project.minecraft_version}-${project.forge_version}" }'].join('\n')) },
      { path: 'settings.gradle', content: fill(['rootProject.name = "__ID__"'].join('\n')) },
      { path: 'src/main/java/__GROUPDIR__/__CLASS__.java', content: fill(isNeo
        ? ['package __GROUP__;', '', 'import net.neoforged.bus.api.IEventBus;', 'import net.neoforged.fml.common.Mod;', 'import net.neoforged.neoforge.registries.DeferredRegister;', 'import net.minecraft.world.level.block.Block;', '', '@Mod("__ID__")', 'public class __CLASS__ {', '    public static final String MODID = "__ID__";', '    public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks(MODID);', '    public __CLASS__(IEventBus modBus) { BLOCKS.register(modBus); }', '}'].join('\n')
        : ['package __GROUP__;', '', 'import net.minecraftforge.eventbus.api.IEventBus;', 'import net.minecraftforge.fml.common.Mod;', 'import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;', 'import net.minecraftforge.registries.DeferredRegister;', 'import net.minecraftforge.registries.ForgeRegistries;', 'import net.minecraft.world.level.block.Block;', '', '@Mod("__ID__")', 'public class __CLASS__ {', '    public static final String MODID = "__ID__";', '    public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(ForgeRegistries.BLOCKS, MODID);', '    public __CLASS__() { BLOCKS.register(FMLJavaModLoadingContext.get().getModEventBus()); }', '}'].join('\n')) },
      { path: 'src/main/resources/META-INF/' + (isNeo ? 'neoforge.mods.toml' : 'mods.toml'), content: fill(['modLoader="javafml"', 'loaderVersion="[' + (isNeo ? '1,' : '43,') + ')"', 'license="__LICENSE__"', '', '[[mods]]', 'modId="__ID__"', 'version="__VERSION__"', 'displayName="__NAME__"'].join('\n')) },
    );
  }
  return { ok: true, series: id, loader: (SERIES_INFO[id] || {}).loader || loader, mcVersion, modId, files, note: '骨架为最小可编译版本：先 gradle build 通过，再按教程章节逐步添加内容。' };
}

server.registerTool('besson_mod_scaffold', {
  title: '生成模组工程骨架',
  description: '生成 Minecraft 模组工程骨架（NeoForge 1.21.1 / Fabric 1.20.1 / Fabric 1.21.x / Fabric 26.1 / Forge 1.20.1）。提供 loader 与 mcVersion 后返回可直接写入的文件清单（gradle 配置、主类、mod 清单），不直接落盘。',
  inputSchema: {
    loader: z.string().optional().describe('fabric / forge / neoforge（默认 neoforge）'),
    mcVersion: z.string().optional().describe('MC 版本，如 1.20.1 / 1.21.1 / 26.1（默认 1.21.1）'),
    modId: z.string().optional().describe('mod id（小写，如 mysword）'),
    name: z.string().optional().describe('mod 显示名'),
    group: z.string().optional().describe('包名（如 com.example.mysword）'),
  },
}, async ({ loader, mcVersion, modId, name, group }) => text(scaffoldFiles({ loader, mcVersion, modId, name, group })));

server.registerTool('besson_mod_mapping', {
  title: '中文映射对照',
  description: 'Minecraft 模组开发概念的中文 ↔ 官方映射名对照（物品/方块实体/网络包/附魔/Mixin 等）。输入关键词返回匹配条目；不传返回完整表。',
  inputSchema: {
    keyword: z.string().optional().describe('中文概念或英文类名'),
  },
}, async ({ keyword }) => {
  const rows = lookupConcept(keyword);
  return text({ ok: true, keyword: String(keyword || ''), matched: rows.length, entries: rows.map(([zh, m, p]) => ({ zh, mapping: m, pkg: p })) });
});

// ── 传输 ──────────────────────────────────────────────────────────────────
const httpMode = process.argv.includes('--http');

if (httpMode) {
  const port = Number(process.env.PORT || 3987);
  const transports = new Map();
  const httpServer = createServer(async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    let transport = sessionId ? transports.get(sessionId) : undefined;
    const isNew = !transport;
    if (!transport) {
      transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
      await server.connect(transport);
    }
    try {
      await transport.handleRequest(req, res, req.body);
      if (isNew && transport.sessionId) transports.set(transport.sessionId, transport);
    } catch (err) {
      if (!res.headersSent) res.writeHead(500).end(String((err && err.message) || err));
      else res.end();
    }
  });
  httpServer.listen(port, () => {
    console.error(`besson-tutorials-mcp HTTP 模式已启动：http://127.0.0.1:${port}/mcp`);
  });
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('besson-tutorials-mcp stdio 模式已启动');
}
