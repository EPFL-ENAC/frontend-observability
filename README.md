# frontend-observability

GlitchTip/Sentry-compatible frontend error reporting for EPFL-ENAC apps.

- `@epfl-enac-it4r/observability-core` — framework-agnostic reporter (zero deps)
- `@epfl-enac-it4r/observability-quasar` — Quasar boot wiring + optional default UX

See each package's README for usage.

## Installing (consumers)

The packages are on public npm — no auth or `.npmrc` required:

```
npm i @epfl-enac-it4r/observability-core @epfl-enac-it4r/observability-quasar
```

## Releasing

1. Bump the changed package(s): `npm version <patch|minor|major> -w <pkg>`.
2. Commit and push.
3. Tag and push the tag: `git tag vX.Y.Z && git push --tags`.
   The Publish workflow builds and publishes both packages to npm.
