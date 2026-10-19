# 北山Besson 教程检索 · skill · mcp · plugin

[![release](https://img.shields.io/github/v/release/QZyme/Besson-Tools)](https://github.com/QZyme/Besson-Tools/releases/latest)
[![license](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-4c1)](LICENSE)
[![last commit](https://img.shields.io/github/last-commit/QZyme/Besson-Tools)](https://github.com/QZyme/Besson-Tools/commits/main)
[![site](https://img.shields.io/badge/site-Tomorrow--Land-0078d7)](https://beishanair.github.io/)

> 北山Besson（BeiShan_Besson）Minecraft 模组开发教程站 [Tomorrow-Land](https://beishanair.github.io/) 的检索体系：
> **DSH 技能（skill）· MCP 服务器（mcp）· DSH 插件（plugin）** 三件套（v2.0.0，适配 DeepSeek Harness 0.2.1-rc.2+）
> 数据同步日期：**2026-10-19**（站点文章 195 篇全覆盖：章节 190 + 独立文章 4 + 总汇页 1）
> 站点：https://beishanair.github.io/ · 作者 B站：[@北山Besson](https://space.bilibili.com/489671468) · GitHub：[BeiShanair](https://github.com/BeiShanair)

## 目录结构

```
Besson-Tools/
├── README.md                        # 本文件
├── LICENSE                          # CC BY-NC-SA 4.0
├── skill/                           # ① DSH 技能（SKILL 技能文件，也可作为任何 Agent 的知识库）
│   ├── SKILL.md                     #    技能主文件：快速路由 + 环境矩阵 + 迁移指南 + 坑点 + FAQ + 195 篇索引
│   └── references/
│       └── version-matrix.md        #    版本矩阵（JDK/Loader/构建系统，官方源核实）
├── mcp/                             # ② MCP 服务器（任何支持 MCP 的客户端都能用）
│   ├── mcp-server.mjs               #    stdio（默认）或 HTTP（--http）双模式，7 个工具
│   ├── test-client.mjs              #    stdio 端到端测试
│   ├── test-http.mjs                #    HTTP 冒烟测试
│   └── package.json                 #    依赖清单（Release 的 mcp 包已自带）
├── dsh-plugin/                      # ③ DeepSeek Harness（DSH）插件
│   ├── besson-tools.mjs             #    插件本体（零依赖，注册 7 个工具，v2.0.0）
│   ├── preset-files/                #    整预设安装时需要的文件
│   │   └── preset.yml               #    预设元数据（名称/描述）
│   └── agent.cordis.yml.snippet     #    往现有预设追加插件行时复制此片段
└── tools/
    ├── index_data.json              # 教程索引数据（脚本与 MCP 服务器共用）
    ├── sync-data.mjs                # 站点数据更新脚本（重新生成 index_data.json / besson-tools.mjs）
    ├── epic_skill.js                # 技能史诗化脚本（把增强章节注入 SKILL.md，保留 195 条链接）
    └── plugin-test.mjs              # 插件全工具冒烟测试（模拟 DSH registry）
```

## ① 作为 DSH 技能使用（skill）

> 适用 DSH 0.2.1-rc.2+（技能发现根：用户级 `~/.dsh/skills/`、项目级 `<workspace>/.dsh/skills/`）

```bash
# 把 skill/ 安装到用户级技能目录（推荐，DSH 会自动发现）
cp -r skill ~/.dsh/skills/besson-tutorials
#   或安装到某个预设/项目目录：
#   cp -r skill <workspace>/.dsh/skills/besson-tutorials
```

v2.0.0 技能内容（史诗级）：

- **快速路由**：按「入门/1.21.1/最新版/专题/迁移」直接给出路线与章节锚点
- **版本环境矩阵**：MC 版本 × Loader × JDK × 构建插件 × mod 清单 × 注册/事件方式
- **迁移指南**：Forge→NeoForge、1.20.1→1.21.1、1.21.1→26.1 的包名/清单/构建/注册差异
- **标准工作流 + 高频坑点 Top 10 + 生态速查 + FAQ + 7 工具用法**
- 保留完整 195 篇文章索引（A-F 六系列 + 4 篇独立文章 + 总汇页）

使用效果：加载后直接掌握教程站全部 195 篇文章的索引，能按"版本 + 主题"给出教程链接、
按目标生成学习路线、对比不同版本工程差异、生成环境搭建清单，并抓取文章正文。

## ② 作为 MCP 服务器使用（mcp）

```bash
cd mcp
node mcp-server.mjs  # stdio 模式（默认；Release 的 besson-mcp 包已自带依赖，解压即用）
node mcp-server.mjs --http   # HTTP 模式（环境变量 PORT，默认 3987）
```

MCP 服务器提供 **7 个工具**：

| 工具 | 作用 | 示例参数 |
|------|------|----------|
| `besson_tutorial_lookup` | 关键词检索章节 | `query: "NeoForge 生物群系"`, `limit: 8` |
| `besson_tutorial_index` | 系列总览 + 生态现状 + 数据健康 | 无参数 |
| `besson_tutorial_series` | 单系列全部章节 / 单章详情 | `series: "D"` 或 `series: "D", chapter: "44"` |
| `besson_tutorial_fetch` | **抓取正文**（可按关键词自动解析） | `query: "流体"` 或 `url: "…/nf121/33fluid/"`，`maxChars: 6000` |
| `besson_tutorial_plan` | **按目标生成学习路线**（新手/进阶/迁移/26.1） | `goal: "NeoForge 进阶 网络包"` |
| `besson_tutorial_compare` | **两系列/版本工程与 API 差异对比** | `a: "A", b: "D"` |
| `besson_tutorial_env` | **环境搭建清单与命令**（JDK/Gradle/模板/坑） | `mcVersion: "1.21.1", loader: "neoforge"` |

`besson_tutorial_fetch` 例：传 `query` 时按本地索引自动解析最匹配的一篇并抓取；传 `url` 时直接抓取该页。
返回标题、正文纯文本（含代码块）与字节数；仅接受 `beishanair.github.io` 站内 https 链接，可用 `maxChars` 限制返回长度。

客户端配置示例（stdio）：

```json
{
  "mcpServers": {
    "besson-tutorials": {
      "command": "node",
      "args": ["/path/to/Besson-Tools/mcp/mcp-server.mjs"],
      "env": { "BESSON_DATA_PATH": "/path/to/Besson-Tools/tools/index_data.json" }
    }
  }
}
```

HTTP 模式接入地址：`http://127.0.0.1:3987/mcp`（Streamable HTTP，会话由 `mcp-session-id` 头管理）。

自带测试：`node test-client.mjs`（stdio 端到端）与 `node test-http.mjs`（HTTP 冒烟）。

## ③ 作为 DeepSeek Harness（DSH）插件使用（plugin）

> v2.0.0 起同时支持 **DSH 0.1.x（预设目录内 `.agent-presets`）** 与 **0.2.1-rc.2+ 的声明式预设**（profile 内 `cordis.yml` 的 preset 行 + 本地包）。

### 方式 0：插件栏一键安装（推荐，DSH 0.2.1+）

插件已发布为独立 bundle 包仓库（插件栏可识别）：**https://github.com/QZyme/dsh-besson-tools**

1. DSH → 插件栏 → 「添加插件」
2. 输入 GitHub 仓库地址：
   `https://github.com/QZyme/dsh-besson-tools`
   （或本仓库源码目录、或本包解压目录）
3. 安装后（bundle 形态）重启或新开会话即可使用 7 个 `besson_tutorial_*` 工具

> 注意：插件栏安装为**全局挂载**（所有会话可用）。若只想在 Besson 预设里使用，请用方式 B（预设行挂载）；两种方式不要同时启用，避免重复注册。

### 方式 A：整预设安装（整套预设，开箱即用）

把 `dsh-plugin/preset-files/preset.yml` 与 `dsh-plugin/besson-tools.mjs` 放入：

```
~/.dsh/.agent-presets/<你的预设id>/
├── agent.cordis.yml     # 在文件末尾追加 agent.cordis.yml.snippet 的内容
├── preset.yml           # ← 来自本包 preset-files/
└── besson-tools.mjs     # ← 来自本包
```

在 DSH Web 新建会话时选择该预设即可。

### 方式 B：0.2.1+ 声明式预设（本地包挂载）

1. 新建本地包目录（如 `~/dsh-besson-tools/` 或任意目录），放入：

```
package.json        # name: dsh-besson-tools, version: 2.0.0, type: module, main: besson-tools.mjs
besson-tools.mjs    # ← 来自本包 dsh-plugin/
```

2. 在 DSH profile（`~/.dsh/profiles/<profile>/`）的 `package.json` 依赖里声明本地包：

```json
"dsh-besson-tools": "file:<本地包目录>"
```

然后在 DSH 中重新安装该 profile 的依赖（DSH 插件管理里会有提示）。

3. 在 profile 的 `cordis.yml` 中给预设加一行（示例，与 preset-besson 一致）：

```yaml
- id: besson-tools
  name: dsh-besson-tools
```

4. 重启 DSH，在会话预设中选择 `besson`。工具注册名会以 `besson_tutorial_*` 出现（0.2.1 的 per-agent 工具作用域）。

### 方式 C：只给现有预设加工具（0.1.x 旧式预设）

1. 把 `besson-tools.mjs` 复制到你的预设目录（与 `agent.cordis.yml` 同级）
2. 在 `agent.cordis.yml` 末尾追加 `agent.cordis.yml.snippet` 中的内容
3. 重启会话即可拥有 7 个工具（v2.0.0）

### 工具清单（插件与 MCP 完全一致，7 个）

| 工具 | 作用 |
|------|------|
| `besson_tutorial_lookup` | 关键词检索章节（版本/Loader/章节号/主题） |
| `besson_tutorial_index` | 六大系列总览 + 版本 + Java + 缺号 + 生态现状（数据健康） |
| `besson_tutorial_series` | 单系列（A-F）全部章节列表 / 单章详情 |
| `besson_tutorial_fetch` | 抓取教程正文（关键词自动解析或直接 url，仅限站内 https） |
| `besson_tutorial_plan` | 按目标生成学习路线（新手/进阶/neoforge/forge/迁移/26.1） |
| `besson_tutorial_compare` | 两系列/版本工程与 API 差异对比 |
| `besson_tutorial_env` | 某 MC 版本 + Loader 的环境搭建清单与命令 |

系列字母：A=Fabric 1.20.1（Java 17）、B=Fabric 1.21.X（Java 21）、C=Forge 1.20.1（Java 17）、
D=NeoForge 1.21.1（Java 21）、E=Fabric 26.1（Java 25）、F=NeoForge 26.1（待开）。

> 提示：`besson_tutorial_index` 返回 `version` 字段（当前 2.0.0）与 `dataHealth`（正常 `totalChapters=190`），可确认运行版本与数据完好。

## 数据维护（站点更新后）

```bash
node tools/sync-data.mjs          # 从站点重新抓取 → 重新生成 index_data.json / besson-tools.mjs
node tools/epic_skill.js          # 重新生成技能史诗章节（保留链接），同步日期从 index_data.json 读取
```

脚本会自动抓取站点归档页/标签页，重建完整索引并注入插件模块。技能文件 `skill/SKILL.md`
的 195 条链接表格保持不变，史诗章节由 `epic_skill.js` 注入。

## 故障排查（插件"检索不到内容/返回 0 条"）

1. 用仓库 `dsh-plugin/besson-tools.mjs`（或 Release 最新 `besson-plugin-v2.0.0.zip`）
   覆盖安装位置的文件：
   - 0.1.x 旧式预设：`~/.dsh/.agent-presets/<你的预设id>/besson-tools.mjs`
   - 0.2.1+ 本地包：`<本地包目录>/besson-tools.mjs`（profile 内 `dsh.profile.bundles`/dependencies 安装的副本）
2. **重启 DSH**（预设常驻挂载会缓存旧文件，必须重启才加载新文件）
3. 新会话 → 调 `besson_tutorial_index`，看返回的 **`dataHealth`**：
   - `totalChapters = 190` 且 `sampleTitle` 是正常中文 → 数据完好
   - `totalChapters = 0` 或 `sampleTitle` 乱码（如 `寮€鍙戠幆澧?`）→ 安装时文件编码被破坏，覆盖上面的文件即可修复
4. 再调 `besson_tutorial_lookup`（如 `query: "流体"`）→ 应命中 4 条

> 提示：`besson_tutorial_lookup` 返回含 `indexed` 字段（正常应为 194），可即时确认数据是否加载。

## 已知站点注意事项（内置在数据中）

- 站点「教程总汇」页部分章节列表滞后，**以实际文章为准**
- 章节编号存在空缺：Forge C 缺 #22~#27；NeoForge D 缺 #13~#24；Fabric B 无 #54
- D39「矿物的世界生成」站点标题误标 1.20.1，实为 1.21.1
- F 系列（NeoForge 26.1）站内尚未开更（Fabric 26.1 的 E 系列已开 8 篇）
- 最新版本：MC 26.2（26.1.1/26.1.2 已发）；Fabric Loader 0.19.3；NeoForge 26.1 于 2026-03 适配

## 版本历史

- **v2.0.0（2026-10-19）**：史诗级增强 —— 插件与 MCP 各 7 工具（新增 plan/compare/env）；技能新增快速路由、环境矩阵、迁移指南、坑点 Top 10、FAQ、工具链；适配 DSH 0.2.1-rc.2（声明式预设 + 本地包挂载 + skill-filesystem 技能目录）；数据同步 2026-10-19（195 篇）
- **v1.1.1**：版本号统一、数据同步 2026-10-03
- **v1.1.0**：MCP/插件新增 `besson_tutorial_fetch` 正文抓取
- **v1.0.0**：首版（lookup/index/series）

## 许可

本包数据源自 [Tomorrow-Land](https://beishanair.github.io/)，遵循站点声明的
**CC BY-NC-SA 4.0**（署名-非商业性使用-相同方式共享），见 [LICENSE](LICENSE)。
转载/分发请保留来源署名。
