import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const capture = vi.fn();
const breadcrumb = vi.fn();
const startTrace = vi.fn();
vi.mock('@epfl-enac/observability-core', () => ({
  captureError: (...a: unknown[]) => capture(...a),
  addBreadcrumb: (...a: unknown[]) => breadcrumb(...a),
  startNavigationTrace: () => startTrace(),
  isChunkLoadError: (e: unknown) =>
    e instanceof Error && e.message.includes('chunk'),
}));

import { wireVueErrorHandlers } from '../src/wiring';

function makeApp() {
  return { config: { errorHandler: undefined } } as unknown as import('vue').App;
}
function makeRouter() {
  const handlers: { error?: (e: unknown) => void; after?: (t: never, f: never) => void } = {};
  return {
    onError: (h: (e: unknown) => void) => (handlers.error = h),
    afterEach: (h: (t: never, f: never) => void) => (handlers.after = h),
    _fireError: (e: unknown) => handlers.error?.(e),
    _fireAfter: (t: never, f: never) => handlers.after?.(t, f),
  } as never as import('vue-router').Router & {
    _fireError(e: unknown): void;
    _fireAfter(t: unknown, f: unknown): void;
  };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('wireVueErrorHandlers', () => {
  it('captures vue errors and calls ux.onError', () => {
    const app = makeApp();
    const router = makeRouter();
    const onError = vi.fn();
    wireVueErrorHandlers({ app, router, ux: { onError } });
    app.config.errorHandler!(new Error('render fail'), null, 'render');
    expect(capture).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ mechanism: 'vue' }),
    );
    expect(onError).toHaveBeenCalledWith(expect.any(Error), {
      mechanism: 'vue',
      info: 'render',
    });
  });

  it('calls onChunkLoadError only for chunk-load router errors', () => {
    const router = makeRouter();
    const onChunkLoadError = vi.fn();
    wireVueErrorHandlers({ app: makeApp(), router, ux: { onChunkLoadError } });
    router._fireError(new Error('plain nav error'));
    expect(onChunkLoadError).not.toHaveBeenCalled();
    router._fireError(new Error('Loading chunk 3 failed'));
    expect(onChunkLoadError).toHaveBeenCalledTimes(1);
  });

  it('starts a trace and records a breadcrumb after navigation', () => {
    const router = makeRouter();
    wireVueErrorHandlers({ app: makeApp(), router });
    router._fireAfter({ fullPath: '/b' }, { fullPath: '/a' });
    expect(startTrace).toHaveBeenCalledTimes(1);
    expect(breadcrumb).toHaveBeenCalledWith('/a → /b', 'navigation');
  });
});
