<script lang="ts">
  // The browser panel: the live contexts a tenant owns, and one of their screenshots on a timer.
  //
  // "LIVE" MEANS REFRESHED, NOT STREAMED. A screencast needs a WebSocket per context, a backpressure
  // story and a teardown path for every way a tab can disappear; a screenshot is one request that
  // cannot leak. Polling at about 1 fps is enough to watch an agent work, and it is what this panel
  // has always done.
  import { onMount } from 'svelte'
  import type { Context } from './gen/ui/v1/ui_pb.js'
  import { client, frameURL } from './client.js'
  import Rail from './lib/Rail.svelte'
  import Stage from './lib/Stage.svelte'

  const LIST_MS = 5000
  const FRAME_MS = 1000

  let contexts = $state<Context[]>([])
  let selected = $state('')
  let listError = $state('')
  let frameError = $state('')
  /** The current screenshot's object URL, or ''. */
  let frame = $state('')
  /** True while a screenshot has been asked for and has not answered. */
  let loadingFrame = $state(false)

  /**
   * Bumped on every frame request so a slow answer cannot overwrite a newer one.
   *
   * Two requests a second apart can return out of order; without this the panel flickers back to a
   * picture from a second ago. A counter rather than comparing timestamps, because two requests in the
   * same millisecond is a real possibility at 1 fps on a fast machine.
   */
  let frameSeq = 0
  /** Aborts the in-flight screenshot when the reader switches context. */
  let inflight: AbortController | null = null

  /** Replaces the frame, revoking the old blob. */
  function setFrame(next: string): void {
    if (frame !== '') URL.revokeObjectURL(frame)
    frame = next
  }

  async function refreshList(): Promise<void> {
    try {
      const res = await client.listContexts({})
      contexts = res.contexts
      listError = ''
      // DROP A SELECTION THAT NO LONGER EXISTS, so the page does not keep showing a dead browser with
      // a screenshot that will never update again.
      if (selected !== '' && !contexts.some(c => c.contextId === selected)) {
        select('')
      }
    } catch (e) {
      listError = e instanceof Error ? e.message : String(e)
    }
  }

  async function refreshFrame(): Promise<void> {
    if (selected === '') return
    const seq = ++frameSeq
    const id = selected
    inflight?.abort()
    const ac = new AbortController()
    inflight = ac
    loadingFrame = frame === ''
    try {
      const url = await frameURL(id, ac.signal)
      // A RESPONSE FOR A CONTEXT THE READER HAS LEFT MUST NOT PAINT.
      if (seq !== frameSeq) {
        URL.revokeObjectURL(url)
        return
      }
      setFrame(url)
      frameError = ''
    } catch (e) {
      // An abort is this panel's own doing, not a failure to report.
      if (ac.signal.aborted || seq !== frameSeq) return
      // KEEP THE OLD PICTURE. A failed frame usually means "the page is mid-navigation", and blanking
      // the stage for it would flash on every click the agent makes.
      frameError = e instanceof Error ? e.message : String(e)
    } finally {
      if (seq === frameSeq) loadingFrame = false
    }
  }

  function select(id: string): void {
    if (selected === id) return
    selected = id
    setFrame('')
    frameError = ''
    // Newest sequence: any in-flight frame for the previous context is now stale.
    frameSeq++
    inflight?.abort()
    loadingFrame = false
    if (id !== '') void refreshFrame()
  }

  onMount(() => {
    void refreshList()
    const listTimer = setInterval(() => void refreshList(), LIST_MS)
    const frameTimer = setInterval(() => void refreshFrame(), FRAME_MS)
    return () => {
      clearInterval(listTimer)
      clearInterval(frameTimer)
      inflight?.abort()
      // THE PAGE'S OWN MEMORY IS NOT AUTOMATIC: a blob URL lives until it is revoked or the document
      // goes away, and an embedded panel that is swapped out is not a document going away.
      if (frame !== '') URL.revokeObjectURL(frame)
    }
  })

  const current = $derived(contexts.find(c => c.contextId === selected) ?? null)
</script>

<div class="panel">
  <Rail {contexts} {selected} {listError} onselect={select} />
  <Stage {current} {frame} {frameError} {loadingFrame} onback={() => select('')} />
</div>

<style>
  /* A HOST PANE, so it fills what it is given and scrolls inside its own columns rather than the page. */
  .panel {
    display: flex;
    height: 100%;
    min-height: 0;
  }
</style>
