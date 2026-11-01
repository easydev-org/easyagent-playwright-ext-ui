# easyagent-playwright-ext-ui

The playwright extension's panel: the browsers a tenant owns, and one of their screenshots on a timer.

**A separate project, installed from a release.** The extension is a backend; `easyagent-ext-ui-host`
serves every panel at once, installing them from this repository's releases and answering the console's
discovery probe from their `ui.json`.

## The contract

`proto/ui/v1/ui.proto` defines the API — `ListContexts` and `GetFrame`. The **TypeScript**
backend generates its server from the same file, and `src/gen/` here is generated from it. A field the
panel reads but the extension does not send is a compile error rather than an empty list.

`proto/ui/v1/ui.proto` is a **copy** of the backend's. CI compares it, regenerates, and opens a pull
request when they differ.

## Development

```sh
npm install
npm run proto     # regenerate src/gen from the proto
npm run check     # svelte-check
npm run build     # emits dist/, which easyagent-ext-ui-host serves
```

## Why a screenshot and not a screencast

It is what the extension decides, and the panel honours it: polling one JPEG per context at about
1 fps is enough to watch an agent work, and it is one request that cannot leak. A screencast needs a
WebSocket per context, a backpressure story, and a teardown path for every way a tab can disappear.

## How it is served

`easyagent-ext-ui-host` serves `dist/` at `/ext/playwright/` and forwards `/ext/playwright/api/` to the
extension. Same origin as the console, so the panel reads the bearer from `localStorage` — no token in
a URL, none in a message another window could read.
