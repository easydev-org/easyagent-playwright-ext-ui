import path from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// THE BASE IS THE MOUNT POINT, and it has to match what easyagent-ext-ui-host serves. An asset URL
// built for a different base is every asset 404ing, which the browser reports as a blank panel with
// nothing in the console log that names the file.
export default defineConfig({
  base: '/ext/playwright/',
  plugins: [svelte()],
  resolve: { alias: { $lib: path.resolve('./src/lib') } },
  build: { target: 'es2022', sourcemap: false },
})
