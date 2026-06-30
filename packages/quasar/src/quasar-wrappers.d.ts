// Minimal ambient declaration for quasar/wrappers.
// Full types come from @quasar/app-vite in Quasar CLI projects; as a library
// we provide just enough for our own usage in src/index.ts.
declare module 'quasar/wrappers' {
  import type { App } from 'vue';
  import type { Router } from 'vue-router';

  type BootCallback = (params: { app: App; router: Router }) => void | Promise<void>;
  export function boot(callback: BootCallback): BootCallback;
}
