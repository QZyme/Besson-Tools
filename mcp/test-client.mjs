// 北山Besson MCP 服务器测试客户端（stdio 传输）
// 用法：npm install 之后执行 node test-client.mjs
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [__dirname + '/mcp-server.mjs'],
  stderr: 'inherit',
});
const client = new Client({ name: 'besson-tutorials-mcp-test', version: '0.0.1' });

await client.connect(transport);
console.log('已连接 MCP 服务器');

const tools = await client.listTools();
console.log('工具列表:', tools.tools.map((t) => t.name).join(', '));

const cases = [
  ['besson_tutorial_lookup', { query: 'NeoForge 生物群系', limit: 3 }],
  ['besson_tutorial_lookup', { query: '附魔' }],
  ['besson_tutorial_index', {}],
  ['besson_tutorial_series', { series: 'E' }],
  ['besson_tutorial_series', { series: 'zz' }],
  // 正文抓取：按关键词自动解析
  ['besson_tutorial_fetch', { query: '附魔', maxChars: 500 }],
  // 正文抓取：直接给链接
  ['besson_tutorial_fetch', { url: 'https://beishanair.github.io/2026/08/14/nf121/33fluid/', maxChars: 400 }],
  // 正文抓取：非法链接（应被拒绝）
  ['besson_tutorial_fetch', { url: 'https://example.com/evil', maxChars: 300 }],
  // v2.0.0 新增工具
  ['besson_tutorial_plan', { goal: 'Fabric 入门做第一个模组' }],
  ['besson_tutorial_compare', { a: 'A', b: 'D' }],
  ['besson_tutorial_env', { mcVersion: '1.21.1', loader: 'neoforge' }],
];
for (const [name, args] of cases) {
  const res = await client.callTool({ name, arguments: args });
  const text = res.content && res.content[0] ? res.content[0].text : JSON.stringify(res);
  console.log(`\n== ${name}(${JSON.stringify(args)}) ==`);
  console.log(String(text).slice(0, 600));
}
await client.close();
console.log('\n测试完成 ✅');