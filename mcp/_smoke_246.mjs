import { spawn } from 'node:child_process';
const srv = spawn(process.execPath, ['mcp-server.mjs'], { stdio: ['pipe', 'pipe', 'inherit'] });
let buf = '';
const pending = new Map();
let nextId = 1;
const rpc = (method, params) => new Promise((res, rej) => {
  const id = nextId++;
  pending.set(id, { res, rej });
  srv.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
});
srv.stdout.on('data', (d) => {
  buf += d.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id).res(msg); pending.delete(msg.id); }
    } catch {}
  }
});
const init = await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'smoke', version: '0.0.1' } });
const ver = init.result.serverInfo.version;
const tools = await rpc('tools/list', {});
const names = tools.result.tools.map(t => t.name);
const plan = await rpc('tools/call', { name: 'besson_tutorial_plan', arguments: { goal: 'Mixin 注入', level: 'advanced', path: 'C:/Users/12899/AppData/Local/Temp/fix245/proj' } });
const route = JSON.parse(plan.result.content[0].text).route.map(s => s.series + (s.chapter ? ('#' + s.chapter) : ''));
const lk = await rpc('tools/call', { name: 'besson_tutorial_lookup', arguments: { query: '数据生成', series: 'D' } });
const lkText = JSON.parse(lk.result.content[0].text);
console.log('version:', ver, '| tools:', names.length, '| plan:', route.join('>'), '| D-only:', lkText.matched.map(m => m.series + '#' + m.chapter).join(','));
srv.kill();
