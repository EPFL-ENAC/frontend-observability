import type { App, ComponentPublicInstance } from 'vue';
import type { Router } from 'vue-router';
import {
  addBreadcrumb,
  captureError,
  isChunkLoadError,
  startNavigationTrace,
} from '@epfl-enac-it4r/observability-core';

export interface ErrorContext {
  mechanism: string;
  info?: string;
}

// Optional UX layer. Wiring calls these; the app decides what they do (toast,
// reload prompt). No knowledge of toasts/i18n lives here.
export interface ObservabilityUx {
  onError?(err: unknown, ctx: ErrorContext): void;
  onChunkLoadError?(err: unknown): void;
}

export interface WireOptions {
  app: App;
  router: Router;
  ux?: ObservabilityUx;
}

// Shallow (depth-1) copy of props for the report; nested values collapse to
// "[Object]"/"[Array]" to avoid circular refs and giant payloads.
function shallowProps(
  props: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props ?? {})) {
    out[key] =
      value === null || typeof value !== 'object'
        ? value
        : Array.isArray(value)
          ? '[Array]'
          : '[Object]';
  }
  return out;
}

function vueErrorContext(
  instance: ComponentPublicInstance | null,
  info: string,
): Record<string, unknown> {
  const type = instance?.$?.type as
    | { name?: string; __name?: string }
    | undefined;
  return {
    componentName: type?.name || type?.__name || 'Anonymous Component',
    lifecycleHook: info,
    propsData: shallowProps(instance?.$props),
  };
}

function installWindowHandlers(ux?: ObservabilityUx): void {
  window.addEventListener('error', (event) => {
    if (event.message?.includes('ResizeObserver loop')) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      return;
    }
    const err = event.error ?? event.message;
    captureError(err, { mechanism: 'onerror' });
    ux?.onError?.(err, { mechanism: 'onerror', info: `${event.filename}:${event.lineno}:${event.colno}` });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    captureError(reason, { mechanism: 'onunhandledrejection', handled: false });
    ux?.onError?.(reason, { mechanism: 'onunhandledrejection' });
  });
}

// Wire a Vue app + router into the reporter. Framework-generic (no Quasar
// import) so a future plain-Vue adapter reuses this as-is.
export function wireVueErrorHandlers({ app, router, ux }: WireOptions): void {
  const previous = app.config.errorHandler;
  app.config.errorHandler = (err, instance, info) => {
    if (typeof previous === 'function') previous(err, instance, info);
    captureError(err, {
      mechanism: 'vue',
      contexts: { vue: vueErrorContext(instance, info) },
    });
    ux?.onError?.(err, { mechanism: 'vue', info });
  };

  router.onError((err) => {
    captureError(err, { mechanism: 'vue-router' });
    if (isChunkLoadError(err)) ux?.onChunkLoadError?.(err);
  });

  router.afterEach((to, from) => {
    startNavigationTrace();
    addBreadcrumb(`${from.fullPath} → ${to.fullPath}`, 'navigation');
  });

  installWindowHandlers(ux);
}
