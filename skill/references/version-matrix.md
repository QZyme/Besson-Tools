# 版本矩阵 & 环境配置参考

> 根据北山Besson教程「开发环境配置」章节整理
>
> **社区核实（2026-10-03，Mojang 官方版本清单 `javaVersion` 字段）：**
> 1.20.1 → Java 17（java-runtime-gamma）· 1.21/1.21.1 → Java 21（java-runtime-delta）· 26.1 → **Java 25**（java-runtime-epsilon）

## 各系列技术栈

| 系列 | MC 版本 | Java | Loader API | 构建系统 | 映射方案 | 模板工具 |
|------|---------|------|-----------|---------|---------|---------|
| Fabric 1.20.1 | 1.20.1 | JDK 17 | Fabric Loader 0.19.x（当前 0.19.3） | Fabric Loom 1.5+ | Yarn (默认) | [Fabric MC之道](https://fabricmc.net/) |
| Fabric 1.21.X | 1.21~1.21.1 | JDK 21 | Fabric Loader 0.19.x（当前 0.19.3） | Fabric Loom 1.7+ | Yarn (默认) | [Fabric MC之道](https://fabricmc.net/) |
| Forge 1.20.1 | 1.20.1 | JDK 17 | MDK 46.0.14+ | ForgeGradle 6.x | Official (Mojmap) | [Forge MDK](https://files.minecraftforge.net/net/minecraftforge/forge/) |
| NeoForge 1.21.1 | 1.21~1.21.1 | JDK 21 | NeoForge | ModDevGradle | Official (Mojmap) | [NeoForge](https://neoforged.net/) |
| Fabric 26.1 | 26.1 | JDK 25（自 26.1 起 MC 改用 Java 25） | Fabric Loader（26.1 已支持） | Fabric Loom | Yarn | [Fabric MC之道](https://fabricmc.net/) |
| NeoForge 26.1 | 26.1 | JDK 25（自 26.1 起 MC 改用 Java 25） | NeoForge（官方 2026-03 起已适配） | ModDevGradle | Official (Mojmap) | [NeoForge](https://neoforged.net/) |

## 关键链接

### 开发工具下载
- **JDK:** [Oracle JDK 下载](https://www.oracle.com/java/technologies/downloads/)
- **IDEA:** [IntelliJ IDEA Community 下载](https://www.jetbrains.com/idea/download/)
- **Blockbench（模型制作）:** https://www.blockbench.net/

### 模组模板生成
- **Fabric:** https://fabricmc.net/ → 点击「MC之道」→ 生成模板
- **Forge:** https://files.minecraftforge.net/net/minecraftforge/forge/ → 选择版本 → MDK → `gradlew`
- **NeoForge:** https://neoforged.net/ → 下载模板

## 三大Loader运作逻辑（来自教程原文）

### Fabric
- **最轻量级**，本身是一个 **Mixin**，通过 Mixin 将模组注入到游戏中
- Mixin 最早由 Sponge 项目提出，在 Fabric 中广泛运用
- 对游戏的破坏很小，游戏运行较为稳定
- **缺点:** 没有像 Forge/NeoForge 那样多的 API，很多模块需要第三方 API 或手动写

### Forge
- 运作依赖于 **Patch（补丁）系统**
- 从字节码层面将模组加载进游戏
- 比 Mixin 更复杂，无法像 Mixin 那样模块化、细致化修改
- 后面也引入了 Mixin 作为替代

### NeoForge
- 从 1.20 开始从 Forge 中分离出来
- 高版本上 NeoForge 用得更多
- 与 Forge 共享类似的运作逻辑（Patch + 独立注册系统）
- 有自己的独立注册系统

## 生态现状快照（2026-10-03 核实）

- 当前 MC 最新正式版：**26.2**（26.1.1 / 26.1.2 已发布，26.3 快照开发中）
- Fabric Loader 当前稳定版：**0.19.3**（meta.fabricmc.net）
- NeoForge 已于 2026-03 起适配 MC 26.1（官方新闻）
- 教程站主线版本：Fabric 26.1、Forge 1.20.1、NeoForge 1.21.1、Fabric 1.20.1/1.21.X；NeoForge 26.1 系列尚未开更
- 提示：版本矩阵中的“模板工具”链接均为官方源（fabricmc.net / files.minecraftforge.net / neoforged.net）
