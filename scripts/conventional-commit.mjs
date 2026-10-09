import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
export const validCommit = message => /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .{1,100}$/.test(message.split('\n')[0]);
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const range = process.argv[2];
  const messages = range ? execFileSync('git', ['log', '--format=%s', range], { encoding: 'utf8' }).trim().split('\n').filter(Boolean) : [execFileSync('git', ['log', '-1', '--format=%s'], { encoding: 'utf8' }).trim()];
  const bad = messages.filter(m => !validCommit(m) && !/^Merge /.test(m));
  if (bad.length) { console.error('Invalid Conventional Commits:', bad.join('\n')); process.exit(1); }
  console.log(`Validated ${messages.length} commit(s).`);
}
