---
name: debug-with-telemetry
description: Use for analytics-assisted debugging, crash traces, request correlation, failed submissions, CI logs, and root-cause investigations.
---

# Investigate failures using sanitized correlated evidence

Collect sanitized reproduction steps, app version, timestamps, state transitions, error codes, and request IDs. Avoid tokens, amounts, names, email addresses, or raw user payloads.
1. Separate observations from hypotheses.
2. Correlate client submission events with server request IDs and API results; treat analytics as supplementary evidence.
3. Check whether the server committed before the client timed out, whether retry reused the same key, and whether local pending state survived.
4. Form ranked hypotheses and a discriminating test for each.
5. Reproduce, make a bounded fix, rerun regression tests, and document residual limitations.
Return an evidence timeline, hypothesis table, verification steps, and conclusion. Do not infer causality from an event count alone. This demo uses local structured events, not a live Firebase or production analytics integration.
