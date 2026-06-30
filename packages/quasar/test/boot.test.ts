import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const init = vi.fn();
const wire = vi.fn();
vi.mock('@epfl-enac/observability-core', () => ({
  initGlitchTip: (...a: unknown[]) => init(...a),
}));
vi.mock('../src/wiring', () => ({ wireVueErrorHandlers: (...a: unknown[]) => wire(...a) }));
// Quasar's boot() just returns the callback it is given.
vi.mock('quasar/wrappers', () => ({ boot: (cb: unknown) => cb }));

import { createObservabilityBoot } from '../src/index';

const app = {} as never;
const router = {} as never;

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('createObservabilityBoot', () => {
  it('inits the reporter when a DSN is present and always wires handlers', () => {
    const bootFn = createObservabilityBoot({ dsn: 'https://k@h/1', environment: 'prod' });
    bootFn({ app, router } as never);
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://k@h/1', environment: 'prod' }),
    );
    expect(wire).toHaveBeenCalledWith(expect.objectContaining({ app, router }));
  });

  it('skips init when no DSN but still wires handlers', () => {
    const bootFn = createObservabilityBoot({});
    bootFn({ app, router } as never);
    expect(init).not.toHaveBeenCalled();
    expect(wire).toHaveBeenCalledTimes(1);
  });
});
