# Telemetry for debugging

The demo uses structured local events. No third-party analytics SDK or live dashboard is configured.

| Event | Fields | Diagnostic value |
| --- | --- | --- |
| claim_queued_offline | name | The client preserved work without attempting a write |
| claim_submission_started | name | Submission entered its loading state |
| claim_submitted | name, requestId | Client or server observed a successful write |
| claim_replayed | name, requestId | Retry returned the existing operation result |
| claim_submission_failed | name, requestId | Client received an unsuccessful HTTP response |
| claim_retry_available | name | Pending work remains after an uncertain outcome |
| api_failure | name, requestId, code | Server rejected or failed a request |

Never log tokens, claim amounts, raw payloads, names, contact details, or employee identifiers. Event timestamps, environment, app version, and session-safe correlation can be added through an approved telemetry adapter.

For an actual product, map these events to an approved analytics system and correlate request IDs with backend logs. Add sanitized exceptions to a crash-reporting system. Analytics helps form hypotheses; reproduce the failure and verify the fix with tests before concluding root cause.

Example: a client failure followed by a replay event suggests the earlier server write succeeded despite a lost response. Inspect the request timeline and reproduce that failure mode; the lost-response UI test exercises it directly.
