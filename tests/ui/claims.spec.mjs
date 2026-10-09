import { test, expect } from '@playwright/test';
test('unavailable storage shows an error and never sends a claim', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('storage blocked'); }; });
  let requests = 0; page.on('request', r => { if (r.url().endsWith('/claims')) requests++; });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('storage is unavailable or invalid');
  await page.getByLabel('Amount', { exact: true }).fill('5.00');
  await page.getByRole('button', { name: 'Submit claim' }).click();
  await expect(page.getByRole('status')).toContainText('storage is unavailable or invalid');
  expect(requests).toBe(0);
});
test('two open tabs share one pending claim without overwriting it', async ({ page, context }) => {
  const second = await context.newPage();
  await page.goto('/'); await second.goto('/'); await context.setOffline(true);
  await page.getByLabel('Amount', { exact: true }).fill('10.00');
  await page.getByRole('button', { name: 'Submit claim' }).click();
  await expect(second.getByRole('button', { name: 'Submit claim' })).toBeDisabled();
  const original = await page.evaluate(() => localStorage.getItem('playbook-pending-claim'));
  expect(await second.evaluate(() => localStorage.getItem('playbook-pending-claim'))).toBe(original);
  await context.setOffline(false);
  await second.getByRole('button', { name: 'Retry pending claim' }).click();
  await expect(second.getByRole('status')).toHaveText('Claim submitted successfully.');
  await expect(page.getByRole('button', { name: 'Submit claim' })).toBeEnabled();
});
test('submit a claim and expose a request ID without leaking amount', async ({ page }) => {
  await page.goto('/'); await page.getByLabel('Amount', { exact: true }).fill('25.00');
  await page.getByRole('button', { name: 'Submit claim' }).click();
  await expect(page.getByRole('status')).toHaveText('Claim submitted successfully.');
  await expect(page.getByRole('list', { name: 'Debug events' })).toContainText('requestId');
  await expect(page.getByRole('list', { name: 'Debug events' })).not.toContainText('2500');
});
test('queue offline, restore after reload, and submit with the original key', async ({ page, context }) => {
  await page.goto('/'); await context.setOffline(true);
  await page.getByLabel('Amount', { exact: true }).fill('12.50'); await page.getByRole('button', { name: 'Submit claim' }).click();
  await expect(page.getByRole('status')).toContainText('Saved locally');
  const key = await page.evaluate(() => JSON.parse(localStorage.getItem('playbook-pending-claim')).key);
  await context.setOffline(false); await page.reload();
  await expect(page.getByRole('status')).toContainText('Pending claim restored');
  const request = page.waitForRequest(r => r.url().endsWith('/claims') && r.method() === 'POST');
  await page.getByRole('button', { name: 'Retry pending claim' }).click();
  expect((await request).headers()['idempotency-key']).toBe(key);
  await expect(page.getByRole('status')).toHaveText('Claim submitted successfully.');
});
test('show loading and prevent another submission while a request is pending', async ({ page }) => {
  await page.route('**/claims', async route => { await new Promise(resolve => setTimeout(resolve, 400)); await route.continue(); });
  await page.goto('/'); await page.getByLabel('Amount', { exact: true }).fill('1.00');
  await page.getByRole('button', { name: 'Submit claim' }).click();
  await expect(page.getByRole('status')).toHaveText('Submitting…');
  await expect(page.getByRole('button', { name: 'Submit claim' })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('Claim submitted successfully.');
});
test('recover from a lost response without creating a duplicate claim', async ({ page }) => {
  let intercepted = false;
  await page.route('**/claims', async route => {
    if (!intercepted && route.request().method() === 'POST') { intercepted = true; await route.fetch(); await route.abort('failed'); }
    else await route.continue();
  });
  await page.goto('/'); await page.getByLabel('Amount', { exact: true }).fill('9.99');
  await page.getByRole('button', { name: 'Submit claim' }).click();
  await expect(page.getByRole('status')).toContainText('Submission failed');
  await page.getByRole('button', { name: 'Retry pending claim' }).click();
  await expect(page.getByRole('status')).toHaveText('Claim submitted successfully.');
  await expect(page.getByRole('list', { name: 'Debug events' })).toContainText('claim_replayed');
});
