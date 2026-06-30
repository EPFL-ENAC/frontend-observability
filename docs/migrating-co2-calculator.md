# Migrating co2-calculator to the shared packages

This is a follow-up to creating the packages — do it once they are published.

1. Add deps:
   `npm i @epfl-enac/observability-core @epfl-enac/observability-quasar`
2. Delete `frontend/src/utils/glitchtip.ts`; update imports to
   `@epfl-enac/observability-core`.
3. Replace `frontend/src/boot/sentry.ts` body with `createObservabilityBoot`,
   passing `createQuasarNotifyUx({ t: i18n.global.t, isHandled: (e) => e instanceof HTTPError })`
   to reproduce today's toasts, reload prompt, and HTTPError double-toast
   suppression. Keep `ignoreErrors` in the app and pass it through.
4. Delete the local `isChunkLoadError` (now from core).
5. The dev-only `window.__gtTest` console harness stays in the app's boot file.
6. Verify `make type-check` (vue-tsc) passes before committing.
