// 北山Besson 教程检索 MCP 服务器（v2.1.0 · 适配 DeepSeek Harness 0.2.1）
// 用法：
//   stdio（默认）: node mcp-server.mjs
//   HTTP        : node mcp-server.mjs --http   （环境变量 PORT，默认 3987）
// 数据：默认读取 ../tools/index_data.json（仓库根目录），可用环境变量 BESSON_DATA_PATH 覆盖。
// 7 个工具：lookup / index / series / fetch / plan / compare / env，与 dsh-plugin 能力对齐。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VERSION = '2.1.0';

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

function tokenize(q) {
  return q.toLowerCase()
    .replace(/[、，。；：·&+（）()"'\-—_|/\\]/g, ' ')
    .split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
}

function search(query, limit) {
  const tokens = tokenize(String(query || ''));
  const lim = Math.max(1, Math.min(25, Number.isFinite(limit) ? Math.floor(limit) : 8));
  if (tokens.length === 0) return { matched: [], total: 0, hint: '请输入查询关键词' };
  const scored = [];
  for (const it of INDEX) {
    const t = it.haystack;
    let hits = 0, weight = 0, phraseHit = false;
    for (const tok of tokens) {
      if (t.includes(tok)) {
        hits += 1;
        weight += tok.length;
        if (/^[a-f]$/.test(tok) && it.series.toLowerCase() === tok) weight += 4;
        if (String(it.chapter) === tok) weight += 12;
        if (/^\d+$/.test(tok) && String(it.chapter).startsWith(tok)) weight += 6;
      }
    }
    if (it.title.toLowerCase().includes(tokens.join(' '))) { phraseHit = true; weight += 20; }
    if (hits > 0) scored.push({ item: it, hits, weight, phraseHit });
  }
  scored.sort((a, b) => (b.hits - a.hits) || (b.weight - a.weight) || (b.phraseHit ? 1 : 0) - (a.phraseHit ? 1 : 0));
  return {
    matched: scored.slice(0, lim).map(({ item }) => ({
      kind: item.kind, series: item.series, seriesName: item.seriesName, loader: item.loader,
      mc: item.mc, java: item.java, chapter: item.chapter, title: item.title, url: item.url,
    })),
    total: scored.length,
  };
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

function planGoal(goal, level) {
  const g = String(goal || '').trim().toLowerCase();
  const wantsLoader = /neoforge/.test(g) ? 'NeoForge' : /forge/.test(g) ? 'Forge' : /fabric/.test(g) ? 'Fabric' : '';
  const wantsLatest = /26\.1|最新|新版本|前沿|新api/.test(g);
  const wantsAdvanced = /进阶|高级|网络|渲染|粒子|配方|rei|精炼|罐装|工具|附魔|结构|生物群系|维度|gui|声音/.test(g);
  const wantsMigrate = /迁移|升级|转版本|移植|对比/.test(g);
  const pick = [];
  if (wantsMigrate) pick.push('A', 'D');
  else if (wantsLatest) pick.push(wantsLoader === 'NeoForge' ? 'F' : 'E');
  else if (wantsLoader === 'NeoForge') pick.push('D');
  else if (wantsLoader === 'Forge') pick.push('C');
  else if (wantsLoader === 'Fabric') pick.push('A');
  else if (wantsAdvanced) pick.push('C', 'D');
  else pick.push('A', 'B');

  const steps = [];
  for (const id of pick) {
    const info = SERIES_INFO[id] || {};
    steps.push({
      order: steps.length + 1, series: id, seriesName: (seriesMeta(id) || {}).name || id,
      loader: info.loader, mc: info.mc, java: info.java, role: '主线',
      note: `按 ${id} 系列逐章推进；环境搭建用 besson_tutorial_env`,
    });
    if (wantsAdvanced) {
      for (const kw of ['网络', '渲染', 'gui', '粒子', '配方']) {
        const hits = chapterMatches(id, kw, 2);
        if (hits.length) {
          const r = hits[0];
          steps.push({ order: steps.length + 1, series: r.series, chapter: r.chapter, title: r.title, url: r.url, role: '专题' });
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
    limit: z.number().int().min(1).max(25).optional().describe('最多返回的匹配条数（1-25，默认 8）'),
  },
}, async ({ query, limit }) => {
  const r = search(query, limit);
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
  site: DATA.site, author: DATA.author, synced: DATA.synced, version: VERSION, totalArticlesOnSite: 207,
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
  },
}, async ({ goal, level }) => {
  const steps = planGoal(goal, level);
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
