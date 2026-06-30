# Migrating co2-calculator to the shared packages

This is a follow-up to creating the packages — do it once they are published.

1. Add the GitHub Packages registry to `.npmrc` (if not already present):
   ```
   @epfl-enac:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
   A GitHub token with `read:packages` is required (`GITHUB_TOKEN` in CI, personal token locally).
2. Add deps:
   `npm i @epfl-enac/observability-core @epfl-enac/observability-quasar`
3. Delete `frontend/src/utils/glitchtip.ts`; update imports to
   `@epfl-enac/observability-core`.
4. Replace `frontend/src/boot/sentry.ts` body with `createObservabilityBoot`,
   passing `createQuasarNotifyUx({ t: i18n.global.t, isHandled: (e) => e instanceof HTTPError })`
   to reproduce today's toasts, reload prompt, and HTTPError double-toast
   suppression. Keep `ignoreErrors` in the app and pass it through.
5. Delete the local `isChunkLoadError` (now from core).
6. The dev-only `window.__gtTest` console harness stays in the app's boot file.
7. Verify `make type-check` (vue-tsc) passes before committing.
