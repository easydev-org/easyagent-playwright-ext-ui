// The typed client for this panel's API.
//
// THE CONTRACT IS A .PROTO SHARED WITH THE BACKEND, generated into src/gen. Before this, the panel
// and the extension agreed on field names by review — the arrangement that has already produced an
// empty list in another extension when one side said `Path` and the other read `path`.

import { createClient } from '@connectrpc/connect'
import { createConnectTransport } from '@connectrpc/connect-web'

import { UiService } from './gen/ui/v1/ui_pb.js'

// WHERE THE API LIVES, derived from the mount.
//
// Absolute rather than relative: this document is opened at `/ext/playwright/`, and a relative path
// would resolve against whatever the current URL happens to be. Taking the mount point from
// location.pathname and appending one fixed segment removes the guess.
const API_BASE = (() => {
  const p = location.pathname.replace(/\/+$/, '') // /ext/playwright
  return `${p}/api`
})()

/**
 * THE BEARER, FROM localStorage.
 *
 * Same-origin with the console by construction — easyagent-ext-ui-host serves both — so the token the
 * console already stored is the one this panel sends. It is never put in a URL and never travels in a
 * message another window could read.
 */
function bearer(): string {
  try {
    return localStorage.getItem('agent.token') ?? ''
  } catch {
    // A sandbox-restricted frame throws on access. Reporting "no token" makes the API answer 401 with
    // a message, which is better than the panel failing to load with an exception.
    return ''
  }
}

const transport = createConnectTransport({
  baseUrl: API_BASE,
  // READ AT CALL TIME, not at construction: a re-login in the console changes the stored token, and
  // a client that captured it once would keep presenting the old one until the panel was reloaded.
  interceptors: [
    next => async req => {
      const tok = bearer()
      if (tok !== '') req.header.set('Authorization', `Bearer ${tok}`)
      return next(req)
    },
  ],
})

export const client = createClient(UiService, transport)

/**
 * A screenshot, as an object URL.
 *
 * THE CALLER MUST REVOKE IT. Every frame is a new blob, and a panel that polls once a second without
 * revoking holds megabytes per minute for the life of the page.
 */
export async function frameURL(contextId: string, signal?: AbortSignal): Promise<string> {
  const res = await client.getFrame({ contextId }, { signal })
  // `.slice()` COPIES INTO A PLAIN ArrayBuffer. `res.jpeg` is typed `Uint8Array<ArrayBufferLike>`,
  // which includes SharedArrayBuffer, and `Blob` refuses that — a typing detail with a runtime
  // meaning: a shared buffer cannot be handed to the blob store.
  const blob = new Blob([res.jpeg.slice()], { type: 'image/jpeg' })
  return URL.createObjectURL(blob)
}
