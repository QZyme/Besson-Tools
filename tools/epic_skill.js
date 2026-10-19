// 把史诗级章节（快速路由/环境矩阵/迁移/工作流/坑点/生态/FAQ/工具链）插入 SKILL.md
// 保留原 195 条链接表格不动；同步日期自动从 tools/index_data.json 读取。
import { readFileSync, writeFileSync } from 'node:fs';

const repo = 'C:/Users/12899/Desktop/Besson Skill/Besson-Skill-Mcp-Plugin';
const skillPath = repo + '/skill/SKILL.md';
let md = readFileSync(skillPath, 'utf8');
const data = JSON.parse(readFileSync(repo + '/tools/index_data.json', 'utf8'));
const synced = data.synced || '2026-10-19';

const EPIC = `
## 🎯 快速路由（先定位，再动手）

| 你的需求 | 建议路线 | 说明 |
|---|---|---|
| 第一次写模组 / 入门 | **A**（Fabric 1.20.1）或 **C**（Forge 1.20.1），从 #1 起 | 1.20.1 中文资料最全、生态最稳，先跑通再加功能 |
| 在 1.21.1 上开发 / NeoForge | **D**（NeoForge 1.21.1），从 #1 起（环境搭建在 #3） | NeoForge 是 1.21.1 主流；D#6 网络、D#33 流体等是进阶重点 |
| 追最新版 26.1 / 26.2 | **E**（Fabric 26.1，已开 8 篇）；**F**（NeoForge 26.1）站内未开 | JDK 25；NeoForge 26.1 官方 2026-03 已适配，可对照官方文档 |
| 网络包 / 渲染 / 粒子 / GUI 等专题 | **C#39-44 / D#39-44** 对应章节 + 对应系列前 15 章基础 | 专题章依赖注册、事件、数据生成基础 |
| 从 1.20.1 迁移到 1.21.1 | 先 **A** 前 15 章打底，再转 **D**；重点读各系列「环境/迁移」章 | 见下方迁移指南；包名/事件/注册方式差异最大 |
| 查具体标题/API 关键词 | 用 \`besson_tutorial_lookup\`（先搜再做，最多 1-3 条） | 系列字母 + 版本 + 主题词组合检索最准 |
| 要正文/代码细节 | 用 \`besson_tutorial_fetch\` 抓正文（按 query 自动解析） | 正文含代码块；一次只抓 1-2 篇 |
| 列某系列全部章节 | 用 \`besson_tutorial_series\`（含缺号与日期） | 先看缺号，避免白找 |

**通用原则：先搜索定位 → 再抓正文 → 再动手写代码；跨版本先 \`besson_tutorial_compare\` + \`besson_tutorial_env\`。**

## 🧭 版本与环境矩阵

| MC 版本 | Loader | JDK | 构建插件 | mod 清单 | 主类入口 | 注册方式 | 事件系统 |
|---|---|---|---|---|---|---|---|
| 1.20.1 | Fabric | **17** | fabric-loom | fabric.mod.json | ModInitializer | Registry.register + 静态字段 | fabric-events |
| 1.20.1 | Forge | **17** | ForgeGradle | mods.toml | @Mod + IEventBus | DeferredRegister + RegisterEvent | @SubscribeEvent |
| 1.21.X | Fabric | **21** | fabric-loom | fabric.mod.json | ModInitializer | Registry.register + 静态字段 | fabric-events |
| 1.21.1 | NeoForge | **21** | NeoGradle / ModDevGradle | neoforge.mods.toml | @Mod + IEventBus | DeferredRegister(DeferredHolder) | @SubscribeEvent |
| 26.1 | Fabric | **25** | fabric-loom | fabric.mod.json | ModInitializer（API 收缩期，以 E 系列为准） | Registry.register | fabric-events |
| 26.1 | NeoForge | **25** | NeoGradle / ModDevGradle | neoforge.mods.toml | @Mod + IEventBus | DeferredRegister | @SubscribeEvent |

要点：
- **JDK 严格对应**：1.20.1=17、1.21.x=21、26.1=25。装错 JDK 会在 Gradle 构建时类版本报错。
- 数据生成（datagen）：Forge/NeoForge 用 GatherDataEvent，Fabric 用 FabricDataGenerator；生成后记得复制到 src 目录。
- 官方 GitHub 仓库（模板）：A/B/C 用 [TutorialMod-1.20.1](https://github.com/BeiShanair/TutorialMod-1.20.1)；D 用 [Tutorial-Mod-1.21.1-NeoForge](https://github.com/BeiShanair/Tutorial-Mod-1.21.1-NeoForge)；E 用 [Tutorial-Mod-26.1-Fab](https://github.com/BeiShanair/Tutorial-Mod-26.1-Fab)；F 待开（Tutorial-Mod-26.1-Neo 已建但站内无教程）。

## 🔁 版本迁移指南（1.20.1 → 1.21.x → 26.1）

**Forge → NeoForge（同为 1.20.1/1.21.1）**
1. 包名：\`net.minecraftforge.*\` → \`net.neoforged.*\`（\`@Mod\`、\`@EventBusSubscriber\` 所在包变化）。
2. mod 清单：\`META-INF/mods.toml\` → \`META-INF/neoforge.mods.toml\`（挂载字段版本号）。
3. 构建：ForgeGradle → NeoGradle 或 ModDevGradle；Gradle 插件版本与 MC 版本对齐。
4. 注册：DeferredRegister 语义不变（Fabric 路由用项目自带的 Flamgop 风格注册器时注意迁移到官方方式或 Architectury）。

**1.20.1 → 1.21.1（Fabric 内升级）**
- Loom 与 Yarn 映射升级；部分 API（如 Recipe/DataComponents）在 1.21 后变化，按 B 系列章节操作。
- Fabric 事件回调注册方式不变，但部分类名迁移，以 B 系列对应章节为准。

**1.21.1 → 26.1**
- JDK 21 → 25；构建工具链同步升级（Loom/NeoGradle 版本）。
- 26.1 处于 API 收缩期，先以 E 系列（Fabric 26.1，8 篇已开）为参照，F 系列开更后以 F 为准。
- 迁移最稳的路径：保留 1.20.1 项目 → 跑通 A 前 15 章 → 新建 1.21.1 工程（D）复刻 → 再上 26.1。

**章节锚点**：A#51 recipeType、A#52 rei、A#53 网络包、A#54 精炼炉（等级系统）、A#55 罐装机（流体）；B#51 recipeType、B#52 rei、B#53 网络包；D#4 方块/物品注册、D#6 网络、D#33 流体。

## 🧪 标准开发工作流（每次动手都按此顺序）

1. **环境自检**（对应各系列「环境/搭建」章）：JDK 版本、Gradle 同步、IDE 运行 runClient。
2. **设计**：先查生态（JEI/REI/EMI、AE2、Create）是否已有现成 API，避免重复造轮子。
3. **编码**：注册（物品/方块/实体/流体）→ 数据生成（模型/配方/标签）→ 资源（贴图/语言文件）。
4. **运行**：\`gradlew runClient\` 验证；模组加载失败先看 latest.log 第 10 行起。
5. **调试**：网络包问题用日志打印方向与 handler 线程；渲染问题检查 RenderType。
6. **发布**：Gradle \`build\` → mods 文件夹确认 jar 内含 fabric.mod.json/mods.toml。
7. **验证新环境**：换 JDK/版本组合时先跑 \`besson_tutorial_env\` 生成清单，再按清单执行。

## ⚠️ 高频坑点 Top 10

1. 注册早于启动顺序 → 静态字段初始化时机错，进游戏空指针。
2. \`fabric.mod.json\`/\`neoforge.mods.toml\` 的 \`loader\` 或版本字段写错 → 游戏不加载模组。
3. 资源文件没放进 \`assets/<modid>/\` → 模型/贴图全紫黑。
4. datagen 生成文件后没拷回 \`src/main/resources\` → 游戏里内容缺失。
5. 网络包 handler 在非主线程改世界 → 随机崩溃（必须切主线程处理）。
6. 事件订阅类忘注册（Forge/NeoForge 的 \`@Mod\` 事件总线 / Fabric 回调）→ 逻辑不触发。
7. 流体/渲染的 RenderType 或模型 JSON 不匹配 → 方块透明/不渲染。
8. 维度注册顺序错（worldgen 注册器、DimensionType 依赖顺序）→ 传送门进不去。
9. REI/JEI 插件未注册 → 在配方查看器里看不到新机器/配方。
10. Mixin 在开发环境用 Yarn 名、打包后要混淆映射名 → 线上失效（用 loom 的 remap 流程）。

## 📚 生态速查

- **JEI / REI / EMI**：配方查看器集成，B、C、D 系列各有专章（recipeType、rei 插件）。
- **AE2 / Create**：大型模组 API 对接时先 \`besson_tutorial_lookup\` 检索「AE2」「Create」相关章节。
- **Architectury**：多 Loader 工程用 Architectury 抽象；站内暂无专章，可对照官方文档 + 系列 B/D 差异。
- **Mixin**：核心注入技术，A/B 系列的进阶章节 + 各版本 mixin 配置差异；注意映射（Yarn/官方）差异。

## 🆘 常见问题（FAQ）

- **站点总汇页（/2099/12/31/sum/）列表滞后？** 正常。以实际文章为准（工具 \`besson_tutorial_index\` 的 dataHealth 校验 190 章）。
- **C#22-27、D#13-24 找不到？** 本站未发布，非遗漏。B 无 #54（编号跳号）。F 系列（NeoForge 26.1）尚未开更。
- **最新版本状态**：MC 26.2（26.1.1/26.1.2 已发，26.3 快照中）；Fabric Loader 0.19.3；NeoForge 26.1 于 2026-03 适配。
- **工具返回空？** 先跑 \`besson_tutorial_index\` 看 dataHealth：totalChapters=190 且中文正常 = 数据正常；0 或乱码 = 文件编码损坏，重新安装技能包。
- **想离线用？** 索引是预制的（index_data.json/内嵌），只有 \`fetch\` 抓正文需要联网。

## 🛠 工具链（DSH 插件 / MCP，7 工具）

| 工具 | 用途 | 何时用 |
|---|---|---|
| \`besson_tutorial_lookup\` | 关键词检索章节 | 每次动手前先搜 |
| \`besson_tutorial_index\` | 系列/版本/数据健康总览 | 会话开始、排查空结果 |
| \`besson_tutorial_series\` | 列系列全部章节/单章 | 规划学习顺序、查缺号 |
| \`besson_tutorial_fetch\` | 抓一篇文章正文 | 要代码细节时抓 1-2 篇 |
| \`besson_tutorial_plan\` | 按目标生成学习路线 | 新手/进阶/迁移/26.1 |
| \`besson_tutorial_compare\` | 两系列工程/API 差异对比 | 跨版本/跨 Loader 前 |
| \`besson_tutorial_env\` | 环境搭建清单与命令 | 新建工程/换 JDK 前 |

> 插件与 MCP 两套实现能力一致；插件随 DSH 预设（besson-tools 行）常驻，MCP 适合接入其他客户端（Claude Desktop/Cursor 等）。

`;

// 1) 插入史诗区块（在「教程系列总览」之前）
const marker = '## 📋 教程系列总览';
const idx = md.indexOf(marker);
if (idx < 0) throw new Error('未找到系列总览标题，无法插入');
md = md.slice(0, idx) + EPIC.trim() + '\n\n' + md.slice(idx);

// 2) 更新同步日期与总数
md = md.replace(/最后与站点同步校验:\*\*\s*\d{4}-\d{2}-\d{2}（文章总数 195）/,
  `最后与站点同步校验:** ${synced}（文章总数 195：章节 190 + 独立文章 4 + 总汇页 1）`);

// 3) 扩展 description（若尚未包含史诗能力描述）
if (!md.includes('版本矩阵')) {
  md = md.replace(/description: (.+)/, 'description: $1；含快速路由、版本环境矩阵、迁移指南、坑点与 FAQ、工具链用法（besson_tutorial_* 七工具）');
}

writeFileSync(skillPath, md, 'utf8');
const links = (md.match(/https:\/\/beishanair\.github\.io\//g) || []).length;
console.log('OK 写回 skill/SKILL.md，行数:', md.split('\n').length, '| beishanair 链接出现次数:', links, '| synced:', synced);
