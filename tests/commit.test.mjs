import { test } from 'node:test'; import assert from 'node:assert/strict';
import { validCommit } from '../scripts/conventional-commit.mjs';
test('accept typed, scoped, and breaking commit messages', () => { for (const m of ['feat: add queue', 'fix(api): preserve retry key', 'feat!: change contract']) assert.equal(validCommit(m), true); });
test('reject missing types, subjects, and unsupported prefixes', () => { for (const m of ['updated code', 'feat:', 'feature: add queue']) assert.equal(validCommit(m), false); });
