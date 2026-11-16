// 北山 Besson 模组开发助手 — Web UI 左栏入口面板（DSH 0.2.2-rc.1+）
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

      var COLORS = {
        text: 'var(--dsw-alias-text-primary, #1f2329)',
        dim: 'var(--dsw-alias-text-secondary, #6b7280)',
        border: 'var(--dsw-alias-border, rgba(0,0,0,.08))',
        accent: 'var(--dsw-alias-brand-primary, #4f7cff)',
        card: 'var(--dsw-alias-surface, rgba(255,255,255,.6))',
        ok: 'var(--dsw-alias-success, #16a34a)',
      }

      var S = {
        page: { padding: '20px 24px', color: COLORS.text, fontSize: 14, lineHeight: 1.6, overflowY: 'auto', height: '100%', boxSizing: 'border-box' },
        title: { fontSize: 20, fontWeight: 650, margin: '0 0 6px' },
        sub: { color: COLORS.dim, margin: '0 0 18px' },
        card: { border: '1px solid ' + COLORS.border, borderRadius: 10, padding: '14px 16px', background: COLORS.card, marginBottom: 14 },
        h2: { fontSize: 15, fontWeight: 600, margin: '0 0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        badge: { display: 'inline-block', padding: '1px 8px', borderRadius: 999, fontSize: 12, border: '1px solid ' + COLORS.border, margin: '2px 4px 2px 0', color: COLORS.dim },
        num: { fontSize: 22, fontWeight: 650 },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
        td: { borderBottom: '1px solid ' + COLORS.border, padding: '6px 8px', verticalAlign: 'top' },
        tdName: { borderBottom: '1px solid ' + COLORS.border, padding: '6px 8px', fontFamily: 'var(--dsw-alias-font-mono, monospace)', whiteSpace: 'nowrap', verticalAlign: 'top' },
        btn: { border: '1px solid ' + COLORS.border, background: 'transparent', color: COLORS.dim, borderRadius: 6, padding: '2px 10px', fontSize: 12, cursor: 'pointer' },
        link: { color: COLORS.accent, textDecoration: 'none' },
        small: { color: COLORS.dim, fontSize: 12 },
      }

      var TOOLS = [
        ['besson_tutorial_lookup', '检索教程章节（关键词/系列/章节号）'],
        ['besson_tutorial_index', '系列/版本/数据健康总览'],
        ['besson_tutorial_series', '列某系列全部章节 / 取单章详情'],
        ['besson_tutorial_fetch', '抓取一篇文章正文'],
        ['besson_tutorial_plan', '按目标生成学习路线'],
        ['besson_tutorial_compare', '两个系列/版本 API 差异对比'],
        ['besson_tutorial_env', '环境搭建清单（JDK/Gradle/命令/坑）'],
        ['besson_mod_project', '工程体检：loader/版本/清单/主类/问题'],
        ['besson_mod_migrate', '版本迁移清单（8 步）'],
        ['besson_mod_scaffold', '生成工程骨架（Gradle/主类/mod 清单）'],
        ['besson_mod_mapping', '中文 ↔ 官方映射名对照（31 条）'],
      ]
      var SERIES_FALLBACK = [
        { id: 'A', name: 'A系列 · Fabric 1.20.1 长线', loader: 'Fabric', mc: '1.20.1', java: 'Java 17', count: 55, gaps: [] },
        { id: 'B', name: 'B系列 · Fabric 1.21.X', loader: 'Fabric', mc: '1.21.X', java: 'Java 21', count: 57, gaps: ['54'] },
        { id: 'C', name: 'C系列 · Forge 1.20.1', loader: 'Forge', mc: '1.20.1', java: 'Java 17', count: 38, gaps: ['22-27'] },
        { id: 'D', name: 'D系列 · NeoForge 1.21.1', loader: 'NeoForge', mc: '1.21.1', java: 'Java 21', count: 32, gaps: ['13-24'] },
        { id: 'E', name: 'E系列 · Fabric 26.1', loader: 'Fabric', mc: '26.1', java: 'Java 25', count: 30, gaps: ['9-21'] },
        { id: 'F', name: 'F系列 · NeoForge 26.1', loader: 'NeoForge', mc: '26.1', java: 'Java 25', count: 0, gaps: ['待开更'] },
      ]

      function useStats() {
        var state = React.useState({ status: 'loading', data: { synced: '2026-11-07', chapters: 212, standalone: 4, totalArticles: 217, series: SERIES_FALLBACK }, at: '' })
        var set = state[1]
        var load = function (bust) {
          fetch(STATS_URL + (bust ? '?t=' + Date.now() : ''), { cache: bust ? 'no-store' : 'default' })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
            .then(function (d) { set({ status: 'ok', data: d, at: new Date().toLocaleString() }) })
            .catch(function () { set(function (prev) { return { status: prev.status === 'ok' ? 'stale' : 'error', data: prev.data, at: prev.at } }) })
        }
        React.useEffect(function () { load(false) }, [])
        return [state[0], load]
      }

      function Badge(props) { return h('span', { style: S.badge }, props.children) }

      function LiveCard(props) {
        var info = props.info
        var d = info.data
        var statusText = info.status === 'ok' ? '实时数据 · 更新于 ' + info.at : info.status === 'stale' ? '缓存数据（网络不可达，恢复后自动刷新）· ' + info.at : info.status === 'error' ? '离线快照（网络不可达）' : '加载中…'
        var statusColor = info.status === 'ok' ? COLORS.ok : COLORS.dim
        return h('div', { style: S.card },
          h('div', { style: S.h2 },
            h('span', null, '📊 站点数据（实时）'),
            h('span', null,
              h('span', { style: { color: statusColor, fontSize: 12, marginRight: 8 } }, statusText),
              h('button', { style: S.btn, onClick: function () { props.onRefresh() } }, '刷新')
            )
          ),
          h('div', { style: S.grid },
            cell('已索引章节', d.chapters),
            cell('独立文章', d.standalone),
            cell('站点文章', d.totalArticles),
            cell('数据同步', d.synced || '—')
          ),
          h('div', { style: { marginTop: 10 } },
            (d.series || SERIES_FALLBACK).map(function (s) {
              return h(Badge, { key: s.id }, s.id + ' · ' + (s.loader || '') + ' ' + (s.mc || '') + ' · ' + s.count + ' 章' + (s.gaps && s.gaps.length ? '（缺 ' + s.gaps.join('、') + '）' : ''))
            })
          ),
          h('div', { style: S.small }, '数据由 dsh-besson-tools 发布管道生成：脚本同步站点 → 更新 stats.json → 面板自动读取。上次同步 ', d.synced || '—', '；面板打开/刷新时自动拉取 GitHub 上的最新 stats.json。')
        )
      }

      function cell(label, value) {
        return h('div', null, h('div', { style: S.num }, String(value == null ? '—' : value)), h('div', { style: S.small }, label))
      }

      function Page() {
        var stat = useStats()
        var info = stat[0]
        var refresh = stat[1]
        var series = (info.data && info.data.series) || SERIES_FALLBACK
        return h('div', { style: S.page },
          h('div', { style: S.title }, '北山 Besson 模组开发助手'),
          h('div', { style: S.sub }, '教程检索 · 学习路线 · 版本对比 · 环境搭建 · 工程体检 · 迁移清单 · 工程骨架 · 中文映射（11 个工具）'),
          h(LiveCard, { info: info, onRefresh: function () { refresh(true) } }),
          h('div', { style: S.card },
            h('div', { style: S.h2 }, h('span', null, '🧰 工具速查')),
            h('table', { style: S.table },
              h('thead', null, h('tr', null, h('th', { style: S.td }, '工具'), h('th', { style: S.td }, '用途'))),
              h('tbody', null, TOOLS.map(function (t) {
                return h('tr', { key: t[0] }, h('td', { style: S.tdName }, t[0]), h('td', { style: S.td }, t[1]))
              }))
            )
          ),
          h('div', { style: S.card },
            h('div', { style: S.h2 }, h('span', null, '📚 系列矩阵')),
            h('table', { style: S.table },
              h('thead', null, h('tr', null,
                h('th', { style: S.td }, '系列'), h('th', { style: S.td }, 'Loader'), h('th', { style: S.td }, 'MC'), h('th', { style: S.td }, 'Java'), h('th', { style: S.td }, '章节'), h('th', { style: S.td }, '缺号')
              )),
              h('tbody', null, series.map(function (s) {
                return h('tr', { key: s.id },
                  h('td', { style: S.td }, s.id + ' · ' + (s.loader || '')), h('td', { style: S.td }, s.loader || ''),
                  h('td', { style: S.td }, s.mc || ''), h('td', { style: S.td }, s.java || ''),
                  h('td', { style: S.td }, String(s.count)), h('td', { style: S.td }, (s.gaps && s.gaps.join('、')) || '—'))
              }))
            )
          ),
          h('div', { style: S.card },
            h('div', { style: S.h2 }, h('span', null, '💡 示例提示词')),
            h('div', { style: S.small },
              '· 用 besson_mod_scaffold 生成 1.21.1 NeoForge 模组骨架\n',
              '· 用 besson_mod_project 体检我当前的工程目录\n',
              '· 用 besson_tutorial_plan 规划「Fabric 入门 → 进阶」路线\n',
              '· 用 besson_mod_mapping 查「网络包」的官方类名\n',
              '· 把教程 E 系列 #34 正文抓下来，按步骤实现'
            )
          ),
          h('div', { style: S.card },
            h('div', { style: S.h2 }, h('span', null, '🛠 常见坑')),
            ['JAVA_HOME 指向了别的 JDK → gradle class 版本不匹配',
             'mods.toml / neoforge.mods.toml / fabric.mod.json 的 loader 字段写错 → 不加载',
             '改完注册代码没重启客户端 → 看不到新内容（注册发生在启动期）',
             'Yarn 映射与 Mojmap 混用 → 方法名对不上（同一工程别混）',
             'NeoGradle/ModDevGradle 版本与 MC 版本必须配套',
            ].map(function (t, i) { return h('div', { key: i, style: S.small }, '· ' + t) })
          ),
          h('div', { style: S.small },
            '数据来源：', h('a', { style: S.link, href: 'https://beishanair.github.io/', target: '_blank', rel: 'noreferrer' }, '北山Besson 教程站'), '（CC BY-NC-SA 4.0）。工具：' + TOOLS.length + ' 个；面板随版本更新自动刷新。'
          )
        )
      }

      function Icon(props) {
        var size = (props && props.size) || 18
        return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
          h('path', { d: 'M4 7h16' }), h('path', { d: 'M6 12h12' }), h('path', { d: 'M8 17h8' }), h('circle', { cx: 12, cy: 12, r: 10, strokeOpacity: 0.35 })
        )
      }

      return {
        inject: ['slots'],
        apply: function (ctx) {
          ctx.slots.inject('main', function () {
            return ctx.slots.register({ name: 'main', key: PANEL_ID }, Page)
          })
          ctx.slots.inject('sidebar.panellist', function () {
            return ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, order: 10, label: function () { return '北山 Besson 模组助手' } }, Icon)
          })
        },
      }
    },
  })
})()
