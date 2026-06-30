import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.fn();
vi.mock('quasar', () => ({ Notify: { create: (...a: unknown[]) => notify(...a) } }));

import { createQuasarNotifyUx } from '../src/ux';

const t = (k: string) => `t:${k}`;

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('createQuasarNotifyUx', () => {
  it('toasts an error message', () => {
    const ux = createQuasarNotifyUx({ t });
    ux.onError!(new Error('broke'), { mechanism: 'vue', info: 'render' });
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'negative', message: 'broke' }),
    );
  });

  it('suppresses the toast when isHandled returns true', () => {
    const ux = createQuasarNotifyUx({ t, isHandled: () => true });
    ux.onError!(new Error('already toasted'), { mechanism: 'onunhandledrejection' });
    expect(notify).not.toHaveBeenCalled();
  });

  it('shows a sticky reload prompt once for chunk-load errors', () => {
    const ux = createQuasarNotifyUx({ t });
    ux.onChunkLoadError!(new Error('Loading chunk 1 failed'));
    ux.onChunkLoadError!(new Error('Loading chunk 2 failed'));
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ message: 't:new_version_available', timeout: 0 }),
    );
  });
});
