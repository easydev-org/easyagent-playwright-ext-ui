import { mount } from 'svelte'

import App from './App.svelte'
import './app.css'

// THE HOST'S THEME, kept in step.
//
// An iframe has its own <html>, so the console's data-theme does not reach here. Two channels cover it
// and both are needed: `?theme=` applied by index.html before first paint, and this listener for a
// switch while the panel is open. Without the second, a reader who toggles the console's theme keeps
// looking at the old palette until they reload.
window.addEventListener('message', ev => {
  const d = ev.data as { type?: string; theme?: string } | null
  if (d?.type === 'easyagent:theme' && (d.theme === 'dark' || d.theme === 'light')) {
    document.documentElement.dataset['theme'] = d.theme
  }
})

const target = document.getElementById('app')
if (!target) throw new Error('#app is missing from index.html')

mount(App, { target })
