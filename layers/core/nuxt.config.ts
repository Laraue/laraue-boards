import { fileURLToPath } from 'node:url'

import { defineNuxtConfig } from 'nuxt/config'

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// What every area shares: the root app, UI kit, language, theme, branding and the public shell.
export default defineNuxtConfig({
  css: [here('./app/ui/styles/tokens.css'), here('./app/ui/styles/base.css')],
  spaLoadingTemplate: here('./app/spa-loading-template.html'),
})
