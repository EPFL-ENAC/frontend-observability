import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: { external: [] }, // zero deps — bundle nothing external
  },
  plugins: [dts({ rollupTypes: true, include: ['src'] })],
  test: { environment: 'jsdom' },
});
