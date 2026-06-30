import { boot } from 'quasar/wrappers';
import { initGlitchTip, type GlitchTipOptions } from '@epfl-enac/observability-core';
import {
  wireVueErrorHandlers,
  type ErrorContext,
  type ObservabilityUx,
} from './wiring';

export interface CreateObservabilityBootOptions
  extends Omit<GlitchTipOptions, 'dsn'> {
  // No DSN (dev, CI, unconfigured deploys) → reporter init is skipped and the
  // handlers report nowhere, but wiring is still installed.
  dsn?: string;
  ux?: ObservabilityUx;
}

// Build a Quasar boot default-export that inits the reporter (when a DSN is
// given) and wires the Vue/router/window handlers.
export function createObservabilityBoot(opts: CreateObservabilityBootOptions) {
  const { dsn, ux, ...reporter } = opts;
  return boot(({ app, router }) => {
    if (dsn) initGlitchTip({ ...reporter, dsn });
    wireVueErrorHandlers({ app, router, ux });
  });
}

export { wireVueErrorHandlers };
export type { ObservabilityUx, ErrorContext };
