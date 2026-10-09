# Engineering walkthrough: reliable expense submission

## Requirement

Submit one expense, preserve pending work through network failure and client reload, and avoid duplicate server writes when the outcome of an earlier request is unknown.

## Decisions

| Decision | Reason and trade-off |
| --- | --- |
| Save before sending | A client can restart without losing its operation key; local storage itself can fail and must be checked |
| Integer minor units | Avoid floating-point money in the API; explicitly restrict supported currencies |
| Reuse key and payload | A lost response must not cause a new server write |
| Reject changed payload with 409 | Reusing a key for a different operation must be visible |
| Disable new submission while pending | Keep the one-item queue coherent; a multi-item queue is future work |
| Separate UI state from transport | Compose tests can exercise states and callbacks independently |
| Correlate by request ID | Investigate request outcomes without collecting claim amounts or identity |
| Process-local backend storage | Keep the sample runnable; disclose missing persistence and multi-instance protection |

## AI contribution and engineering verification

The initial implementation was produced with AI assistance from a feature brief and explicit constraints. The authoring workflow included code inspection, API-contract definition, test generation, test execution, and correction of observed failures. This demonstrates use of AI in this personal project; it does not establish measured productivity gains or a production deployment.

Review attention focused on storage-before-send, reuse of the idempotency key, payload conflicts, error status codes, cancellation, and exclusion of sensitive telemetry. The verification record lists commands that actually ran. Do not infer an AI suggestion is correct solely because its generated test passes.

## Requirement-to-test mapping

| Requirement | Evidence |
| --- | --- |
| Create an expense | HTTP integration test and mobile browser submission |
| Return same result after replay | API test: two submissions, same ID, one stored claim |
| Prevent concurrent duplicates | Ten concurrent HTTP requests using one key |
| Reject key reuse with a changed payload | API conflict test returning 409 |
| Restore offline work | Browser test with offline mode and reload |
| Recover after a lost response | Browser intercept accepts server result, drops response, retries, observes replay |
| Show loading, error, retry, success | Browser checks and Compose state/callback tests |
| Reject invalid input and unauthenticated calls | API and amount-parser tests |
| Keep telemetry minimal | Event field allowlist assertion |

## Example task for the skills

“Add a queued expense submission. It must survive client reload, retry safely after a lost response, expose recoverable UI states, and provide privacy-conscious debugging evidence. Define the contracts, implement, verify, review, and prepare a PR.”

## Next production steps

Replace demo authentication, use durable transactional idempotency and storage, specify key-retention rules, add background synchronization with backoff, define retryability by error category, and test process death and real-device networking. Add analytics only after reviewing event schemas and access controls.
