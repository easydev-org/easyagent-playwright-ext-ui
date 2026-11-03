<script lang="ts">
  // A single-column picker for the live browsers.
  //
  // WHY A BAR AND NOT A RAIL. This panel is embedded in the console's side pane, which is already half
  // a screen. A 260px rail there left the screenshot — the thing being looked at — with barely more
  // than a thumbnail. A rail makes sense in a page that owns the whole window; in a pane it is a column
  // inside a column.
  //
  // A SELECT LOSES THE ROW DETAIL, SO THE DETAIL MOVES BESIDE IT. The rail showed each browser's title,
  // its id, the conversation that opened it, and whether it was busy or closed. A picker keeps the
  // label; the state of the SELECTED one is rendered next to it, and the rest is one click away.
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

<div class="bar">
  {#if listError}
    <span class="err">{listError}</span>
  {:else if contexts.length === 0}
    <span class="muted">No open browsers.</span>
  {:else}
    <select
      class="pick"
      value={selected}
      onchange={e => onselect((e.currentTarget as HTMLSelectElement).value)}
      aria-label="browser"
    >
      {#each contexts as c (c.contextId)}
        <option value={c.contextId}>
          {label(c)}{c.busy ? ' · busy' : ''}{c.alive ? '' : ' · closed'}
        </option>
      {/each}
    </select>
    <!-- WHICH CONVERSATION OPENED IT. The list spans every session a tenant owns — the panel is often
         opened from a tab with no session at all — so an id alone does not say which task it is. -->
    {#each contexts.filter(c => c.contextId === selected) as c (c.contextId)}
      <span class="micro muted">{c.session || '—'}</span>
      <span class="micro mono muted">{c.contextId.slice(0, 8)}</span>
      {#if c.busy}<span class="pill busy">busy</span>{/if}
      {#if !c.alive}<span class="pill dead">closed</span>{/if}
    {/each}
  {/if}
</div>

<style>
  .bar {
    display: flex;
    align-items: center;
    gap: var(--sp-sm);
    padding: var(--sp-sm) var(--sp-sm) 0;
    flex-wrap: wrap;
  }
  .pick {
    min-width: 0;
    max-width: 100%;
    flex: 1 1 12rem;
    padding: 4px 8px;
    font: inherit;
    font-size: var(--text-meta);
    color: var(--foreground);
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .muted {
    color: var(--muted-foreground);
  }
  .err {
    color: var(--destructive);
  }
  .micro {
    font-size: var(--text-micro);
  }
  .mono {
    font-family: var(--font-mono);
  }
  .pill {
    font-size: var(--text-micro);
    padding: 0 5px;
    border-radius: 999px;
    border: 1px solid currentColor;
  }
  .pill.busy {
    color: var(--warning);
  }
  .pill.dead {
    color: var(--destructive);
  }
</style>
