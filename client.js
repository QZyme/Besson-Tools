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

      var COLORS = {
        text: 'var(--dsw-alias-text-primary, #1f2329)',
        dim: 'var(--dsw-alias-text-secondary, #6b7280)',
        border: 'var(--dsw-alias-border, rgba(0,0,0,.08))',
        accent: 'var(--dsw-alias-brand-primary, #4f7cff)',
        card: 'var(--dsw-alias-surface, rgba(255,255,255,.6))',
      }

      var S = {
        page: { padding: '20px 24px', color: COLORS.text, fontSize: 14, lineHeight: 1.6, overflowY: 'auto', height: '100%', boxSizing: 'border-box' },
        title: { fontSize: 20, fontWeight: 650, margin: '0 0 6px' },
        sub: { color: COLORS.dim, margin: '0 0 18px', fontSize: 13 },
        grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 },
        card: { border: '1px solid ' + COLORS.border, borderRadius: 12, padding: '14px 16px', background: COLORS.card },
        cardTitle: { fontWeight: 600, marginBottom: 8, fontSize: 14 },
        dim: { color: COLORS.dim },
        code: { fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: 12.5, background: 'var(--dsw-alias-bg, rgba(0,0,0,.04))', padding: '2px 6px', borderRadius: 6 },
        table: { borderCollapse: 'collapse', width: '100%', marginBottom: 16, fontSize: 13 },
        th: { textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid ' + COLORS.border, color: COLORS.dim, fontWeight: 500 },
        td: { padding: '6px 10px', borderBottom: '1px solid ' + COLORS.border },
        tip: { marginTop: 20, padding: '10px 14px', borderRadius: 10, background: 'var(--dsw-alias-bg, rgba(79,124,255,.06))', color: COLORS.dim, fontSize: 12.5 },
      }

      var TOOLS = [
        ['besson_tutorial_lookup', '按关键词检索 217 篇教程章节'],
        ['besson_tutorial_index', '系列总览 / 数据健康 / 生态现状'],
        ['besson_tutorial_series', '列某系列全部章节或单章详情'],
        ['besson_tutorial_fetch', '抓取一篇文章正文（url 或 query）'],
        ['besson_tutorial_plan', '按目标生成学习路线'],
        ['besson_tutorial_compare', '两个系列/版本的工程与 API 对比'],
        ['besson_tutorial_env', '环境搭建清单（JDK/Gradle/模板）'],
        ['besson_mod_project', '检查本地模组工程：加载器/版本/清单/常见问题'],
        ['besson_mod_migrate', '跨系列迁移清单（映射/注册/事件差异）'],
      ]

      var SERIES = [
        ['A', 'Fabric 1.20.1', 'Java 17', '55 章'],
        ['B', 'Fabric 1.21.X', 'Java 21', '57 章'],
        ['C', 'Forge 1.20.1', 'Java 17', '38 章'],
        ['D', 'NeoForge 1.21.1', 'Java 21', '32 章'],
        ['E', 'Fabric 26.1', 'Java 25', '30 章'],
        ['F', 'NeoForge 26.1', 'Java 25', '待开'],
      ]

      var PITFALLS = [
        'JAVA_HOME 指错版本 → gradle 报 class 版本不匹配',
        'gradle 首次拉依赖很慢 → 配镜像或耐心等，别中断',
        'mods.toml / neoforge.mods.toml / fabric.mod.json 写错 → 模组不加载',
        '改完注册代码没重启客户端 → 看不到新内容（注册在启动期）',
        '用 26.1 的 API 写 1.21.1 的工程 → 编译不过（对照 compare 工具）',
      ]

      function Page() {
        return h(
          'div',
          { style: S.page },
          h('h1', { style: S.title }, '北山 Besson · 模组开发助手'),
          h('p', { style: S.sub }, '教程检索 + 学习路线 + 版本矩阵 + 工程体检 + 迁移清单，一套工具辅助从入门到进阶的 Fabric / Forge / NeoForge 开发。'),
          h(
            'div',
            { style: S.grid },
            h(
              'div',
              { style: S.card },
              h('div', { style: S.cardTitle }, '开始之前'),
              h('div', { style: S.dim }, '先告诉 AI 你的目标，例如：'),
              h('div', { style: { marginTop: 8 } }, h('code', { style: S.code }, '“用 besson 工具帮我搭一个 1.21.1 NeoForge 模组环境并注册第一个物品”')),
              h(
                'div',
                { style: { marginTop: 10 } },
                h('a', { style: { color: COLORS.accent }, href: 'https://beishanair.github.io/', target: '_blank', rel: 'noreferrer' }, '教程站 Tomorrow-Land ↗'),
                h('span', { style: S.dim }, ' · '),
                h('a', { style: { color: COLORS.accent }, href: 'https://github.com/QZyme/Besson-Tools', target: '_blank', rel: 'noreferrer' }, '仓库 ↗')
              )
            ),
            h(
              'div',
              { style: S.card },
              h('div', { style: S.cardTitle }, '工具速查'),
              h(
                'table',
                { style: S.table },
                h(
                  'tbody',
                  null,
                  TOOLS.map(function (t) {
                    return h('tr', { key: t[0] }, h('td', { style: S.td }, h('code', { style: S.code }, t[0])), h('td', { style: S.td }, t[1]))
                  })
                )
              )
            )
          ),
          h(
            'table',
            { style: S.table },
            h('thead', null, h('tr', null, h('th', { style: S.th }, '系列'), h('th', { style: S.th }, 'Loader / MC'), h('th', { style: S.th }, 'Java'), h('th', { style: S.th }, '已开章节'))),
            h(
              'tbody',
              null,
              SERIES.map(function (s) {
                return h('tr', { key: s[0] }, h('td', { style: S.td }, s[0]), h('td', { style: S.td }, s[1]), h('td', { style: S.td }, s[2]), h('td', { style: S.td }, s[3]))
              })
            )
          ),
          h('div', { style: { marginTop: 22, fontSize: 13.5, fontWeight: 600, marginBottom: 8 } }, '常见坑'),
          h(
            'ul',
            { style: { margin: 0, paddingLeft: 20, color: COLORS.dim } },
            PITFALLS.map(function (p) {
              return h('li', { key: p, style: { marginBottom: 4 } }, p)
            })
          ),
          h('div', { style: S.tip }, '数据与 beishanair.github.io 同步（2026-11-07：217 篇）。工具在任意对话可用；本页仅指南。')
        )
      }

      function Icon(props) {
        var size = typeof props.size === 'number' ? props.size : 18
        return h(
          'svg',
          { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' },
          h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 3, stroke: 'currentColor', strokeWidth: 1.6 }),
          h('path', { d: 'M7 9h10M7 13h6', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }),
          h('circle', { cx: 17.2, cy: 16.6, r: 2.2, fill: 'currentColor' })
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
