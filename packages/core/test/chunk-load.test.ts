import { describe, expect, it } from 'vitest';
import { isChunkLoadError } from '../src/index';

describe('isChunkLoadError', () => {
  it.each([
    'Failed to fetch dynamically imported module: https://x/y.js',
    'error loading dynamically imported module',
    'Importing a module script failed.',
    'Unable to preload CSS for /assets/x.css',
    'Loading chunk 42 failed',
  ])('matches %s', (message) => {
    expect(isChunkLoadError(new Error(message))).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(isChunkLoadError(new Error('TypeError: x is undefined'))).toBe(false);
  });

  it('handles non-Error input', () => {
    expect(isChunkLoadError('Loading chunk 7 failed')).toBe(true);
  });
});
