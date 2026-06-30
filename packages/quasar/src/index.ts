import { boot } from 'quasar/wrappers';
import { initGlitchTip, type GlitchTipOptions } from '@epfl-enac/observability-core';
import {
  wireVueErrorHandlers,
  type ErrorContext,
  type ObservabilityUx,
} from './wiring';
import type { App } from 'vue';
import type { Router } from 'vue-router';

// A Quasar boot default-export: the callback Quasar invokes with the app + router.
export type ObservabilityBoot = (ctx: { app: App; router: Router }) => void | Promise<void>;

export interface CreateObservabilityBootOptions
  extends Omit<GlitchTipOptions, 'dsn'> {
  // No DSN (dev, CI, unconfigured deploys) → reporter init is skipped and the
  // handlers report nowhere, but wiring is still installed.
  dsn?: string;
  ux?: ObservabilityUx;
}

// Build a Quasar boot default-export that inits the reporter (when a DSN is
// given) and wires the Vue/router/window handlers.
export function createObservabilityBoot(opts: CreateObservabilityBootOptions): ObservabilityBoot {
  const { dsn, ux, ...reporter } = opts;
  return boot(({ app, router }) => {
    if (dsn) initGlitchTip({ ...reporter, dsn });
    wireVueErrorHandlers({ app, router, ux });
  });
}

export { wireVueErrorHandlers };
export type { ObservabilityUx, ErrorContext };
