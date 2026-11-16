// 北山Besson（BeiShan_Besson）Minecraft 模组开发助手 · DSH 插件（v2.4.6 · 适配 DeepSeek Harness 0.2.2-rc.3）
// 数据与本仓库 skill/SKILL.md 同步（站点 217 篇文章全覆盖：章节 212 + 独立文章 4 + 总汇页 1）。
// 零依赖：只 import node 内置模块，不依赖任何 npm 包。
// 11 个工具：lookup / index / series / fetch / plan / compare / env / mod_project / mod_migrate / mod_scaffold / mod_mapping —— 检索、导航、路线规划、版本对比、环境搭建、工程体检、迁移清单、骨架生成、中文映射对照。

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { homedir } from 'node:os';

const DATA = {"site":"https://beishanair.github.io/","author":"BeiShan_Besson","synced":"2026-11-07","series":[{"id":"A","name":"Fabric 1.20.1 长线教程计划","loader":"Fabric","mc":"1.20.1","tag":"Fabric-1-20","chapters":[{"n":"1","title":"开发环境配置","url":"https://beishanair.github.io/2025/04/15/120/start120/"},{"n":"2","title":"第一个物品","url":"https://beishanair.github.io/2025/04/16/120/item120/"},{"n":"3","title":"创造模式物品栏","url":"https://beishanair.github.io/2025/04/17/120/itemgroup120/"},{"n":"4","title":"第一个方块","url":"https://beishanair.github.io/2025/04/20/120/block120/"},{"n":"5","title":"战利品列表","url":"https://beishanair.github.io/2025/04/21/120/loot120/"},{"n":"6","title":"配方","url":"https://beishanair.github.io/2025/04/22/120/recipe120/"},{"n":"7","title":"数据生成","url":"https://beishanair.github.io/2025/04/25/120/datagen120/"},{"n":"8","title":"食物","url":"https://beishanair.github.io/2025/05/06/120/food120/"},{"n":"9","title":"燃料","url":"https://beishanair.github.io/2025/05/06/120/fuel120/"},{"n":"10","title":"Tags·标签","url":"https://beishanair.github.io/2025/05/07/120/tag120/"},{"n":"11","title":"Jar打包","url":"https://beishanair.github.io/2025/05/07/120/jar120/"},{"n":"12","title":"建材类方块","url":"https://beishanair.github.io/2025/05/07/120/build120/"},{"n":"13","title":"DeepSeek IDEA部署","url":"https://beishanair.github.io/2025/05/08/120/ds120/"},{"n":"14","title":"工具","url":"https://beishanair.github.io/2025/05/08/120/tool120/"},{"n":"15","title":"自定义工具","url":"https://beishanair.github.io/2025/05/08/120/pickaxe120/"},{"n":"16","title":"工具信息","url":"https://beishanair.github.io/2025/05/09/120/tooltip120/"},{"n":"17","title":"盔甲","url":"https://beishanair.github.io/2025/05/09/120/armor120/"},{"n":"18","title":"全套盔甲效果","url":"https://beishanair.github.io/2025/05/13/120/armoreffect120/"},{"n":"19","title":"马铠","url":"https://beishanair.github.io/2025/05/13/120/horsearmor120/"},{"n":"20","title":"作物","url":"https://beishanair.github.io/2025/05/13/120/crop120/"},{"n":"21","title":"多方块作物","url":"https://beishanair.github.io/2025/05/14/120/twohighcrop120/"},{"n":"22","title":"村民交易","url":"https://beishanair.github.io/2025/05/14/120/trade120/"},{"n":"23","title":"自定义村民","url":"https://beishanair.github.io/2025/05/15/120/villager120/"},{"n":"24","title":"声音事件","url":"https://beishanair.github.io/2025/05/16/120/sound120/"},{"n":"25","title":"音乐唱片","url":"https://beishanair.github.io/2025/05/16/120/musicdisc120/"},{"n":"26","title":"Blockbench模型","url":"https://beishanair.github.io/2025/05/16/120/blockbench120/"},{"n":"27","title":"方块朝向","url":"https://beishanair.github.io/2025/05/19/120/facing120/"},{"n":"28","title":"沙发类方块","url":"https://beishanair.github.io/2025/05/19/120/sofa120/"},{"n":"29","title":"可坐实体","url":"https://beishanair.github.io/2025/05/19/120/seat120/"},{"n":"30","title":"光源方块","url":"https://beishanair.github.io/2025/05/20/120/light120/"},{"n":"31","title":"床","url":"https://beishanair.github.io/2025/05/20/120/bed120/"},{"n":"32","title":"柱类方块","url":"https://beishanair.github.io/2025/05/20/120/pillar120/"},{"n":"33","title":"栅栏类方块","url":"https://beishanair.github.io/2025/05/21/120/fence120/"},{"n":"34","title":"储物类方块","url":"https://beishanair.github.io/2025/05/21/120/chest120/"},{"n":"35","title":"流体","url":"https://beishanair.github.io/2025/06/12/120/fluid120/"},{"n":"36","title":"木头","url":"https://beishanair.github.io/2025/07/05/120/wood120/"},{"n":"37","title":"Gradle配置文件","url":"https://beishanair.github.io/2025/07/06/120/gradle/"},{"n":"38","title":"告示牌","url":"https://beishanair.github.io/2025/07/06/120/sign120/"},{"n":"39","title":"船","url":"https://beishanair.github.io/2025/07/07/120/boat120/"},{"n":"40","title":"树","url":"https://beishanair.github.io/2025/07/15/120/tree120/"},{"n":"41","title":"树的世界生成","url":"https://beishanair.github.io/2025/07/17/120/treegen120/"},{"n":"42","title":"花 & 盆栽花","url":"https://beishanair.github.io/2025/07/17/120/flower120/"},{"n":"43","title":"花的世界生成","url":"https://beishanair.github.io/2025/07/17/120/flowergen120/"},{"n":"44","title":"矿物的世界生成","url":"https://beishanair.github.io/2025/07/18/120/oregen120/"},{"n":"45","title":"耐久合成","url":"https://beishanair.github.io/2025/07/18/120/reciperemainder/"},{"n":"46","title":"生物群系","url":"https://beishanair.github.io/2026/05/20/120/biome/"},{"n":"47","title":"结构","url":"https://beishanair.github.io/2026/05/20/120/structure/"},{"n":"48","title":"维度 & 传送门","url":"https://beishanair.github.io/2026/05/20/120/dimension/"},{"n":"49","title":"GeckoLib","url":"https://beishanair.github.io/2026/05/21/120/gecko/"},{"n":"50","title":"矿机","url":"https://beishanair.github.io/2026/05/22/120/rig/"},{"n":"51","title":"自定义配方类型","url":"https://beishanair.github.io/2026/05/22/120/recipeType/"},{"n":"52","title":"REI","url":"https://beishanair.github.io/2026/05/26/120/rei/"},{"n":"53","title":"网络包初步","url":"https://beishanair.github.io/2026/07/07/120/53network/"},{"n":"54","title":"精炼炉","url":"https://beishanair.github.io/2026/07/07/120/54refining/"},{"n":"55","title":"罐装机","url":"https://beishanair.github.io/2026/07/07/120/55filling/"}]},{"id":"B","name":"Fabric 1.21.X 长线教程计划","loader":"Fabric","mc":"1.21.X","tag":"Fabric-1-21","chapters":[{"n":"2-1","title":"关于1.21.2中物品的注册","url":"https://beishanair.github.io/2025/08/02/121/item1212/"},{"n":"15-1","title":"特殊渲染","url":"https://beishanair.github.io/2024/10/10/121/renderer121/"},{"n":"1","title":"开发环境配置","url":"https://beishanair.github.io/2024/07/23/121/start121/"},{"n":"2","title":"第一个物品","url":"https://beishanair.github.io/2024/09/01/121/item121/"},{"n":"3","title":"物品栏","url":"https://beishanair.github.io/2024/09/07/121/itemgroup121/"},{"n":"4","title":"第一个方块","url":"https://beishanair.github.io/2024/09/08/121/block121/"},{"n":"5","title":"战利品列表","url":"https://beishanair.github.io/2024/09/15/121/loottable121/"},{"n":"6","title":"配方","url":"https://beishanair.github.io/2024/09/18/121/recipe121/"},{"n":"7","title":"数据生成","url":"https://beishanair.github.io/2024/09/19/121/datagen121/"},{"n":"8","title":"食物","url":"https://beishanair.github.io/2024/09/22/121/food121/"},{"n":"9","title":"Mixin","url":"https://beishanair.github.io/2024/09/23/121/mixin121/"},{"n":"10","title":"燃烧物","url":"https://beishanair.github.io/2024/09/25/121/fuelItem121/"},{"n":"11","title":"探矿器（进阶物品）","url":"https://beishanair.github.io/2024/09/26/121/prospector121/"},{"n":"12","title":"Tag","url":"https://beishanair.github.io/2024/09/27/121/tag121/"},{"n":"13","title":"提示信息","url":"https://beishanair.github.io/2024/09/29/121/tooltip121/"},{"n":"14","title":"2D -> 3D（Mixin）","url":"https://beishanair.github.io/2024/10/08/121/2d3d121/"},{"n":"15","title":"建筑类方块","url":"https://beishanair.github.io/2024/10/09/121/buildingblocks121/"},{"n":"16","title":"自定义工具","url":"https://beishanair.github.io/2024/10/11/121/tool121/"},{"n":"17","title":"自定义盔甲","url":"https://beishanair.github.io/2024/10/12/121/armor121/"},{"n":"18","title":"全套盔甲效果","url":"https://beishanair.github.io/2024/10/13/121/armoreffect121/"},{"n":"19","title":"头饰","url":"https://beishanair.github.io/2024/10/14/121/hat121/"},{"n":"20","title":"作物","url":"https://beishanair.github.io/2024/10/15/121/crop121/"},{"n":"21","title":"多方块作物","url":"https://beishanair.github.io/2024/10/16/121/doublecrop121/"},{"n":"22","title":"修改战利品列表","url":"https://beishanair.github.io/2024/10/17/121/modifyloottable121/"},{"n":"23","title":"自定义交易","url":"https://beishanair.github.io/2024/10/18/121/trade121/"},{"n":"24","title":"自定义村民","url":"https://beishanair.github.io/2024/10/19/121/villager121/"},{"n":"25","title":"自定义声音","url":"https://beishanair.github.io/2024/10/20/121/sound121/"},{"n":"26","title":"音乐唱片","url":"https://beishanair.github.io/2024/10/21/121/musicdisc121/"},{"n":"27","title":"流体","url":"https://beishanair.github.io/2024/10/22/121/fluid121/"},{"n":"28","title":"马铠","url":"https://beishanair.github.io/2024/10/23/121/horsearmor121/"},{"n":"29","title":"箱子（方块实体）","url":"https://beishanair.github.io/2024/10/24/121/box121/"},{"n":"30","title":"Jar构建","url":"https://beishanair.github.io/2024/10/25/121/jar121/"},{"n":"31","title":"方块实体2","url":"https://beishanair.github.io/2024/10/26/121/polishingmachine121/"},{"n":"32","title":"自定义配方类型","url":"https://beishanair.github.io/2024/10/27/121/recipetype121/"},{"n":"33","title":"REI","url":"https://beishanair.github.io/2024/10/28/121/rei121/"},{"n":"34","title":"自定义物品和方块","url":"https://beishanair.github.io/2024/10/29/121/customitemblock121/"},{"n":"35","title":"方块朝向","url":"https://beishanair.github.io/2024/10/30/121/facing121/"},{"n":"36","title":"可连接方块","url":"https://beishanair.github.io/2024/10/31/121/connectable121/"},{"n":"37","title":"木头","url":"https://beishanair.github.io/2024/11/01/121/wood121/"},{"n":"38","title":"告示牌","url":"https://beishanair.github.io/2024/11/10/121/sign121/"},{"n":"39","title":"船","url":"https://beishanair.github.io/2024/11/10/121/boat121/"},{"n":"40","title":"树","url":"https://beishanair.github.io/2024/11/11/121/tree121/"},{"n":"41","title":"树的世界生成","url":"https://beishanair.github.io/2024/11/11/121/treegen121/"},{"n":"42","title":"花 & 盆栽花","url":"https://beishanair.github.io/2024/11/12/121/flower121/"},{"n":"43","title":"花的世界生成","url":"https://beishanair.github.io/2024/11/12/121/flowergen121/"},{"n":"44","title":"矿物的世界生成","url":"https://beishanair.github.io/2024/11/14/121/oregen121/"},{"n":"45","title":"耐久合成（配方剩余）","url":"https://beishanair.github.io/2024/11/14/121/reciperemainder121/"},{"n":"46","title":"锻造台耐久合成（Mixin）","url":"https://beishanair.github.io/2024/11/15/121/smithingtransf121/"},{"n":"47","title":"生物实体","url":"https://beishanair.github.io/2024/11/15/121/entity121/"},{"n":"48","title":"生物实体动画","url":"https://beishanair.github.io/2024/11/16/121/entityani121/"},{"n":"49","title":"攻击型生物实体","url":"https://beishanair.github.io/2024/11/16/121/attackentity121/"},{"n":"50","title":"生物群系","url":"https://beishanair.github.io/2024/11/16/121/biome121/"},{"n":"51","title":"自定义粒子","url":"https://beishanair.github.io/2024/11/16/121/particle121/"},{"n":"52","title":"自定义结构","url":"https://beishanair.github.io/2024/11/16/121/structure121/"},{"n":"53","title":"维度&传送门","url":"https://beishanair.github.io/2024/11/16/121/dim121/"},{"n":"55","title":"附魔","url":"https://beishanair.github.io/2025/08/01/121/enchantment/"},{"n":"56","title":"升级到1.21.2","url":"https://beishanair.github.io/2025/08/01/121/update1212/"}]},{"id":"C","name":"Forge 1.20.1 长线教程计划","loader":"Forge","mc":"1.20.1","tag":"Forge-1-20-1","chapters":[{"n":"1","title":"开发环境配置","url":"https://beishanair.github.io/2025/07/20/f120/start/"},{"n":"2","title":"第一个物品","url":"https://beishanair.github.io/2025/07/21/f120/item/"},{"n":"3","title":"创造模式物品栏","url":"https://beishanair.github.io/2025/07/21/f120/itemgroup/"},{"n":"4","title":"第一个方块","url":"https://beishanair.github.io/2025/07/21/f120/block/"},{"n":"5","title":"战利品列表","url":"https://beishanair.github.io/2025/07/21/f120/loot/"},{"n":"6","title":"配方","url":"https://beishanair.github.io/2025/07/21/f120/recipe/"},{"n":"7","title":"数据生成","url":"https://beishanair.github.io/2025/08/07/f120/datagen/"},{"n":"8","title":"食物","url":"https://beishanair.github.io/2025/11/18/f120/food/"},{"n":"9","title":"燃料","url":"https://beishanair.github.io/2025/11/18/f120/fuel/"},{"n":"10","title":"探矿器","url":"https://beishanair.github.io/2025/11/20/f120/prospector/"},{"n":"11","title":"Tags","url":"https://beishanair.github.io/2025/11/20/f120/tag/"},{"n":"12","title":"Jar打包","url":"https://beishanair.github.io/2025/11/20/f120/jar/"},{"n":"13","title":"建材类方块","url":"https://beishanair.github.io/2026/04/27/f120/buildingblock/"},{"n":"14","title":"工具","url":"https://beishanair.github.io/2026/04/27/f120/tool/"},{"n":"15","title":"斧 + 镐","url":"https://beishanair.github.io/2026/04/29/f120/pickaxeaxe/"},{"n":"16","title":"工具信息","url":"https://beishanair.github.io/2026/04/29/f120/tooltip/"},{"n":"17","title":"盔甲","url":"https://beishanair.github.io/2026/04/29/f120/armor/"},{"n":"18","title":"全套盔甲增益","url":"https://beishanair.github.io/2026/04/29/f120/armoreffect/"},{"n":"19","title":"作物","url":"https://beishanair.github.io/2026/04/29/f120/crop/"},{"n":"20","title":"多方块作物","url":"https://beishanair.github.io/2026/04/30/f120/doublecrop/"},{"n":"21","title":"村民交易","url":"https://beishanair.github.io/2026/04/30/f120/trade/"},{"n":"28","title":"座椅","url":"https://beishanair.github.io/2026/06/30/f120/seat/"},{"n":"29","title":"光源方块","url":"https://beishanair.github.io/2026/06/30/f120/light/"},{"n":"30","title":"床","url":"https://beishanair.github.io/2026/06/30/f120/bed/"},{"n":"31","title":"柱类方块","url":"https://beishanair.github.io/2026/06/30/f120/pillar/"},{"n":"32","title":"栅栏类方块","url":"https://beishanair.github.io/2026/06/30/f120/fence/"},{"n":"33","title":"流体","url":"https://beishanair.github.io/2026/06/30/f120/fluid/"},{"n":"34","title":"木头","url":"https://beishanair.github.io/2026/06/30/f120/wood/"},{"n":"35","title":"树","url":"https://beishanair.github.io/2026/06/30/f120/tree/"},{"n":"36","title":"树的世界生成","url":"https://beishanair.github.io/2026/07/01/f120/treegen/"},{"n":"37","title":"花 & 盆栽花","url":"https://beishanair.github.io/2026/07/01/f120/flower/"},{"n":"38","title":"花的世界生成","url":"https://beishanair.github.io/2026/07/01/f120/flowergen/"},{"n":"39","title":"矿物的世界生成","url":"https://beishanair.github.io/2026/07/01/f120/oregen/"},{"n":"40","title":"告示牌","url":"https://beishanair.github.io/2026/07/01/f120/sign/"},{"n":"41","title":"船","url":"https://beishanair.github.io/2026/07/01/f120/boat/"},{"n":"42","title":"结构","url":"https://beishanair.github.io/2026/07/02/f120/structure/"},{"n":"43","title":"生物群系","url":"https://beishanair.github.io/2026/07/02/f120/biome/"},{"n":"44","title":"维度 & 传送门","url":"https://beishanair.github.io/2026/07/02/f120/dimension/"}]},{"id":"D","name":"NeoForge 1.21.1 长线教程计划","loader":"NeoForge","mc":"1.21.1","tag":"NeoForge-1-21-1","chapters":[{"n":"1","title":"开发环境配置","url":"https://beishanair.github.io/2025/07/22/nf121/start/"},{"n":"2","title":"第一个物品","url":"https://beishanair.github.io/2025/07/25/nf121/item/"},{"n":"3","title":"创造模式物品栏","url":"https://beishanair.github.io/2025/07/25/nf121/itemgroup/"},{"n":"4","title":"第一个方块","url":"https://beishanair.github.io/2025/07/25/nf121/block/"},{"n":"5","title":"战利品列表","url":"https://beishanair.github.io/2025/07/25/nf121/loottable/"},{"n":"6","title":"配方","url":"https://beishanair.github.io/2025/07/25/nf121/recipe/"},{"n":"7","title":"数据生成","url":"https://beishanair.github.io/2025/08/19/nf121/datagen/"},{"n":"8","title":"食物","url":"https://beishanair.github.io/2025/11/18/nf121/food/"},{"n":"9","title":"燃料","url":"https://beishanair.github.io/2025/11/18/nf121/fuel/"},{"n":"10","title":"探矿器","url":"https://beishanair.github.io/2025/11/20/nf121/prospector/"},{"n":"11","title":"Tags","url":"https://beishanair.github.io/2025/11/20/nf121/tag/"},{"n":"12","title":"Jar打包","url":"https://beishanair.github.io/2025/11/20/nf121/jar/"},{"n":"25","title":"Blockbench模型","url":"https://beishanair.github.io/2026/07/09/nf121/25blockbench/"},{"n":"26","title":"方块朝向","url":"https://beishanair.github.io/2026/07/09/nf121/26facing/"},{"n":"27","title":"沙发类方块","url":"https://beishanair.github.io/2026/07/09/nf121/27sofa/"},{"n":"28","title":"座椅","url":"https://beishanair.github.io/2026/08/09/nf121/28seat/"},{"n":"29","title":"光源方块","url":"https://beishanair.github.io/2026/08/09/nf121/29light/"},{"n":"30","title":"床","url":"https://beishanair.github.io/2026/08/09/nf121/30bed/"},{"n":"31","title":"柱类方块","url":"https://beishanair.github.io/2026/08/09/nf121/31pillar/"},{"n":"32","title":"栅栏类方块","url":"https://beishanair.github.io/2026/08/09/nf121/32fence/"},{"n":"33","title":"流体","url":"https://beishanair.github.io/2026/08/14/nf121/33fluid/"},{"n":"34","title":"木头","url":"https://beishanair.github.io/2026/08/15/nf121/34wood/"},{"n":"35","title":"树","url":"https://beishanair.github.io/2026/08/15/nf121/35tree/"},{"n":"36","title":"树的世界生成","url":"https://beishanair.github.io/2026/08/15/nf121/36treegen/"},{"n":"37","title":"花 & 盆栽花","url":"https://beishanair.github.io/2026/08/15/nf121/37flower/"},{"n":"38","title":"花的世界生成","url":"https://beishanair.github.io/2026/08/15/nf121/38flowergen/"},{"n":"39","title":"矿物的世界生成","url":"https://beishanair.github.io/2026/08/15/nf121/39oregen/"},{"n":"40","title":"告示牌","url":"https://beishanair.github.io/2026/08/15/nf121/40sign/"},{"n":"41","title":"船","url":"https://beishanair.github.io/2026/08/16/nf121/41boat/"},{"n":"42","title":"结构","url":"https://beishanair.github.io/2026/08/16/nf121/42structure/"},{"n":"43","title":"生物群系","url":"https://beishanair.github.io/2026/08/16/nf121/43biome/"},{"n":"44","title":"维度 & 传送门","url":"https://beishanair.github.io/2026/08/16/nf121/44dimension/"}]},{"id":"E","name":"Fabric 26.1 教程计划","loader":"Fabric","mc":"26.1","tag":"Fabric","chapters":[{"n":"1","title":"开发环境配置","url":"https://beishanair.github.io/2026/05/27/fa261/start/"},{"n":"2","title":"第一个物品","url":"https://beishanair.github.io/2026/05/27/fa261/item/"},{"n":"3","title":"创造模式物品栏","url":"https://beishanair.github.io/2026/05/28/fa261/tabs/"},{"n":"4","title":"第一个方块","url":"https://beishanair.github.io/2026/05/28/fa261/block/"},{"n":"5","title":"战利品列表","url":"https://beishanair.github.io/2026/06/29/fa261/loottable/"},{"n":"6","title":"配方","url":"https://beishanair.github.io/2026/06/29/fa261/recipe/"},{"n":"7","title":"数据生成","url":"https://beishanair.github.io/2026/06/29/fa261/datagen/"},{"n":"8","title":"食物","url":"https://beishanair.github.io/2026/06/29/fa261/food/"},{"n":"22","title":"自定义交易","url":"https://beishanair.github.io/2026/10/26/fa261/22trade/"},{"n":"23","title":"自定义村民","url":"https://beishanair.github.io/2026/10/27/fa261/23villager/"},{"n":"24","title":"自定义声音","url":"https://beishanair.github.io/2026/10/27/fa261/24sound/"},{"n":"25","title":"音乐唱片","url":"https://beishanair.github.io/2026/10/27/fa261/25musicdisc/"},{"n":"26","title":"Blockbench模型","url":"https://beishanair.github.io/2026/10/27/fa261/26blockbench/"},{"n":"27","title":"方块朝向","url":"https://beishanair.github.io/2026/10/27/fa261/27facing/"},{"n":"28","title":"沙发类方块","url":"https://beishanair.github.io/2026/10/27/fa261/28sofa/"},{"n":"29","title":"座椅","url":"https://beishanair.github.io/2026/10/27/fa261/29seat/"},{"n":"30","title":"光源方块","url":"https://beishanair.github.io/2026/10/27/fa261/30light/"},{"n":"31","title":"床","url":"https://beishanair.github.io/2026/10/27/fa261/31bed/"},{"n":"32","title":"柱类方块","url":"https://beishanair.github.io/2026/10/27/fa261/32pillar/"},{"n":"33","title":"栅栏类方块","url":"https://beishanair.github.io/2026/10/27/fa261/33fence/"},{"n":"34","title":"流体","url":"https://beishanair.github.io/2026/11/02/fa261/34fluid/"},{"n":"35","title":"木头","url":"https://beishanair.github.io/2026/11/02/fa261/35wood/"},{"n":"36","title":"树","url":"https://beishanair.github.io/2026/11/02/fa261/36tree/"},{"n":"37","title":"树的世界生成","url":"https://beishanair.github.io/2026/11/02/fa261/37treegen/"},{"n":"38","title":"花 & 盆栽花","url":"https://beishanair.github.io/2026/11/02/fa261/38flower/"},{"n":"39","title":"花的世界生成","url":"https://beishanair.github.io/2026/11/02/fa261/39flowergen/"},{"n":"40","title":"矿物的世界生成","url":"https://beishanair.github.io/2026/11/02/fa261/40oregen/"},{"n":"41","title":"结构","url":"https://beishanair.github.io/2026/11/02/fa261/41structure/"},{"n":"42","title":"生物群系","url":"https://beishanair.github.io/2026/11/02/fa261/42biome/"},{"n":"43","title":"维度 & 传送门","url":"https://beishanair.github.io/2026/11/02/fa261/43dimension/"}]},{"id":"F","name":"NeoForge 26.1 教程计划","loader":"NeoForge","mc":"26.1","tag":"NeoForge","chapters":[]}],"standalones":[{"title":"开篇（博客第一篇文章）","url":"https://beishanair.github.io/2024/07/13/121/first-blog/"},{"title":"FAQ（常见问题，全版本通用）","url":"https://beishanair.github.io/2024/09/04/faq/"},{"title":"前言 1.20 Fabric 长线教程计划","url":"https://beishanair.github.io/2025/02/19/120/120/"},{"title":"Python × Minecraft 粒子特效教程","url":"https://beishanair.github.io/2025/07/20/particle/"}]};

const JAVA = { A: 'Java 17', B: 'Java 21', C: 'Java 17', D: 'Java 21', E: 'Java 25', F: 'Java 25' };
const GAPS = { A: [], B: ['54（本站无 #54）'], C: ['22-27（未发布）'], D: ['13-24（未发布）'], E: [], F: ['全系列待开'] };
const VERSION = '2.4.6';

// 系列画像：compare / env / plan 共用。只写有把握的定性事实，不写易过期的精确小版本号。
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

function dateOf(url) {
  const m = String(url).match(/\/20(\d\d)\/(\d\d)\/(\d\d)\//);
  return m ? `20${m[1]}/${m[2]}/${m[3]}` : '';
}

function buildSearchIndex() {
  const items = [];
  for (const s of DATA.series) {
    for (const c of s.chapters || []) {
      items.push({
        kind: 'chapter',
        series: s.id,
        seriesName: s.name,
        loader: s.loader || '',
        mc: s.mc || '',
        java: JAVA[s.id] || '',
        chapter: c.n,
        date: dateOf(c.url),
        title: c.title,
        url: c.url,
        haystack: [s.id, s.name, s.loader, s.mc, c.n, c.title].join(' ').toLowerCase(),
      });
    }
  }
  for (const a of DATA.standalones) {
    items.push({
      kind: 'article',
      series: '',
      seriesName: '其他独立文章',
      loader: '',
      mc: '',
      java: '',
      chapter: '',
      date: dateOf(String(a.url || '')),
      title: a.title,
      url: a.url,
      haystack: [a.title].join(' ').toLowerCase(),
    });
  }
  return items;
}

const INDEX = buildSearchIndex();

function tokenize(q) {
  return q
    .toLowerCase()
    .replace(/[、，。；：·&+（）()"'\-—_|/\\]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function clampInt(value, min, max, fallback) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, Math.floor(value)));
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.max(min, Math.min(max, Math.floor(n)));
  }
  return fallback;
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
    id: s.id,
    name: s.name,
    loader: s.loader || '',
    mc: s.mc || '',
    java: JAVA[id] || '',
    tag: s.tag || '',
    status: (s.chapters || []).length > 0 ? (id === 'B' ? '完整' : '进行中') : '待开',
    gaps: GAPS[id] || [],
    chapters: (s.chapters || []).length,
  };
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

// 注意：DSH ToolRuntime 调用 output.render(args, value) —— 第一个实参是调用参数，
// 第二个才是 execute 的返回值。不能写成交叉引用，否则调用方拿到的是空白/参数回显。
function renderText(_args, value) {
  return [{ type: 'text', text: JSON.stringify(value, null, 2) }];
}

// ── 正文抓取与提取（besson_tutorial_fetch 使用；与 MCP 版一致）──────────────
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

// 站内地址判定：只认 https。明文 http 的内容可被中间人改写，而抓回的正文
// 随后会作为事实来源交给调用方，所以协议这一层必须先卡死。
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

/** 组装 raw ToolDefinition（parameters/output 均为受支持的 JSON Schema 子集） */
// ── 工具调用统计（v2.4.4）：左栏面板「工具调用统计」数据源，写入本机 ~/.dsh/storages/besson-tools/usage.json ──
const USAGE_FILE = join(homedir(), '.dsh', 'storages', 'besson-tools', 'usage.json');
let usageCache = null;
let usageTimer = null;
function loadUsage() {
  if (usageCache) return usageCache;
  try { usageCache = JSON.parse(readFileSync(USAGE_FILE, 'utf8')); } catch { usageCache = {}; }
  return usageCache;
}
function saveUsageSoon() {
  if (usageTimer) clearTimeout(usageTimer);
  usageTimer = setTimeout(() => {
    usageTimer = null;
    try { mkdirSync(dirname(USAGE_FILE), { recursive: true }); writeFileSync(USAGE_FILE, JSON.stringify(usageCache, null, 1)); } catch {}
  }, 800);
  if (typeof usageTimer.unref === 'function') usageTimer.unref();
}
function recordUsage(name, ms, ok) {
  const data = loadUsage();
  const it = data[name] || (data[name] = { calls: 0, ms: 0, errors: 0, last: '' });
  it.calls += 1;
  it.ms += ms;
  if (!ok) it.errors += 1;
  it.last = new Date().toISOString();
  saveUsageSoon();
}
function wrapExecute(name, fn) {
  return (args) => {
    const t0 = Date.now();
    let out;
    try {
      out = fn(args);
    } catch (e) {
      recordUsage(name, Date.now() - t0, false);
      throw e;
    }
    if (out && typeof out.then === 'function') {
      return out.then(
        (v) => { recordUsage(name, Date.now() - t0, true); return v; },
        (e) => { recordUsage(name, Date.now() - t0, false); throw e; },
      );
    }
    recordUsage(name, Date.now() - t0, true);
    return out;
  };
}
export function getUsage() {
  const data = loadUsage();
  const tools = Object.entries(data)
    .map(([name, v]) => ({
      name,
      calls: v.calls || 0,
      sumMs: v.ms || 0,
      avgMs: v.calls ? Math.round((v.ms || 0) / v.calls) : 0,
      errors: v.errors || 0,
      last: v.last || '',
    }))
    .sort((a, b) => b.calls - a.calls);
  const total = { calls: 0, sumMs: 0, errors: 0, avgMs: 0 };
  for (const t of tools) { total.calls += t.calls; total.sumMs += t.sumMs; total.errors += t.errors; }
  total.avgMs = total.calls ? Math.round(total.sumMs / total.calls) : 0;
  return { total, tools, usageFile: USAGE_FILE, updatedAt: new Date().toISOString() };
}

export function defineBessonTool(name, description, parameters, execute) {

  return {
    name,
    description,
    parameters,
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: renderText,
    },
    execute: wrapExecute(name, execute),
  };
}

export const name = 'besson-tutorials-tools';
export const inject = ['tools'];

// ── v2.4.0：骨架生成与中文映射对照（scaffold / mapping 工具共用）──
const FABRIC_JAVA = { A: '17', B: '21', E: '25' };

function scaffoldTemplates(id) {
  const jv = FABRIC_JAVA[id] || '21';
  if (id === 'A' || id === 'B' || id === 'E') {
    const mc = id === 'A' ? '1.20.1' : id === 'B' ? '1.21.1' : '26.1';
    const yarn = id === 'A' ? '1.20.1+build.10' : id === 'B' ? '1.21.1+build.3' : '26.1+build.1';
    const loader = id === 'A' ? '0.16.14' : id === 'B' ? '0.16.14' : '0.19.3';
    const fapi = id === 'A' ? '0.92.2+1.20.1' : id === 'B' ? '0.116.6+1.21.1' : '0.135.0+1.21.11';
    return {
      'gradle.properties': ['minecraft_version=' + mc, 'yarn_mappings=' + yarn, 'loader_version=' + loader, 'fabric_version=' + fapi, 'mod_id=__ID__', 'mod_name=__NAME__', 'mod_version=0.0.1'].join('\n'),
      'build.gradle': [
        "plugins { id 'fabric-loom' version '1.7-SNAPSHOT'",
        "id 'maven-publish' }",
        '',
        'version = project.mod_version',
        'group = project.maven_group',
        '',
        'base { archivesName = project.archives_base_name }',
        '',
        'repositories { }',
        '',
        'dependencies {',
        '    minecraft "com.mojang:minecraft:${project.minecraft_version}"',
        '    mappings "net.fabricmc:yarn:${project.yarn_mappings}:v2"',
        '    modImplementation "net.fabricmc:fabric-loader:${project.loader_version}"',
        '    modImplementation "net.fabricmc.fabric-api:fabric-api:${project.fabric_version}"',
        '}',
        '',
        'processResources {',
        '    inputs.property "version", project.version',
        '    filesMatching("fabric.mod.json") { expand "version": project.version }',
        '}',
        '',
        'java {',
        '    withSourcesJar()',
        '    sourceCompatibility = JavaVersion.VERSION_' + jv,
        '    targetCompatibility = JavaVersion.VERSION_' + jv,
        '}',
      ].join('\n'),
      'settings.gradle': [
        'pluginManagement {',
        '    repositories {',
        "        maven { name = 'Fabric'; url = 'https://maven.fabricmc.net/' }",
        '        gradlePluginPortal()',
        '    }',
        '}',
        '',
        'rootProject.name = "__ID__"',
      ].join('\n'),
      'src/main/java/__GROUPDIR__/__CLASS__.java': [
        'package __GROUP__;',
        '',
        'import net.fabricmc.api.ModInitializer;',
        'import net.minecraft.registry.Registry;',
        'import net.minecraft.registry.Registries;',
        'import net.minecraft.util.Identifier;',
        'import org.slf4j.Logger;',
        'import org.slf4j.LoggerFactory;',
        '',
        'public class __CLASS__ implements ModInitializer {',
        '    public static final String MODID = "__ID__";',
        '    public static final Logger LOGGER = LoggerFactory.getLogger(MODID);',
        '',
        '    @Override',
        '    public void onInitialize() {',
        '        // 在此注册物品/方块/实体/音效，例如：',
        '        // Registry.register(Registries.BLOCK, new Identifier(MODID, "example"), ...);',
        '    }',
        '}',
      ].join('\n'),
      'src/main/resources/fabric.mod.json': [
        '{',
        '  "schemaVersion": 1,',
        '  "id": "__ID__",',
        '  "version": "0.0.1",',
        '  "name": "__NAME__",',
        '  "environment": "*",',
        '  "entrypoints": { "main": [ "__GROUP__.__CLASS__" ] },',
        '  "depends": { "fabricloader": ">=0.15", "minecraft": "' + mc + '", "java": ">=' + jv + '", "fabric-api": "*" }',
        '}',
      ].join('\n'),
    };
  }
  const tomlPath = id === 'D' ? 'src/main/resources/META-INF/neoforge.mods.toml' : 'src/main/resources/META-INF/mods.toml';
  const gradleProps = id === 'D'
    ? ['minecraft_version=1.21.1', 'neo_version=21.1.217', 'mod_id=__ID__', 'mod_name=__NAME__', 'mod_group_id=__GROUP__', 'mod_version=0.0.1', 'org.gradle.jvmargs=-Xmx2G', 'org.gradle.daemon=true'].join('\n')
    : ['minecraft_version=1.20.1', 'forge_version=47.3.0', 'mod_id=__ID__', 'mod_name=__NAME__', 'mod_version=0.0.1', 'org.gradle.jvmargs=-Xmx2G'].join('\n');
  const buildGradle = id === 'D'
    ? [
        "plugins { id 'java-library'",
        "id 'net.neoforged.moddev' version '2.0.78' }",
        '',
        'java.toolchain.languageVersion = JavaLanguageVersion.of(21)',
        '',
        'neoForge {',
        '    version = project.neo_version',
        '    parchment {',
        '        minecraftVersion = project.minecraft_version',
        "        mappingsVersion = '2024.11.17'",
        '    }',
        '    runs {',
        '        client { client() }',
        '        server { server() }',
        '        data { data() }',
        '    }',
        '    mods {',
        '        __ID__ { sourceSet(sourceSets.main) }',
        '    }',
        '}',
        '',
        'dependencies { }',
      ].join('\n')
    : [
        "plugins { id 'eclipse'",
        "id 'maven-publish'",
        "id 'net.minecraftforge.gradle' version '[6.0,6.2)' }",
        '',
        'version = project.mod_version',
        'group = project.maven_group',
        '',
        'base { archivesName = project.archives_base_name }',
        '',
        'minecraft {',
        "    mappings channel: 'official', version: project.minecraft_version",
        '    runs {',
        '        client { workingDirectory project.file("run") }',
        '        server { workingDirectory project.file("run") }',
        '    }',
        '    mods {',
        '        __ID__ { source sourceSets.main }',
        '    }',
        '}',
        '',
        'dependencies {',
        '    minecraft "net.minecraftforge:forge:${project.minecraft_version}-${project.forge_version}"',
        '}',
        '',
        'java { withSourcesJar() }',
      ].join('\n');
  const mainJava = id === 'D'
    ? [
        'package __GROUP__;',
        '',
        'import net.neoforged.bus.api.IEventBus;',
        'import net.neoforged.fml.common.Mod;',
        'import net.neoforged.neoforge.registries.DeferredRegister;',
        'import net.minecraft.world.level.block.Block;',
        '',
        '@Mod("__ID__")',
        'public class __CLASS__ {',
        '    public static final String MODID = "__ID__";',
        '    public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks(MODID);',
        '',
        '    public __CLASS__(IEventBus modBus) {',
        '        BLOCKS.register(modBus);',
        '        // 在此注册物品/方块/实体/音效',
        '    }',
        '}',
      ].join('\n')
    : [
        'package __GROUP__;',
        '',
        'import net.minecraftforge.eventbus.api.IEventBus;',
        'import net.minecraftforge.fml.common.Mod;',
        'import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;',
        'import net.minecraftforge.registries.DeferredRegister;',
        'import net.minecraftforge.registries.ForgeRegistries;',
        'import net.minecraft.world.level.block.Block;',
        '',
        '@Mod("__ID__")',
        'public class __CLASS__ {',
        '    public static final String MODID = "__ID__";',
        '    public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(ForgeRegistries.BLOCKS, MODID);',
        '',
        '    public __CLASS__() {',
        '        IEventBus modBus = FMLJavaModLoadingContext.get().getModEventBus();',
        '        BLOCKS.register(modBus);',
        '    }',
        '}',
      ].join('\n');
  const toml = [
    'modLoader="javafml"',
    'loaderVersion="[' + (id === 'D' ? '1,' : '43,') + ')"',
    'license="__LICENSE__"',
    '',
    '[[mods]]',
    'modId="__ID__"',
    'version="__VERSION__"',
    'displayName="__NAME__"',
  ].join('\n');
  return {
    'gradle.properties': gradleProps,
    'build.gradle': buildGradle,
    'settings.gradle': ['rootProject.name = "__ID__"'].join('\n'),
    'src/main/java/__GROUPDIR__/__CLASS__.java': mainJava,
    [tomlPath]: toml,
  };
}

function scaffoldSeries(loader, mcVersion) {
  const ld = String(loader || '').toLowerCase();
  const mc = String(mcVersion || '').trim();
  if (mc.startsWith('1.20.1')) return ld.includes('forge') && !ld.includes('neo') ? 'C' : 'A';
  if (mc.startsWith('1.21')) return ld.includes('fabric') ? 'B' : 'D';
  if (mc.startsWith('26')) return ld.includes('fabric') ? 'E' : 'F';
  return ld === 'neoforge' ? 'D' : ld === 'forge' ? 'C' : 'A';
}

// 中文映射对照：概念 ↔ 官方映射名（源自教程与各 loader 公开映射的通用命名）
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

function buildScaffold(args) {
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
  const tpl = scaffoldTemplates(id);
  const files = Object.entries(tpl).map(([path, content]) => ({ path: fill(path), content: fill(content) }));
  return {
    ok: true,
    series: id,
    loader: (SERIES_INFO[id] || {}).loader || loader,
    mcVersion,
    modId,
    files,
    note: '骨架为最小可编译版本：先 gradle build 通过，再按系列教程章节逐步添加物品/方块/实体。',
    next: ['besson_mod_project：把文件写入工程后体检', 'besson_tutorial_env：确认 JDK 与启动命令', 'besson_tutorial_series：按该系列章节推进'],
  };
}

function scanProject(pathArg) {
  const base = pathArg ? resolve(String(pathArg)) : resolve('.');
      if (!existsSync(base)) return { error: '目录不存在：' + base };
      const issues = [];
      const info = { path: base };
      let gradleProps = {};
      for (const name of ['gradle.properties']) {
        const f = join(base, name);
        if (!existsSync(f)) continue;
        const text = readFileSync(f, 'utf8');
        for (const line of text.split(/\r?\n/)) {
          const m = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
          if (m && !m[1].startsWith('#')) gradleProps[m[1]] = m[2].trim();
        }
        info.gradleProperties = Object.fromEntries(
          Object.entries(gradleProps).filter(([k]) => /version|loader|mapping|moddev|toolchain|java/i.test(k)),
        );
      }
      // 构建文件与构建插件
      let buildText = '';
      for (const name of ['build.gradle.kts', 'build.gradle']) {
        const f = join(base, name);
        if (existsSync(f)) { buildText = readFileSync(f, 'utf8'); info.buildFile = name; break; }
      }
      if (!buildText) {
        issues.push('未找到 build.gradle / build.gradle.kts —— 可能不是 Gradle 工程');
      } else {
        const plugins = [];
        if (/net\.neoforged\.moddev|net\.neoforged\.gradle\.userdev|neoforge/i.test(buildText)) plugins.push('neoforge');
        if (/fabric-loom|fabric-loader/i.test(buildText) || typeof gradleProps.fabric_loader_version === 'string') plugins.push('fabric');
        if (/net\.minecraftforge\.gradle|forgegradle/i.test(buildText)) plugins.push('forge');
        if (plugins.length === 0) issues.push('无法从构建文件识别加载器插件（fabric-loom / ForgeGradle / NeoGradle / ModDevGradle）');
        info.buildPlugins = plugins;
        const javaMatch = buildText.match(/JavaLanguageVersion\.of\((\d+)\)|languageVersion\s*=\s*[^\d]*(\d+)|JavaVersion\.VERSION_(\d+)/);
        if (javaMatch) info.javaToolchain = 'Java ' + (javaMatch[1] || javaMatch[2] || javaMatch[3]);
      }
      // MC 版本
      let mc = gradleProps.minecraft_version || gradleProps.fabric_minecraft_version || '';
      if (!mc && gradleProps.neoforge_version) {
        const nm = String(gradleProps.neoforge_version).match(/^(\d+)\.(\d+)\./);
        if (nm) mc = '1.' + nm[1] + '.' + nm[2];
      }
      if (!mc) {
        const bm = buildText.match(/minecraft_version\s*=\s*['"]([^'"]+)['"]/);
        if (bm) mc = bm[1];
      }
      info.minecraft = mc || '';
      // mod 清单（兼容 ModDevGradle 模板：src/main/templates 下的占位清单在打包时展开）
      const modfiles = [];
      const normPath = (p) => String(p).replace(/\\/g, '/');
      const expandProp = (v) => {
        const m = String(v).match(/^\$\{([A-Za-z0-9_.-]+)\}$/);
        return m && gradleProps[m[1]] != null ? String(gradleProps[m[1]]) : String(v);
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
      // 主类
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
      // 与系列画像对照
      let matched = null;
      if (info.minecraft && (info.buildPlugins || []).length) {
        const loader = info.buildPlugins[0];
        const candidates = DATA.series.filter((s) => String(s.mc || '').toLowerCase().replace(/\.x$/, '') === String(info.minecraft).toLowerCase().replace(/\.x$/, '') || String(info.minecraft).startsWith('1.21'));
        const loaderMatch = candidates.find((s) => String(s.loader || '').toLowerCase() === loader);
        matched = (loaderMatch || candidates[0] || null);
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

const TOOL_DEFS = [
  {
    name: 'besson_tutorial_lookup',
    description:
      '在 BeiShan_Besson（北山Besson）的 Minecraft 模组开发教程站 Tomorrow-Land（https://beishanair.github.io/）中检索教程章节。' +
      '站内系列：A=Fabric 1.20.1（Java 17）、B=Fabric 1.21.X（Java 21）、C=Forge 1.20.1（Java 17）、D=NeoForge 1.21.1（Java 21）、E=Fabric 26.1（Java 25）、F=NeoForge 26.1（待开）。' +
      '输入关键词（例如："NeoForge 生物群系"、"Fabric 1.20.1 流体"、"附魔"、"粒子"、"D 44"），返回匹配章节的标题与链接，并可用 limit 控制返回条数。',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '检索关键词，可组合使用：系列字母（A-F）、Loader、MC 版本、章节号、主题词（如 "D 流体"、"forge 盔甲"、"26.1 食物"）' },
        series: { type: 'string', description: '可选：限定/优先系列 A-F（如工程是 NeoForge 1.21.1 就传 D）' },
        loader: { type: 'string', description: '可选：fabric / forge / neoforge' },
        mcVersion: { type: 'string', description: '可选：1.20.1 / 1.21.1 / 26.1' },
        limit: { type: 'integer', description: '最多返回的匹配条数（1-25，默认 8）' },
      },
      required: ['query'],
      additionalProperties: true,
    },
    execute: (args) => {
      const a = args && typeof args === 'object' ? args : {};
      const rawQuery = a.query != null ? a.query : (a.Query || a.text || a.keyword || a.kw || '');
      const q = String(rawQuery == null ? '' : rawQuery);
      const result = search(q, a.limit, { series: a.series, loader: a.loader, mcVersion: a.mcVersion });
      const lines = [];
      const matches = result.matched || [];
      if (q.trim()) {
        lines.push(`「${q}」命中 ${result.total} 条（标题直接命中 ${result.titleTotal || 0} / 元数据命中 ${result.metaTotal || 0}），展示前 ${matches.length} 条：`);
        if (matches.length === 0) lines.push('未命中任何章节，建议换关键词，或调用 besson_tutorial_index 查看系列总览，或直接访问 https://beishanair.github.io/2099/12/31/sum/');
      } else {
        lines.push(result.hint || '请输入查询关键词（如 "NeoForge 生物群系"、"附魔"）');
      }
      for (const m of matches) {
        const label = m.series ? `[${m.series} ${m.seriesName} #${m.chapter} / ${m.java}]` : '[独立文章]';
        lines.push(`${label} ${m.title} — ${m.url}`);
      }
      return { query: q, total: result.total, titleTotal: result.titleTotal || 0, metaTotal: result.metaTotal || 0, filters: result.filters, matched: matches, indexed: INDEX.length, hint: result.hint || '', note: lines.join('\n') };
    },
  },
  {
    name: 'besson_tutorial_index',
    description:
      '查看北山Besson 教程站的系列总览：各系列（Fabric/Forge/NeoForge）对应的 MC 版本、Java、章节数量、状态与缺号，' +
      '独立文章（粒子特效、FAQ、开篇）、教程总汇页、生态现状（当前 MC 26.2、Fabric Loader 0.19.3）与工具清单。不需要参数，直接调用。',
    parameters: { type: 'object', properties: {}, additionalProperties: true },
    execute: () => {
      const totalChapters = DATA.series.reduce((n, s) => n + (s.chapters || []).length, 0);
      const firstTitle = (DATA.series[0] && DATA.series[0].chapters && DATA.series[0].chapters[0] && DATA.series[0].chapters[0].title) || '';
      return {
        site: DATA.site,
        author: DATA.author,
        synced: DATA.synced,
        version: VERSION,
        totalArticlesOnSite: 217,
        series: DATA.series.map((s) => seriesMeta(s.id)),
        standalones: DATA.standalones,
        dataHealth: {
          totalChapters,
          standalones: (DATA.standalones || []).length,
          sampleTitle: firstTitle,
          note: '若 sampleTitle 是乱码或 totalChapters=0，说明插件文件编码/数据损坏，请从 Release 重装',
        },
        tutorialIndexPage: 'https://beishanair.github.io/2099/12/31/sum/',
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
          besson_mod_scaffold: '生成工程骨架（gradle/主类/清单）',
        besson_mod_mapping: '中文 ↔ 官方映射名对照',
        besson_tutorial_env: '某 MC 版本 + Loader 的环境搭建清单与命令',
    besson_mod_project: '检查本地模组工程：加载器/版本/清单/主类/常见问题',
    besson_mod_migrate: '跨系列迁移清单：映射/构建插件/注册/事件/清单文件',
        },
      };
    },
  },
  {
    name: 'besson_tutorial_series',
    description:
      '列出北山Besson 教程站某个系列（A-F）的全部章节（含章节号、标题、日期、链接）与系列元信息（Loader、MC 版本、Java、状态、缺号）。' +
      '可选 chapter 参数只取某一章。series 传字母（A-F）或名称关键词（fabric 1.20.1 / forge / neoforge / 26.1）。',
    parameters: {
      type: 'object',
      properties: {
        series: { type: 'string', description: '系列标识：字母 A-F，或名称关键词（fabric 1.20.1 / fabric 1.21 / forge / neoforge / 26.1）' },
        chapter: { type: 'string', description: '可选：只返回该章节号（如 "44"、"2-1"）' },
      },
      required: ['series'],
      additionalProperties: true,
    },
    execute: (args) => {
      const a = args && typeof args === 'object' ? args : {};
      const s = resolveSeries(a.series);
      if (!s) {
        return { error: `未找到系列「${a.series}」。可用：A=Fabric 1.20.1, B=Fabric 1.21.X, C=Forge 1.20.1, D=NeoForge 1.21.1, E=Fabric 26.1, F=NeoForge 26.1` };
      }
      const meta = seriesMeta(s.id);
      if (a.chapter != null && String(a.chapter).trim() !== '') {
        const c = chapterUrl(s.id, String(a.chapter).trim());
        if (!c) return { error: `系列 ${s.id} 中没有章节「${a.chapter}」`, meta };
        return { meta, chapter: { ...c, date: dateOf(c.url) } };
      }
      return {
        meta,
        chapters: (s.chapters || []).map((c) => ({
          chapter: c.n,
          date: dateOf(c.url),
          title: c.title,
          url: c.url,
        })),
      };
    },
  },
  {
    name: 'besson_tutorial_fetch',
    description:
      '抓取北山Besson 教程站一篇文章的正文。直接传 url（来自 lookup/series/index 返回的链接）即可抓取；' +
      '或只传 query，将按本地索引自动解析最匹配的一篇再抓取。返回标题与正文纯文本（含代码块）。' +
      '正文可能较长，可用 maxChars 控制返回长度；仅接受 beishanair.github.io 站内 https 链接。',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: '教程文章 URL（仅限 beishanair.github.io 站内 https 链接）' },
        query: { type: 'string', description: '检索关键词，未提供 url 时用于自动解析最匹配的一篇' },
        maxChars: { type: 'integer', description: '正文最长返回字符数（200-30000，默认 6000）' },
      },
      additionalProperties: true,
    },
    execute: async (args) => {
      const a = args && typeof args === 'object' ? args : {};
      const cap = clampInt(a.maxChars, 200, 30000, 6000);
      let target = String(a.url || '').trim();
      let resolved = null;
      if (!target) {
        const q = String(a.query || '').trim();
        if (!q) return { error: '至少要提供 url 或 query 之一', version: VERSION };
        const r = search(q, 1);
        if (!r.matched.length) return { error: `未按「${q}」解析到教程，请先调用 besson_tutorial_lookup`, version: VERSION };
        resolved = r.matched[0];
        target = resolved.url;
      }
      if (!isSiteUrl(target)) {
        return { error: '仅支持本站（beishanair.github.io）的 https 教程链接', url: target, version: VERSION };
      }
      try {
        const art = await fetchArticle(target);
        if (art.error) return { error: art.error, url: target, version: VERSION };
        return {
          url: target,
          ...(resolved ? { resolvedFrom: `「${a.query}」→ [${resolved.series} ${resolved.seriesName} #${resolved.chapter}] ${resolved.title}` } : {}),
          title: art.title,
          bytes: art.bytes,
          chars: art.text.length,
          text: art.text.slice(0, cap),
          truncated: art.text.length > cap,
          version: VERSION,
        };
      } catch (e) {
        return { error: '抓取失败: ' + ((e && e.message) || e), url: target, version: VERSION };
      }
    },
  },
  {
    name: 'besson_tutorial_plan',
    description:
      '按目标生成北山Besson 教程站的学习路线：给出系列选择、关键章节顺序（含链接）与环境提示。' +
      'goal 支持：新手/入门/基础、进阶/高级/网络/渲染/粒子/配方/REI、neoforge、forge、fabric、迁移/升级、26.1/最新/前沿。' +
      'level 可选 beginner/intermediate/advanced。返回 structured route + next 建议调用。',
    parameters: {
      type: 'object',
      properties: {
        goal: { type: 'string', description: '学习目标，例如 "Fabric 入门做第一个模组"、"NeoForge 进阶 网络包"、"迁移到 26.1"' },
        level: { type: 'string', description: '可选：beginner / intermediate / advanced' },
        path: { type: 'string', description: '可选：模组工程目录（本地路径）。传了会自动体检并识别版本，按该工程系列排路线' },
        series: { type: 'string', description: '可选：优先系列 A-F（覆盖自动识别）' },
        loader: { type: 'string', description: '可选：fabric / forge / neoforge' },
        mcVersion: { type: 'string', description: '可选：1.20.1 / 1.21.1 / 26.1' },
        limit: { type: 'integer', description: '可选：专题章节数量上限（1-10，默认 3）' },
      },
      required: ['goal'],
      additionalProperties: true,
    },
    execute: (args) => {
      const a = args && typeof args === 'object' ? args : {};
      const goal = String(a.goal || '');
      const steps = planGoal(goal, a.level, { path: a.path, series: a.series, loader: a.loader, mcVersion: a.mcVersion });
      const picks = [...new Set(steps.map((s) => s.series).filter(Boolean))];
      const envSuggest = picks.slice(0, 1).map((id) => ({
        series: id,
        mc: (SERIES_INFO[id] || {}).mc,
        loader: (SERIES_INFO[id] || {}).loader,
        java: (SERIES_INFO[id] || {}).java,
        note: '调用 besson_tutorial_env 获取搭建清单',
      }));
      return {
        goal,
        level: a.level || 'auto',
        route: steps,
        env: envSuggest,
        next: [
          'besson_tutorial_env：生成环境搭建步骤（JDK/Gradle/模板仓库）',
          'besson_tutorial_series：确认选定系列的全部章节',
          'besson_tutorial_fetch：抓取第一章正文开始动手',
        ],
        note: '站点章节列表以实际文章为准；F 系列（NeoForge 26.1）尚未开更',
      };
    },
  },
  {
    name: 'besson_tutorial_compare',
    description:
      '对比北山Besson 教程站两个系列（或 MC 版本 / Loader）的工程与 API 差异：Java 版本、构建插件、包名映射、mod 清单文件、入口点、注册方式、事件系统、数据生成。' +
      '参数 a / b 传系列字母（A-F）或关键词（1.20.1、1.21.1、26.1、fabric、forge、neoforge）。返回差异表与对应迁移章节链接。',
    parameters: {
      type: 'object',
      properties: {
        a: { type: 'string', description: '基准：系列字母或关键词（如 A、1.20.1、forge、fabric）' },
        b: { type: 'string', description: '对照：系列字母或关键词（如 D、1.21.1、neoforge）' },
      },
      required: ['a', 'b'],
      additionalProperties: true,
    },
    execute: (args) => {
      const a = args && typeof args === 'object' ? args : {};
      const sa = resolveSeries(a.a);
      const sb = resolveSeries(a.b);
      if (!sa || !sb) {
        return { error: `无法解析：a=${a.a}, b=${a.b}。可用系列 A-F 或 1.20.1 / 1.21.1 / 26.1 / fabric / forge / neoforge` };
      }
      const ia = SERIES_INFO[sa.id] || {};
      const ib = SERIES_INFO[sb.id] || {};
      const keys = ['mc', 'loader', 'java', 'jdk', 'build', 'pkg', 'modfile', 'entrypoint', 'registry', 'events', 'datagen'];
      const rows = keys.map((k) => ({
        aspect: k,
        [sa.id]: ia[k] || '',
        [sb.id]: ib[k] || '',
        same: (ia[k] || '') === (ib[k] || ''),
      }));
      const refs = [sa.id, sb.id].flatMap((id) => {
        const s = DATA.series.find((x) => x.id === id);
        return (s && s.chapters || [])
          .filter((c) => /环境|搭建|迁移|第一个|配置/.test(c.title))
          .slice(0, 3)
          .map((c) => ({ series: id, chapter: c.n, title: c.title, url: c.url }));
      });
      return {
        a: { series: sa.id, name: sa.name, mc: ia.mc, loader: ia.loader },
        b: { series: sb.id, name: sb.name, mc: ib.mc, loader: ib.loader },
        rows,
        diffCount: rows.filter((r) => !r.same).length,
        javaSteps: `${ia.java} → ${ib.java}`,
        refs,
        templates: { [sa.id]: TEMPLATES[sa.id], [sb.id]: TEMPLATES[sb.id] },
        note: 'F 系列（NeoForge 26.1）未开更，26.1 只参照 E（Fabric 26.1）',
      };
    },
  },
  {
    name: 'besson_tutorial_env',
    description:
      '生成北山Besson 教程某系列的 Minecraft 模组开发环境搭建清单：JDK 版本与下载、Gradle 工程、模板仓库、启动命令、mod 清单文件与首章链接、常见坑。' +
      'mcVersion 传 MC 版本（1.20.1 / 1.21.1 / 26.1），loader 传 fabric / forge / neoforge（auto 自动匹配）。',
    parameters: {
      type: 'object',
      properties: {
        mcVersion: { type: 'string', description: 'MC 版本：1.20.1 / 1.21.1 / 26.1（可省略，由 loader 推断）' },
        loader: { type: 'string', description: 'fabric / forge / neoforge / auto（默认 auto）' },
      },
      additionalProperties: true,
    },
    execute: (args) => {
      const a = args && typeof args === 'object' ? args : {};
      const mc = String(a.mcVersion || '').trim();
      const ld = String(a.loader || 'auto').trim().toLowerCase();
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
      if (!id) {
        if (ld === 'neoforge') id = 'D';
        else if (ld === 'forge') id = 'C';
        else id = 'A';
      }
      const info = SERIES_INFO[id] || {};
      const jdkUrl = `https://adoptium.net/temurin/releases/?version=${info.jdk || '21'}`;
      const first = chapterUrl(id, '1');
      return {
        series: id,
        seriesName: (seriesMeta(id) || {}).name || id,
        mc: info.mc,
        loader: info.loader,
        java: info.java,
        jdk: info.jdk,
        steps: [
          `1. 安装 JDK ${info.jdk}（Temurin：${jdkUrl}），并设置 JAVA_HOME`,
          `2. 克隆模板仓库：${TEMPLATES[id] || '见 GitHub BeiShanair'}（或手工新建 Gradle 工程）`,
          `3. IDE 打开后等待 Gradle 同步（${info.build || ''}）`,
          `4. 目录约定：mod 清单 ${info.modfile || ''}，主类入口 ${info.entrypoint || ''}`,
          `5. 首次运行：./gradlew runClient（Windows：gradlew.bat runClient）`,
          `6. 按系列章节推进，从「${(first && first.title) || '第一章'}」开始：${(first && first.url) || ''}`,
        ],
        artifacts: {
          modfile: info.modfile,
          entrypoint: info.entrypoint,
          registry: info.registry,
          events: info.events,
          datagen: info.datagen,
        },
        pitfalls: [
          'JAVA_HOME 指向了别的 JDK 版本 → gradle 构建报 class 版本不匹配',
          'gradle 首次下载依赖慢 → 配置镜像或耐心等待（不要中断）',
          'mods.toml / neoforge.mods.toml / fabric.mod.json 的 loader 字段写错 → 游戏不加载模组',
          '改完注册代码没重启客户端 → 看不到新内容（注册发生在启动期）',
        ],
        next: ['besson_tutorial_series：列出该系列全部章节', 'besson_tutorial_fetch：抓取第一章正文动手'],
        version: VERSION,
      };
    },
  },

  {
    name: 'besson_mod_project',
    description:
      '检查本地 Minecraft 模组工程（目录 path）：识别加载器（Fabric / Forge / NeoForge）、MC 版本、Java 工具链、构建插件、mod 清单文件、主类与入口点，' +
      '并给出常见问题（版本不匹配、清单缺失、JAVA_HOME 错误等）与下一步建议。path 传项目根目录（含 build.gradle 或 gradle.properties 的目录）。',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '模组工程根目录（绝对路径；缺省为仓库/工作目录）' },
      },
      required: [],
      additionalProperties: true,
    },
    execute: (args) => {
      const a = args && typeof args === 'object' ? args : {};
      return scanProject(a.path ? String(a.path) : '');
    },
  },
  {
    name: 'besson_mod_migrate',
    description:
      '生成两个教程系列（或 MC 版本 / Loader）之间的迁移清单：Java 升级、构建插件替换、mod 清单文件替换、包名/映射变化、注册方式与事件系统差异、' +
      '数据生成迁移，附教程迁移章节链接。from/to 传系列字母（A-F）或关键词（如 1.20.1、1.21.1、26.1、fabric、forge、neoforge）。',
    parameters: {
      type: 'object',
      properties: {
        from: { type: 'string', description: '当前系列：A/B/C/D/E/F 或关键词（如 1.20.1 fabric）' },
        to: { type: 'string', description: '目标系列：A/B/C/D/E/F 或关键词（如 1.21.1 neoforge）' },
        level: { type: 'string', description: '可选：beginner / intermediate / advanced（影响清单详略）' },
      },
      required: ['from', 'to'],
      additionalProperties: true,
    },
    execute: (args) => {
      const a = args && typeof args === 'object' ? args : {};
      const sa = resolveSeries(a.from);
      const sb = resolveSeries(a.to);
      if (!sa || !sb) {
        return { error: '无法解析：from=' + (a.from || '') + ', to=' + (a.to || '') + '。可用系列 A-F 或 1.20.1 / 1.21.1 / 26.1 / fabric / forge / neoforge' };
      }
      if (sa.id === sb.id) return { error: 'from 与 to 是同一系列 ' + sa.id + '，无需迁移' };
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
      void a.level;
      return {
        from: { series: sa.id, name: sa.name, mc: ia.mc, loader: ia.loader, java: ia.java },
        to: { series: sb.id, name: sb.name, mc: ib.mc, loader: ib.loader, java: ib.java },
        javaSteps: (ia.java || '') + ' → ' + (ib.java || ''),
        diff,
        steps,
        refs,
        templates: { [sa.id]: TEMPLATES[sa.id], [sb.id]: TEMPLATES[sb.id] },
        note: '迁移节奏：先在构建期打通（Gradle/清单/主类可编译），再逐模块迁移注册与事件；F 系列（NeoForge 26.1）未开更，26.1 只参照 E。',
        version: VERSION,
      };
    },
  },
  {
    name: 'besson_mod_scaffold',
    description:
      '生成 Minecraft 模组工程骨架（NeoForge 1.21.1 / Fabric 1.20.1 / Fabric 1.21.x / Fabric 26.1 / Forge 1.20.1）。' +
      '给出 loader、mcVersion、modId 后返回可直接写入的文件清单（gradle 配置、主类、mod 清单），不直接落盘，由调用方保存后继续开发；建议先用 besson_mod_project 体检现有工程。',
    parameters: {
      type: 'object',
      properties: {
        loader: { type: 'string', description: 'fabric / forge / neoforge（默认 neoforge）' },
        mcVersion: { type: 'string', description: 'MC 版本，如 1.20.1 / 1.21.1 / 26.1（默认 1.21.1）' },
        modId: { type: 'string', description: 'mod id（小写，如 mysword）' },
        name: { type: 'string', description: 'mod 显示名（如 My Sword）' },
        group: { type: 'string', description: '包名（如 com.example.mysword）' },
      },
      required: [],
      additionalProperties: true,
    },
    execute: (args) => buildScaffold(args),
  },
  {
    name: 'besson_mod_mapping',
    description:
      'Minecraft 模组开发概念的中文 ↔ 官方映射名对照（物品/方块/方块实体/网络包/附魔/Mixin 等）。输入关键词返回匹配条目，不传关键词返回完整表。数据来源：北山Besson 教程与 Fabric/NeoForge/Forge 官方文档的公开命名。',
    parameters: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: '中文概念或英文类名，如 物品 / BlockEntity / 网络包' },
      },
      required: [],
      additionalProperties: true,
    },
    execute: (args) => {
      const a = args && typeof args === 'object' ? args : {};
      const kw = a.keyword != null ? a.keyword : (a.query || a.Query || a.key || '');
      const rows = lookupConcept(kw);
      const out = {
        ok: true,
        keyword: String(kw || ''),
        matched: rows.length,
        entries: rows.map(([zh, mapping, pkg]) => ({ zh, mapping, pkg })),
        source: '北山Besson 教程 + Fabric/NeoForge/Forge 官方公开命名',
      };
      if (rows.length === 0) out.note = '未匹配，试试：物品 / 方块 / 实体 / 网络包 / 生物群系 / Mixin / 附魔';
      return out;
    },
  },
];
export const TOOLS = Object.fromEntries(TOOL_DEFS.map((d) => [d.name, d]));

export const apply = (ctx) => {
  for (const def of TOOL_DEFS) {
    ctx.tools.register(defineBessonTool(def.name, def.description, def.parameters, def.execute));
  }
};
