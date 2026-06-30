import { Notify, type QNotifyCreateOptions } from 'quasar';
import type { ErrorContext, ObservabilityUx } from './wiring';

export interface QuasarNotifyUxOptions {
  // App i18n translate fn — no hardcoded strings live in this package.
  t: (key: string) => string;
  // Return true for errors already surfaced elsewhere (e.g. a ky HTTPError the
  // API layer already toasted) so we don't double-toast.
  isHandled?: (err: unknown) => boolean;
  // Styling/behavior overrides merged into the error toast.
  notifyOptions?: QNotifyCreateOptions;
  // i18n keys for the chunk-load reload prompt.
  reloadKey?: string;
  reloadActionKey?: string;
}

function messageOf(err: unknown): string {
  return err instanceof Error
    ? err.message
    : ((err as { message?: string } | null)?.message ?? String(err));
}

// Default UX layer reproducing co2-calculator's behavior: a negative toast on
// each error and a single sticky "new version, reload?" prompt on chunk-load.
// Opt-in (only used if the app passes it as `ux`) and parameterized.
export function createQuasarNotifyUx(
  opts: QuasarNotifyUxOptions,
): ObservabilityUx {
  const {
    t,
    isHandled,
    notifyOptions,
    reloadKey = 'new_version_available',
    reloadActionKey = 'reload',
  } = opts;

  // Guard so a burst of chunk errors (one per failed prefetch) shows one toast.
  let reloadShown = false;

  return {
    onError(err: unknown, ctx: ErrorContext) {
      if (isHandled?.(err)) return;
      Notify.create({
        color: 'negative',
        message: messageOf(err),
        caption: ctx.info,
        position: 'top',
        timeout: 5000,
        actions: [{ icon: 'close', color: 'white' }],
        ...notifyOptions,
      });
    },
    onChunkLoadError() {
      if (reloadShown) return;
      reloadShown = true;
      Notify.create({
        color: 'info',
        message: t(reloadKey),
        position: 'top',
        timeout: 0, // sticky until the user acts
        actions: [
          {
            label: t(reloadActionKey),
            color: 'white',
            handler: () => window.location.reload(),
          },
        ],
      });
    },
  };
}
