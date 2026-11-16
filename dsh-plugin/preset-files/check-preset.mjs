// 轻量 YAML 结构检查：近似模拟 DSH 对 cordis.patch.yml 的解析，检测同一 mapping 内重复键
//（踩过的坑：persona suffix 块缩进把后续插件行吞成重复 key → 启动 YAMLException: duplicated mapping key）。
// 用法：node check-preset.mjs [path]
//   缺省读取 $DSH_HOME/profiles/desktop/cordis.patch.yml（或 ~/.dsh/profiles/desktop/cordis.patch.yml）
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const base = process.env.DSH_HOME || join(homedir(), '.dsh');
const path = process.argv[2] || join(base, 'profiles', 'desktop', 'cordis.patch.yml');
const text = readFileSync(path, 'utf8');

const problems = [];
const stack = []; // { indent, keys:Set }
const lines = text.split(/\r?\n/);

function top() { return stack[stack.length - 1]; }
function popTo(indent) { while (stack.length && top().indent >= indent) stack.pop(); }
function push(indent, key) { stack.push({ indent, keys: new Set([key]) }); }
function check(indent, key, ln) {
  while (stack.length && top().indent > indent) stack.pop();
  const t = top();
  if (t && t.indent === indent) {
    if (t.keys.has(key)) problems.push(`L${ln}: 重复键 "${key}"（同一 mapping 内）`);
    t.keys.add(key);
  } else push(indent, key);
}

for (let i = 0; i < lines.length; i++) {
  const ln = i + 1;
  const raw = lines[i].replace(/\s+#.*$/, '');
  const t = raw.trim();
  if (!t || t.startsWith('#')) continue;
  const indent = raw.length - raw.trimStart().length;
  const item = t.match(/^-(\s+)([^:\s][^:]*?):(\s|$)/);
  if (item) {
    // 列表项：开一个新 mapping（同一缩进的兄弟项互不重复）
    const keyIndent = indent + 1 + item[1].length;
    popTo(keyIndent);
    push(keyIndent, item[2].replace(/^['"]|['"]$/g, ''));
    continue;
  }
  const kv = t.match(/^([^:\s][^:]*?):(\s|$)/);
  if (!kv) continue;
  check(indent, kv[1].replace(/^['"]|['"]$/g, ''), ln);
}

// DSH 0.2.2 只注册 provider / model 两个 prompt 变量；其他 {{...}} 会在装配系统提示词时抛
// "unknown prompt variable"。这里顺带拦住 {{cwd}} 之类的旧模板变量。
const ALLOWED_VARS = new Set(['provider', 'model']);
for (let i = 0; i < lines.length; i++) {
  const raw = lines[i].trim();
  if (raw.startsWith('#')) continue;
  for (const m of lines[i].matchAll(/\{\{\s*([A-Za-z0-9_-]+)\s*\}\}/g)) {
    if (!ALLOWED_VARS.has(m[1])) {
      problems.push(`L${i + 1}: 未注册的 prompt 变量 "{{${m[1]}}}"（DSH 0.2.2 仅注册 provider / model；工作目录请用 runtime context）`);
    }
  }
}
if (problems.length) {
  console.error('❌ YAML 结构检查失败：');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log('✅ YAML 结构检查通过（无同层重复键）：' + path);
