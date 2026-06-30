import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureError, initGlitchTip } from '../src/index';

const DSN = 'https://pubkey@glitchtip.example.com/42';

// Parse a captured envelope body (3 newline-delimited JSON lines) into its event.
function eventFrom(body: string) {
  const [, , event] = body.split('\n');
  return JSON.parse(event);
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 200 })));
  vi.stubGlobal('fetch', fetchMock);
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('initGlitchTip', () => {
  it('disables reporting and logs on a malformed DSN', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    initGlitchTip({ dsn: 'not-a-dsn' });
    captureError(new Error('boom'));
    expect(err).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('captureError envelope', () => {
  it('POSTs a Sentry envelope with the error type and message', () => {
    initGlitchTip({ dsn: DSN, environment: 'test', release: '1.2.3' });
    captureError(new TypeError('kaboom'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/api/42/envelope/?sentry_key=pubkey');
    const event = eventFrom(init.body as string);
    expect(event.exception.values[0].type).toBe('TypeError');
    expect(event.exception.values[0].value).toBe('kaboom');
    expect(event.release).toBe('1.2.3');
    expect(event.environment).toBe('test');
  });

  it('tags a non-Error rejection as a synthetic NonError', () => {
    initGlitchTip({ dsn: DSN });
    captureError({ code: 'E_TEST' });
    const event = eventFrom(fetchMock.mock.calls[0][1].body as string);
    expect(event.exception.values[0].type).toBe('NonError');
    expect(event.exception.values[0].mechanism.synthetic).toBe(true);
  });

  it('drops messages matching ignoreErrors', () => {
    initGlitchTip({ dsn: DSN, ignoreErrors: ['ResizeObserver loop'] });
    captureError(new Error('ResizeObserver loop limit exceeded'));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('dedupes an identical consecutive capture', () => {
    initGlitchTip({ dsn: DSN });
    const e = new Error('same');
    captureError(e);
    captureError(e);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
