const status = document.querySelector('#status');
const submit = document.querySelector('#submit');
const retry = document.querySelector('#retry');
const storageKey = 'playbook-pending-claim';
let pending;
let storageProblem = false;
try { pending = readPending(); } catch { storageProblem = true; }
let busy = false;
function readPending() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  const value = JSON.parse(raw);
  if (typeof value?.key !== 'string' || !Number.isInteger(value?.body?.amountMinor) || !['EUR', 'USD', 'PKR'].includes(value?.body?.currency)) throw new Error('Invalid pending data');
  return value;
}
async function exclusive(action) {
  if (!navigator.locks) { render('This demo requires browser Web Locks for safe multi-tab submission.'); return; }
  await navigator.locks.request('playbook-claim-write', { ifAvailable: true }, async lock => {
    if (!lock) { render('Another tab is submitting this claim.'); return; }
    try { pending = readPending(); await action(); }
    catch { render('Pending storage is unavailable or invalid. No claim was submitted.'); }
  });
}
function event(name, requestId) {
  const row = document.createElement('li');
  row.textContent = JSON.stringify({ name, ...(requestId ? { requestId } : {}) });
  document.querySelector('#events').prepend(row);
}
function connection() { document.querySelector('#connection').textContent = navigator.onLine ? 'Online' : 'Offline'; }
function render(message) {
  status.textContent = message;
  submit.disabled = busy || Boolean(pending);
  retry.hidden = !pending;
  retry.disabled = busy;
}
async function send() {
  if (busy || !pending) return;
  if (!navigator.onLine) { event('claim_queued_offline'); render('Saved locally. Retry when you are online.'); return; }
  busy = true; render('Submitting…'); event('claim_submission_started');
  try {
    const response = await fetch('/claims', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer local-demo-token', 'Idempotency-Key': pending.key }, body: JSON.stringify(pending.body), signal: AbortSignal.timeout(10000) });
    const requestId = response.headers.get('X-Request-Id');
    const data = await response.json();
    if (!response.ok) { event('claim_submission_failed', requestId); throw new Error(data.error?.code || 'API_ERROR'); }
    if (typeof data.claim?.id !== 'string' || data.claim.status !== 'submitted' || typeof data.replayed !== 'boolean') throw new Error('INVALID_RESPONSE');
    if (readPending()?.key === pending.key) localStorage.removeItem(storageKey);
    pending = readPending();
    event(data.replayed ? 'claim_replayed' : 'claim_submitted', requestId);
    render('Claim submitted successfully.');
  } catch (error) {
    event('claim_retry_available');
    render(`Submission failed (${error.message}). Your claim is saved; retry uses the same key.`);
  } finally { busy = false; render(status.textContent); }
}
document.querySelector('#claim-form').addEventListener('submit', async e => {
  e.preventDefault();
  if (busy) return;
  await exclusive(async () => {
  if (pending) { render('A pending claim already exists. Retry it before creating another.'); return; }
  const input = document.querySelector('#amount').value;
  if (!/^\d+(\.\d{1,2})?$/.test(input)) { render('Enter an amount with at most two decimal places.'); return; }
  const amount = Number(input);
  const amountMinor = Math.round(amount * 100);
  if (!Number.isFinite(amount) || amountMinor < 1 || amountMinor > 100000000) { render('Enter a valid amount.'); return; }
  pending = { key: crypto.randomUUID(), body: { amountMinor, currency: document.querySelector('#currency').value } };
  try { localStorage.setItem(storageKey, JSON.stringify(pending)); } catch { pending = null; render('Local storage unavailable. Claim was not submitted.'); return; }
  await send();
  });
});
retry.addEventListener('click', () => exclusive(send));
addEventListener('storage', e => {
  if (e.key !== storageKey || busy) return;
  try { pending = readPending(); render(pending ? 'Pending claim restored. Retry when ready.' : 'Ready to submit.'); }
  catch { render('Pending storage is invalid.'); }
});
addEventListener('online', connection); addEventListener('offline', connection);
connection(); render(storageProblem ? 'Pending storage is unavailable or invalid. No claim was submitted.' : pending ? 'Pending claim restored. Retry when ready.' : 'Ready to submit.');
