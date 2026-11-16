// 北山 Besson 模组开发助手 — Web UI 左栏入口面板（DSH 0.2.2+）
// 格式：window.__ModuleLoader__.load({ id: '<包名>', factory(require) { return { inject: ['slots'], apply(ctx) {...} } } })
// 注意：不能 import Harness 客户端包；React 从浏览器模块表用 require('react') 取。节点语法必须是纯 JS（无 TS/JSX）。
;(function () {
  window.__ModuleLoader__.load({
    id: 'dsh-besson-tools',
    factory: function (require) {
      var React = require('react')
      var h = React.createElement
      var PANEL_ID = 'besson-moddev'
      var STATS_URL = 'https://raw.githubusercontent.com/QZyme/dsh-besson-tools/main/lib/data/stats.json'
      var STATS_URL_CDN = 'https://cdn.jsdelivr.net/gh/QZyme/dsh-besson-tools@main/lib/data/stats.json'
      var USAGE_URL = (function () { try { return new URL('api/dsh-besson-tools/usage', document.baseURI).toString() } catch (e) { return 'api/dsh-besson-tools/usage' } })()

      var COLORS = {
        text: 'var(--dsw-alias-text-primary, #1f2329)',
        dim: 'var(--dsw-alias-text-secondary, #6b7280)',
        border: 'var(--dsw-alias-border, rgba(0,0,0,.08))',
        accent: 'var(--dsw-alias-brand-primary, #4f7cff)',
        card: 'var(--dsw-alias-surface, rgba(255,255,255,.6))',
        ok: 'var(--dsw-alias-success, #16a34a)',
        warn: 'var(--dsw-alias-warning, #d97706)',
        bar1: 'var(--dsw-alias-brand-primary, #4f7cff)',
        bar2: 'var(--dsw-alias-brand-secondary, #7c5cff)',
      }

      var S = {
        page: { padding: '20px 24px', color: COLORS.text, fontSize: 14, lineHeight: 1.6, overflowY: 'auto', height: '100%', boxSizing: 'border-box' },
        h1: { fontSize: 20, fontWeight: 650, margin: '0 0 4px' },
        sub: { color: COLORS.dim, margin: '0 0 16px', fontSize: 13 },
        card: { border: '1px solid ' + COLORS.border, borderRadius: 10, padding: '14px 16px', background: COLORS.card, marginBottom: 14 },
        h2: { fontSize: 15, fontWeight: 600, margin: '0 0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        badge: { display: 'inline-block', padding: '1px 8px', borderRadius: 999, fontSize: 12, border: '1px solid ' + COLORS.border, margin: '2px 4px 2px 0', color: COLORS.dim },
        grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
        grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
        num: { fontSize: 22, fontWeight: 650, lineHeight: 1.2 },
        small: { color: COLORS.dim, fontSize: 12 },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
        th: { borderBottom: '1px solid ' + COLORS.border, padding: '5px 8px', textAlign: 'left', color: COLORS.dim, fontWeight: 500 },
        td: { borderBottom: '1px solid ' + COLORS.border, padding: '5px 8px', verticalAlign: 'top' },
        tdName: { borderBottom: '1px solid ' + COLORS.border, padding: '5px 8px', fontFamily: 'var(--dsw-alias-font-mono, monospace)', whiteSpace: 'nowrap', verticalAlign: 'top' },
        btn: { border: '1px solid ' + COLORS.border, background: 'transparent', color: COLORS.dim, borderRadius: 6, padding: '2px 10px', fontSize: 12, cursor: 'pointer' },
        link: { color: COLORS.accent, textDecoration: 'none' },
        bar: { height: 8, borderRadius: 4, background: COLORS.bar1, opacity: 0.9 },
        barTrack: { height: 8, borderRadius: 4, background: 'rgba(127,127,127,.15)', flex: 1, overflow: 'hidden' },
        row: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
        rowLabel: { width: 110, fontSize: 12, color: COLORS.dim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        rowVal: { width: 46, fontSize: 12, color: COLORS.dim, textAlign: 'right' },
      }

      // 工具目录：名称 / 能力 / 典型上下文占用（粗略 token 估计，1 token ≈ 2.5 汉字或 4 字符）
      var TOOLS = [
        ['besson_tutorial_lookup', '关键词检索教程章节（系列/Loader/版本/章节号）', '~0.3–1 KB'],
        ['besson_tutorial_index', '系列总览 + 数据健康（全量，较重）', '~5–7 KB'],
        ['besson_tutorial_series', '单系列全部章节 / 单章详情', '~2–6 KB'],
        ['besson_tutorial_fetch', '抓取文章正文（可限长）', '≤ maxChars（默认 6 KB）'],
        ['besson_tutorial_plan', '按目标生成学习路线', '~1–3 KB'],
        ['besson_tutorial_compare', '两系列/版本工程差异对比', '~2–4 KB'],
        ['besson_tutorial_env', '环境搭建清单（JDK/Gradle/命令/坑）', '~2–3 KB'],
        ['besson_mod_project', '工程体检（版本/清单/主类/问题清单）', '~1–2 KB'],
        ['besson_mod_migrate', '版本迁移清单（A→D、C→D 等）', '~2–4 KB'],
        ['besson_mod_scaffold', '骨架生成（gradle.properties/build.gradle/主类/清单）', '~6–9 KB'],
        ['besson_mod_mapping', '中文概念 ↔ 官方映射名对照', '~0.5–1.5 KB'],
      ]

      var PITFALLS = [
        'JAVA_HOME 指错版本 → Gradle 报 class 版本不匹配（对照系列 JDK 表）',
        'gradle.properties 版本与系列不匹配 → 依赖解析失败或游戏起不来',
        'fabric.mod.json / neoforge.mods.toml 缺 depends → 不加载或加载即崩',
        '改完注册代码没重启客户端 → 看不到新内容（注册发生在启动期）',
        '跨版本迁移只改 Java 版本、不改映射与 API → 大面积编译错误',
      ]

      var SNAP = { version: '2.4.3', synced: '2026-11-07', chapters: 212, standalone: 4, totalArticles: 217, siteFound: 217,
        series: [
          { id: 'A', name: 'Fabric 1.20.1', chapters: 55 }, { id: 'B', name: 'Fabric 1.21.X', chapters: 57 },
          { id: 'C', name: 'Forge 1.20.1', chapters: 38 }, { id: 'D', name: 'NeoForge 1.21.1', chapters: 32 },
          { id: 'E', name: 'Fabric 26.1', chapters: 30 }, { id: 'F', name: 'NeoForge 26.1', chapters: 0 }] }

      function daysSince(iso) {
        var t = Date.parse(iso)
        if (isNaN(t)) return null
        return Math.max(0, Math.floor((Date.now() - t) / 86400000))
      }

      function useStats() {
        var st = React.useState({ data: SNAP, live: false, loading: true, error: '' })
        var s = st[0], set = st[1]
        var  load = React.useCallback(function () {
          set(function (p) { return Object.assign({}, p, { loading: true, error: '' }) })
          var tryUrl = function (i) {
            var urls = [STATS_URL + '?t=' + Date.now(), STATS_URL_CDN + '?t=' + Date.now()]
            if (i >= urls.length) { set(function (p) { return Object.assign({}, p, { loading: false, live: false, error: '实时数据不可达，显示内置快照' }) }); return }
            fetch(urls[i], { cache: 'no-store' })
              .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
              .then(function (j) { set({ data: j, live: true, loading: false, error: '' }) })
              .catch(function () { tryUrl(i + 1) })
          }
          tryUrl(0)
        }, [])
        React.useEffect(function () { load() }, [load])
        return [s.data, s.loading, s.live, s.error, load]
      }
      function useUsage() {
        var st = React.useState({ data: null, loading: true, err: '' })
        var s = st[0], set = st[1]
        var loadU = React.useCallback(function () {
          set(function (p) { return Object.assign({}, p, { loading: true, err: '' }) })
          fetch(USAGE_URL, { cache: 'no-store' })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
            .then(function (j) { set({ data: j, loading: false, err: '' }) })
            .catch(function () { set({ data: null, loading: false, err: '统计端点不可达：重启 DSH 后生效（先调用一次 besson_* 工具产生数据）' }) })
        }, [])
        React.useEffect(function () { loadU() }, [loadU])
        return [s.data, s.loading, s.err, loadU]
      }


      function BarChart(props) {
        var max = Math.max.apply(null, props.items.map(function (x) { return x.chapters })) || 1
        return h('div', null, props.items.map(function (it) {
          return h('div', { key: it.id, style: S.row },
            h('div', { style: S.rowLabel, title: it.name }, it.id + ' ' + it.name),
            h('div', { style: S.barTrack }, h('div', { style: Object.assign({}, S.bar, { width: Math.round(it.chapters / max * 100) + '%' }) })),
            h('div', { style: S.rowVal }, String(it.chapters))
          )
        }))
      }

      function Page() {
        var d = useStats()
        var data = d[0], loading = d[1], live = d[2], err = d[3], reload = d[4]
        var age = daysSince(data.synced)
        var ageText = age === null ? '未知' : age === 0 ? '今天' : age + ' 天前'
        var seriesSum = (data.series || []).reduce(function (n, x) { return n + (x.chapters || 0) }, 0)
        var u = useUsage()
        var ud = u[0], uLoading = u[1], uErr = u[2], uReload = u[3]

        return h('div', { style: S.page },
          h('div', { style: S.h1 }, '北山 Besson 模组开发助手'),
          h('div', { style: S.sub },
            '教程检索 · 学习路线 · 版本对比 · 环境搭建 · 工程体检 · 迁移清单 · 骨架生成 · 中文映射',
            h('span', { style: { marginLeft: 10 } },
              h('button', { style: S.btn, onClick: reload, disabled: loading }, loading ? '刷新中…' : '刷新')),
            live ? h('span', { style: Object.assign({}, S.badge, { color: COLORS.ok }) }, '● 实时数据')
              : h('span', { style: Object.assign({}, S.badge, { color: COLORS.warn }) }, '○ 离线快照'),
            h('span', { style: S.badge }, 'v' + data.version)
          ),
          err ? h('div', { style: S.small }, '⚠ ' + err) : null,

          h('div', { style: S.card },
            h('div', { style: S.h2 }, '数据统计', h('span', { style: S.small }, '数据同步 ' + data.synced + '（' + ageText + '）')),
            h('div', { style: S.grid4 },
              statCard('已索引章节', data.chapters, '六个系列合计'),
              statCard('独立文章', data.standalone, 'FAQ/教程总汇等'),
              statCard('站点文章', data.siteFound, '全站抓取口径'),
              statCard('系列数', (data.series || []).length, 'F 系列待开更')
            ),
            h('div', { style: { marginTop: 14 } },
              h('div', { style: Object.assign({}, S.h2, { fontSize: 13, marginBottom: 8 }) },
                '章节分布（按系列）', h('span', { style: S.small }, '合计 ' + seriesSum + ' 章')),
              h(BarChart, { items: data.series || [] })
            )
          ),


          h('div', { style: S.card },
            h('div', { style: S.h2 }, '工具调用统计（本机）',
              h('button', { style: S.btn, onClick: uReload, disabled: uLoading }, uLoading ? '读取中…' : '刷新')),
            ud ? h('div', null,
              h('table', { style: S.table },
                h('thead', null, h('tr', null, h('th', { style: S.th }, '工具'), h('th', { style: S.th }, '调用次数'), h('th', { style: S.th }, '平均耗时'), h('th', { style: S.th }, '失败'), h('th', { style: S.th }, '最近使用'))),
                h('tbody', null, (ud.tools || []).map(function (t) {
                  return h('tr', { key: t.name },
                    h('td', { style: S.tdName }, t.name),
                    h('td', { style: S.td }, String(t.calls)),
                    h('td', { style: Object.assign({}, S.td, S.small) }, t.avgMs + ' ms'),
                    h('td', { style: Object.assign({}, S.td, S.small) }, t.errors ? String(t.errors) : '—'),
                    h('td', { style: Object.assign({}, S.td, S.small) }, t.last ? t.last.replace('T', ' ').slice(5, 16) : '—'))
                }))
              )
            ) : null,
            (ud && (ud.tools || []).length === 0) ? h('div', { style: Object.assign({}, S.small, { marginTop: 6 }) }, '还没有调用记录：在任意会话中使用 besson_* 工具后回到这里刷新。') : null,
            ud ? h('div', { style: Object.assign({}, S.small, { marginTop: 8 }) },
              '合计 ' + ud.total.calls + ' 次 · 失败 ' + ud.total.errors + ' 次 · 平均 ' + ud.total.avgMs + ' ms · 数据文件 ~/.dsh/storages/besson-tools/usage.json（本机保存，不联网）')
              : h('div', { style: S.small }, uErr)
          ),
          h('div', { style: S.card },
            h('div', { style: S.h2 }, '工具与上下文开销（11 个）'),
            h('table', { style: S.table },
              h('thead', null, h('tr', null, h('th', { style: S.th }, '工具'), h('th', { style: S.th }, '能力'), h('th', { style: S.th }, '典型返回规模'))),
              h('tbody', null, TOOLS.map(function (t) {
                return h('tr', { key: t[0] },
                  h('td', { style: S.tdName }, t[0]),
                  h('td', { style: S.td }, t[1]),
                  h('td', { style: Object.assign({}, S.td, S.small) }, t[2]))
              }))
            ),
            h('div', { style: Object.assign({}, S.small, { marginTop: 8 }) },
              '提示：上下文紧张时优先用 lookup/series/plan（轻），避免连续 index/fetch 全量输出；fetch 可用 maxChars 限长。')
          ),

          h('div', { style: S.card },
            h('div', { style: S.h2 }, '版本环境矩阵'),
            h('table', { style: S.table },
              h('thead', null, h('tr', null, h('th', { style: S.th }, '系列'), h('th', { style: S.th }, 'MC'), h('th', { style: S.th }, 'Loader'), h('th', { style: S.th }, 'Java'))),
              h('tbody', null, [
                ['A', 'Fabric 1.20.1', 'Fabric', 'Java 17'], ['B', 'Fabric 1.21.X', 'Fabric', 'Java 21'],
                ['C', 'Forge 1.20.1', 'Forge', 'Java 17'], ['D', 'NeoForge 1.21.1', 'NeoForge', 'Java 21'],
                ['E', 'Fabric 26.1', 'Fabric', 'Java 25'], ['F', 'NeoForge 26.1（待开）', 'NeoForge', 'Java 25'],
              ].map(function (r) {
                return h('tr', { key: r[0] },
                  h('td', { style: S.tdName }, r[0]), h('td', { style: S.td }, r[1]),
                  h('td', { style: S.td }, r[2]), h('td', { style: S.td }, r[3]))
              }))
            )
          ),

          h('div', { style: S.card },
            h('div', { style: S.h2 }, '常见坑'),
            PITFALLS.map(function (p, i) { return h('div', { key: i, style: { marginBottom: 4 } }, '· ' + p) })
          ),

          h('div', { style: S.card },
            h('div', { style: S.h2 }, '示例提示词'),
            h('div', { style: { marginBottom: 3 } }, '「NeoForge 1.21.1 的自定义方块怎么做？先告诉我该看哪章。」'),
            h('div', { style: { marginBottom: 3 } }, '「我的工程是 Fabric 1.20.1，帮我体检一下，再告诉我怎么迁移到 26.1。」'),
            h('div', { style: { marginBottom: 3 } }, '「给我生成一个 NeoForge 1.21.1 模组骨架（modId: mymod）。」'),
            h('div', { style: S.small }, '数据来源：', h('a', { href: 'https://beishanair.github.io/', target: '_blank', rel: 'noreferrer', style: S.link }, '北山Besson 教程站'), '（CC BY-NC-SA 4.0）')
          )
        )
      }

      function statCard(label, num, hint) {
        return h('div', { style: { padding: '8px 10px', border: '1px solid ' + COLORS.border, borderRadius: 8 } },
          h('div', { style: S.num }, String(num)),
          h('div', { style: { fontSize: 12, marginTop: 2 } }, label),
          h('div', { style: S.small }, hint || ''))
      }

      function Icon(props) {
        var size = (props && props.size) || 20
        return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
          h('path', { d: 'M3 5.5 12 2l9 3.5v7c0 5-4 8.5-9 10-5-1.5-9-5-9-10z' }),
          h('path', { d: 'M9 12.5 11 14.5 15.5 10' }))
      }

      return {
        inject: ['slots'],
        apply: function (ctx) {
          ctx.slots.inject('main', function () {
            ctx.slots.register({ name: 'main', key: PANEL_ID }, Page)
          })
          ctx.slots.inject('sidebar.panellist', function () {
            ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, order: 10, label: function () { return '北山 Besson 模组助手' } }, Icon)
          })
        }
      }
    }
  })
})()
