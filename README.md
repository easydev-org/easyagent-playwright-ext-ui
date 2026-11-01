# easyagent-playwright-ext-ui

The playwright extension's panel: the browsers the agent is driving, refreshed on a timer.

**A separate project, installed from a release.** The extension is a backend; `easyagent-ext-ui-host`
serves every panel at once, installing them from this repository's releases and answering the
console's discovery probe from their `ui.json`.

## Why a screenshot panel ships as static files

The panel polls one JPEG per context at about 1 fps. There is no client-side state, no router, no
component tree — three files served as they are. A build step would add a toolchain to move them from
one directory to another.

`dist/` is therefore the source, and what is in git is what ships.

## The contract

`dist/ui.json` describes the panel to the console — title, per-language descriptions, icon path. It
lived in the extension's TypeScript before this; it lives here now, because a wording change is a
panel release rather than a deploy of the service that owns the browsers.

`app.js` derives its API base from where it is mounted:

```js
const p = location.pathname.replace(/\/+$/, '')   // /ext/playwright
const API = `${p}/api/`                            // /ext/playwright/api/
```

That is what lets it run under the install host without knowing the host exists: the bundle is served
at `/ext/playwright/`, the API is forwarded to the extension.

## Releasing

```sh
git tag -a v0.1.0 -m "v0.1.0: the browser panel"
git push origin v0.1.0
```
