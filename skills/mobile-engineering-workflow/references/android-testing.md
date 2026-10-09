# Android test design

Use the project's existing JUnit version and mocking convention. The included demo uses JUnit 4 for JVM and Android instrumentation; guidance for coroutine tests does not imply those dependencies are already installed.

1. Give every test a condition, action, and observable result. Keep fixture setup, action, and assertions distinct.
2. Test parsers, domain rules, and mappings on the JVM. Assert complete meaningful output rather than an arbitrary property.
3. For suspend functions, inject dispatchers and use coroutine test scheduling. Use runTest and a consistent test dispatcher when the project includes kotlinx-coroutines-test.
4. For Flow/StateFlow, verify important emissions and cancellation with Turbine or an equivalent explicit collector. Do not assume every intermediate StateFlow emission must be observed; define the behavior being tested and control scheduling accordingly.
5. Use fakes for repository boundaries where they make success, timeout, conflict, and storage failure deterministic. Use real HTTP integration tests for wire contracts and server idempotency.
6. Test Compose content with injected state/callbacks, and separately test the state holder/repository. Add actual recreation and persistence tests before claiming process-death coverage.
7. Identify mocked boundaries in the evidence. A successful UI callback test does not establish end-to-end backend integration.

Example scenario: Given a saved USD claim whose earlier server response was lost, when the repository is recreated and retried, then amount, currency, and operation key remain identical and the server returns the existing claim ID.

The current Android sample persists currency but does not yet include this repository recreation test. Add it before making that coverage claim.
