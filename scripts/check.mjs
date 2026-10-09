import { readdirSync, readFileSync } from 'node:fs'; import { join } from 'node:path'; import { execFileSync } from 'node:child_process';
function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => ['node_modules','.git','.gradle','build','dist','playwright-report','test-results'].includes(e.name) ? [] : e.isDirectory() ? walk(join(dir,e.name)) : [join(dir,e.name)]); }
for (const file of walk('.')) if (file.endsWith('.mjs')) execFileSync(process.execPath, ['--check', file]);
for (const folder of readdirSync('skills')) {
  const text = readFileSync(`skills/${folder}/SKILL.md`, 'utf8');
  if (!text.startsWith(`---\nname: ${folder}\n`) || !text.includes('\ndescription: ') || /TODO/.test(text)) throw new Error(`Invalid skill: ${folder}`);
}
JSON.parse(readFileSync('docs/api-contract.json', 'utf8'));
console.log('JavaScript syntax, skill metadata, and API schema checks passed.');
