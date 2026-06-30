# frontend-observability

GlitchTip/Sentry-compatible frontend error reporting for EPFL-ENAC apps.

- `@epfl-enac/observability-core` — framework-agnostic reporter (zero deps)
- `@epfl-enac/observability-quasar` — Quasar boot wiring + optional default UX

See each package's README for usage.

## Installing (consumers)

These packages are published to GitHub Packages. Add to your project's `.npmrc`:

```
@epfl-enac:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

A GitHub token with `read:packages` scope is required (set `GITHUB_TOKEN` in your environment or CI secrets).

## Releasing

1. Bump the changed package(s): `npm version <patch|minor|major> -w <pkg>`.
2. Commit and push.
3. Tag and push the tag: `git tag vX.Y.Z && git push --tags`.
   The Publish workflow builds and publishes both packages to GitHub Packages.
