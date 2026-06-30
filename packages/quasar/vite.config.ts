import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        ux: resolve(__dirname, 'src/ux.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      // Never bundle the framework or the core package into the adapter.
      external: [
        'vue',
        'vue-router',
        'quasar',
        'quasar/wrappers',
        '@epfl-enac-it4r/observability-core',
      ],
    },
  },
  plugins: [dts({ include: ['src'], tsconfigPath: './tsconfig.build.json' })],
  test: { environment: 'jsdom' },
});
