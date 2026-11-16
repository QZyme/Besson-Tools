window.__ModuleLoader__.load({
  id: 'dsh-besson-tools',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const PANEL_ID = 'besson-moddev'

    const COLORS = {
      bg: 'var(--dsw-alias-bg-base, #1b1c1e)',
      card: 'var(--dsw-alias-bg-elevated, #232427)',
      border: 'var(--dsw-alias-border, #34363b)',
      text: 'var(--dsw-alias-label-primary, #eceef0)',
      dim: 'var(--dsw-alias-label-secondary, #9aa0a6)',
      accent: 'var(--dsw-alias-brand-primary, #4f8cff)',
      chip: 'var(--dsw-alias-bg-muted, #2c2e33)',
    }

    const S = {
      page: { height: '100%', overflowY: 'auto', padding: '28px 32px 40px', color: COLORS.text, fontSize: 13, lineHeight: 1.65 },
      title: { fontSize: 20, fontWeight: 650, margin: 0 },
      sub: { color: COLORS.dim, margin: '6px 0 20px' },
      grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 22 },
      card: { background: COLORS.card, border: '1px solid ' + COLORS.border, borderRadius: 10, padding: '14px 16px' },
      cardTitle: { fontSize: 13.5, fontWeight: 600, marginBottom: 6 },
      dim: { color: COLORS.dim },
      code: { fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: 12, background: COLORS.chip, padding: '2px 6px', borderRadius: 4 },
      table: { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 },
      th: { textAlign: 'left', color: COLORS.dim, fontWeight: 500, padding: '6px 10px', borderBottom: '1px solid ' + COLORS.border, whiteSpace: 'nowrap' },
      td: { padding: '6px 10px', borderBottom: '1px solid ' + COLORS.border, whiteSpace: 'nowrap' },
      a: { color: COLORS.accent, textDecoration: 'none' },
      tip: { marginTop: 18, padding: '10px 14px', borderRadius: 8, background: COLORS.chip, color: COLORS.dim },
    }

    const SERIES = [
      ['A', 'Fabric 1.20.1', 'Java 17', '55 章'],
      ['B', 'Fabric 1.21.X', 'Java 21', '57 章'],
      ['C', 'Forge 1.20.1', 'Java 17', '38 章'],
      ['D', 'NeoForge 1.21.1', 'Java 21', '32 章'],
      ['E', 'Fabric 26.1', 'Java 25', '30 章'],
      ['F', 'NeoForge 26.1', 'Java 25', '待开'],
    ]

    const TOOLS = [
      ['besson_tutorial_lookup', '关键词检索教程章节（先搜再做）'],
      ['besson_tutorial_series', '列某系列全部章节 / 取单章'],
      ['besson_tutorial_fetch', '抓取文章正文（含代码块）'],
      ['besson_tutorial_plan', '按目标生成学习路线'],
      ['besson_tutorial_compare', '两个系列/版本的工程与 API 对比'],
      ['besson_tutorial_env', '环境搭建清单（JDK/Gradle/模板）'],
      ['besson_mod_project', '检查本地模组工程：加载器/版本/清单/常见问题'],
      ['besson_mod_migrate', '跨系列迁移清单（映射/注册/事件差异）'],
      ['besson_01', '多步骤开发计划：输入目标输出逐步执行指令'],
    ]

    const PITFALLS = [
      'JAVA_HOME 指错版本 → gradle 报 class 版本不匹配',
      'gradle 首次拉依赖很慢 → 配镜像或耐心等，别中断',
      'mods.toml / neoforge.mods.toml / fabric.mod.json 写错 → 模组不加载',
      '改完注册代码没重启客户端 → 看不到新内容（注册在启动期）',
      '版本号用 26.1 的 API 写 1.21.1 的工程 → 编译不过（对照 compare 工具）',
    ]

    function Page() {
      return h('div', { style: S.page },
        h('h1', { style: S.title }, '北山 Besson · 模组开发助手'),
        h('p', { style: S.sub }, '教程检索 + 学习路线 + 版本矩阵 + 工程体检 + 迁移清单，一套工具辅助从入门到进阶的 Fabric / Forge / NeoForge 开发。'),
        h('div', { style: S.grid },
          h('div', { style: S.card },
            h('div', { style: S.cardTitle }, '开始之前'),
            h('div', { style: S.dim }, '先告诉 AI 你的目标，例如：'),
            h('div', { style: { marginTop: 8 } },
              h('code', { style: S.code }, '“用 besson 工具帮我搭一个 1.21.1 NeoForge 模组环境并注册第一个物品”')),
            h('div', { style: { marginTop: 10 } },
              h('a', { style: S.a, href: 'https://beishanair.github.io/', target: '_blank', rel: 'noreferrer' }, '教程站 Tomorrow-Land ↗'),
              h('span', { style: S.dim }, ' · '),
              h('a', { style: S.a, href: 'https://github.com/QZyme/Besson-Tools', target: '_blank', rel: 'noreferrer' }, '仓库 ↗')),
          ),
          h('div', { style: S.card },
            h('div', { style: S.cardTitle }, '工具速查'),
            h('table', { style: S.table },
              h('tbody', null, ...TOOLS.map(([name, desc]) => h('tr', { key: name },
                h('td', { style: S.td }, h('code', { style: S.code }, name)),
                h('td', { style: S.td }, desc))))))),
        ),
        h('table', { style: S.table },
          h('thead', null, h('tr', null,
            h('th', { style: S.th }, '系列'), h('th', { style: S.th }, 'Loader / MC'),
            h('th', { style: S.th }, 'Java'), h('th', { style: S.th }, '已开章节'))),
          h('tbody', null, ...SERIES.map(([id, name, java, ch]) => h('tr', { key: id },
            h('td', { style: S.td }, id), h('td', { style: S.td }, name),
            h('td', { style: S.td }, java), h('td', { style: S.td }, ch))))),
        h('div', { style: { marginTop: 22, fontSize: 13.5, fontWeight: 600, marginBottom: 8 } }, '常见坑'),
        h('ul', { style: { margin: 0, paddingLeft: 20, color: COLORS.dim } },
          ...PITFALLS.map((p) => h('li', { key: p, style: { marginBottom: 4 } }, p))),
        h('div', { style: S.tip }, '数据与 beishanair.github.io 同步（2026-11-07：217 篇）。工具在任意对话可用；本页仅指南。'),
      )
    }

    function Icon({ size }) {
      const s = typeof size === 'number' ? size : 18
      return h('svg', { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' },
        h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 3, stroke: 'currentColor', strokeWidth: 1.6 }),
        h('path', { d: 'M7 9h10M7 13h6', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }),
        h('circle', { cx: 17.2, cy: 16.6, r: 2.2, fill: 'currentColor' }))
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
        }, Page))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 10,
          label: () => '北山 Besson 模组助手',
        }, Icon))
      },
    }
  },
})
