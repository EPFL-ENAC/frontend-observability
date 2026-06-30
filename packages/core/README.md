# @epfl-enac/observability-core

Framework-agnostic GlitchTip/Sentry-compatible error reporter. Zero deps.

```ts
import { initGlitchTip, captureError } from '@epfl-enac/observability-core';

initGlitchTip({ dsn, environment, release, ignoreErrors });
captureError(new Error('boom'), { mechanism: 'manual' });
```

Exports: `initGlitchTip`, `captureError`, `addBreadcrumb`,
`startNavigationTrace`, `isChunkLoadError`.
