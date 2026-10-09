---
name: verify-mobile-delivery
description: Use for Given-When-Then unit tests, Compose UI testing, browser UI testing, API contract testing, and regression verification.
---

# Test mobile behavior and API integration end to end

Read requirements and contracts independently of implementation.
1. Derive tests for success, validation, authentication, timeout, offline, retry, recreation, concurrent writes, and conflicts.
2. Use Given-When-Then names and assert behavior, not just lack of exceptions.
3. Include a lost-response scenario: server accepts a write, response is lost, retry returns the same result without duplicating the write.
4. Separate pure unit tests, UI state tests, and real HTTP integration tests. Label mocked boundaries.
5. Run tests; preserve exact commands, counts, failures, screenshots/traces where supported, and tool limitations.
6. Check logs and analytics payloads for tokens and personal data.
Return a requirement-to-test matrix and evidence. Never mark Android emulator tests passed unless an emulator actually ran. Read references/test-matrix.md for the example coverage and commands.
