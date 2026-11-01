<script lang="ts">
  // The list of live browsers.
  //
  // EACH ROW NAMES THE CONVERSATION THAT OPENED IT. The list spans every session a tenant owns — the
  // panel is often opened from a tab that has no session at all — so an id and a title alone would not
  // tell a reader which task a browser belongs to.
  import type { Context } from '../gen/ui/v1/ui_pb.js'

  let {
    contexts,
    selected,
    listError,
    onselect,
  }: {
    contexts: Context[]
    selected: string
    listError: string
    onselect: (id: string) => void
  } = $props()

  /** A short label for a context: its title, or enough of its id to tell two apart. */
  function label(c: Context): string {
    return c.title || c.contextId.slice(0, 8)
  }
</script>

<aside>
  {#if contexts.length === 0}
    <div class="state" class:err={listError !== ''}>
      {listError || 'No open browsers.'}
    </div>
  {:else}
    {#each contexts as c (c.contextId)}
      <button
        type="button"
        class="row"
        class:active={c.contextId === selected}
        onclick={() => onselect(c.contextId)}
      >
        <span class="name">{label(c)}</span>
        <span class="micro mono muted">{c.contextId.slice(0, 8)}</span>
        <!-- Which conversation opened it: the list spans sessions. -->
        <span class="micro muted">{c.session || '—'}</span>
        <span class="micro">
          {#if c.busy}<span class="pill busy">busy</span>{/if}
          {#if !c.alive}<span class="pill dead">closed</span>{/if}
        </span>
      </button>
    {/each}
  {/if}
</aside>

<style>
  aside {
    display: flex;
    width: 260px;
    flex-shrink: 0;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    border-right: 1px solid var(--border);
    padding: 8px;
  }

  .row {
    display: flex;
    cursor: pointer;
    flex-direction: column;
    gap: 1px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    padding: 6px 8px;
    color: inherit;
    text-align: left;
    font: inherit;
  }

  .row:hover {
    background: var(--card);
  }

  .row.active {
    background: var(--card);
    outline: 1px solid var(--primary);
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .micro {
    font-size: 11px;
  }

  .pill {
    margin-right: 4px;
    border-radius: 999px;
    padding: 0 6px;
  }

  .pill.busy {
    background: color-mix(in oklab, var(--warn) 20%, transparent);
    color: var(--warn);
  }

  .pill.dead {
    background: color-mix(in oklab, var(--danger) 18%, transparent);
    color: var(--danger);
  }

  .state {
    padding: 12px 8px;
    color: var(--muted);
    font-size: 13px;
  }

  .state.err {
    color: var(--danger);
  }

  /* A HOST PANE ON A PHONE SHOWS ONE COLUMN AT A TIME, so the list steps aside once a browser is
     chosen. The back control lives in Stage. */
  @media (max-width: 640px) {
    aside {
      width: 100%;
      border-right: 0;
    }
  }
</style>
