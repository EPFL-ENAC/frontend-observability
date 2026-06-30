# @epfl-enac/observability-quasar

Quasar boot wiring for `@epfl-enac/observability-core`, with an optional
batteries-included UX layer.

Create a boot file in your app (`src/boot/observability.ts`):

```ts
import { createObservabilityBoot } from '@epfl-enac/observability-quasar';
import { createQuasarNotifyUx } from '@epfl-enac/observability-quasar/ux';

export default createObservabilityBoot({
  dsn: runtimeConfig.sentryDsn,
  environment: runtimeConfig.environment,
  release: runtimeConfig.release,
  ignoreErrors,
  ux: createQuasarNotifyUx({ t: i18n.global.t }),
});
```

Omit `ux` for pure wiring (no toasts). Pass `isHandled` to suppress
double-toasts for errors your API layer already surfaced.
