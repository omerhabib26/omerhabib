# Delivery evidence

Use npm run lint, npm test, npm run test:ui, npm run build. Validate commits with node scripts/conventional-commit.mjs BASE..HEAD.

Create a PR using gh pr create --body-file <reviewed-body-file> when authenticated CLI support exists, or use the connected GitHub tool. Do not place untrusted text inside shell commands.

CI publishes source bundles and a debug APK when Android checks succeed. The tag workflow packages a source release; it does not publish to Play Store or deploy a backend. Production requires secure auth, durable storage, transactional idempotency, a retention policy, HTTPS, and a reviewed deployment target.
