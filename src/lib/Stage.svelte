<script lang="ts">
  // One screenshot, and the header that says whose it is.
  //
  // THE OLD PICTURE STAYS WHILE A NEW ONE FAILS. A page mid-navigation refuses a screenshot for a
  // moment, and blanking the stage for that would flash on every click the agent makes — so an error
  // only replaces the picture when there is no picture yet.
  import type { Context } from '../gen/ui/v1/ui_pb.js'

  let {
    current,
    frame,
    frameError,
    loadingFrame,
  }: {
    current: Context | null
    frame: string
    frameError: string
    loadingFrame: boolean
  } = $props()
</script>

<main>
  {#if current === null}
    <div class="state">Pick a browser above.</div>
  {:else}
    <header>
      <span class="title">{current.title || current.url || current.contextId}</span>
      <span class="micro muted">{current.session}</span>
    </header>

    <div class="stage">
      {#if frame !== ''}
        <img src={frame} alt="page" class:err={frameError !== ''} />
        {#if frameError !== ''}
          <!-- The picture is stale; saying so is better than showing it silently. -->
          <div class="overlay">{frameError}</div>
        {/if}
      {:else if frameError !== ''}
        <div class="state err">{frameError}</div>
      {:else if loadingFrame}
        <div class="state">Loading…</div>
      {/if}
    </div>
  {/if}
</main>

<style>
  main {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  header {
    display: flex;
    height: 40px;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--border);
    padding: 0 10px;
  }

  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .micro {
    font-size: 11px;
  }

  .stage {
    position: relative;
    display: flex;
    min-height: 0;
    flex: 1;
    align-items: center;
    justify-content: center;
    overflow: auto;
    padding: 10px;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  /* A stale picture is dimmed rather than hidden: the reader can still see what the page looked like,
     and the overlay says why it is not moving. */
  img.err {
    opacity: 0.45;
  }

  .overlay {
    position: absolute;
    bottom: 16px;
    border-radius: 4px;
    background: var(--card);
    padding: 4px 10px;
    color: var(--warning);
    font-size: 12px;
  }

  .state {
    color: var(--muted-foreground);
    font-size: 13px;
  }

  .state.err {
    color: var(--destructive);
  }
</style>
