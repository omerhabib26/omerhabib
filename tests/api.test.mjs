import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../demo/server.mjs';

async function fixture(t) {
  const events = [];
  const app = createApp({ onEvent: e => events.push(e) });
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => app.close(resolve)));
  const url = `http://127.0.0.1:${app.address().port}`;
  const post = (key, body = { amountMinor: 2500, currency: 'EUR' }, token = 'local-demo-token') => fetch(`${url}/claims`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': key, 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  return { url, post, events };
}
test('Given the same key and payload, when submitted twice, then one claim is created', async t => {
  const { post, url } = await fixture(t);
  const first = await post('claim-0001'); const firstBody = await first.json();
  const second = await post('claim-0001'); const secondBody = await second.json();
  assert.equal(first.status, 201); assert.equal(second.status, 200);
  assert.equal(secondBody.claim.id, firstBody.claim.id); assert.equal(secondBody.replayed, true);
  const list = await fetch(`${url}/claims`, { headers: { Authorization: 'Bearer local-demo-token' } });
  assert.equal((await list.json()).claims.length, 1);
});
test('Given a reused key with a changed payload, then return 409', async t => {
  const { post } = await fixture(t); await post('claim-0002');
  assert.equal((await post('claim-0002', { amountMinor: 3000, currency: 'EUR' })).status, 409);
});
test('Given concurrent retries, then one request creates and others replay', async t => {
  const { post } = await fixture(t);
  const responses = await Promise.all(Array.from({ length: 10 }, () => post('claim-0003')));
  assert.equal(responses.filter(r => r.status === 201).length, 1);
  assert.equal(new Set(await Promise.all(responses.map(async r => (await r.json()).claim.id))).size, 1);
});
test('Given invalid authentication, then return 401 with a request ID', async t => {
  const { post } = await fixture(t); const response = await post('claim-0004', {}, 'wrong');
  const body = await response.json(); assert.equal(response.status, 401);
  assert.equal(body.error.code, 'UNAUTHORIZED'); assert.equal(body.error.requestId, response.headers.get('X-Request-Id'));
});
test('Given invalid inputs, then reject malformed JSON, invalid amounts, currencies, and keys', async t => {
  const { post } = await fixture(t);
  assert.equal((await post('claim-0005', '{')).status, 400);
  assert.equal((await post('short')).status, 400);
  for (const body of [null, [], { amountMinor: -1, currency: 'EUR' }, { amountMinor: 1.5, currency: 'EUR' }, { amountMinor: 100, currency: 'GBP' }]) assert.equal((await post('claim-0005', body)).status, 422);
});
test('Given an oversized payload, then return 413', async t => {
  const { post } = await fixture(t); assert.equal((await post('claim-0006', 'x'.repeat(5000))).status, 413);
});
test('Given a submission, then analytics contains correlation metadata only', async t => {
  const { post, events } = await fixture(t); await post('claim-0007');
  assert.equal(events[0].name, 'claim_submitted');
  assert.deepEqual(Object.keys(events[0]).sort(), ['name', 'requestId']);
});
