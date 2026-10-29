import { fileURLToPath } from 'node:url'

import { defineVitestProject } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'
import { defaultExclude, defineConfig } from 'vitest/config'

// Component tests render without SSR and are never indexable pages.
const componentTestNuxt = { site: { indexable: false }, ssr: false }

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '#infrastructure': fileURLToPath(new URL('./infrastructure', import.meta.url)),
            '#layers/core': fileURLToPath(new URL('./layers/core', import.meta.url)),
            '#layers/docs': fileURLToPath(new URL('./layers/docs', import.meta.url)),
            '#layers/site': fileURLToPath(new URL('./layers/site', import.meta.url)),
            '#layers/workspace': fileURLToPath(new URL('./layers/workspace', import.meta.url)),
          },
        },
        test: {
          exclude: [...defaultExclude, '**/*.browser.test.ts', '**/*.nuxt.test.ts'],
          include: ['layers/**/*.test.ts', 'infrastructure/**/*.test.ts', 'tools/**/*.test.mjs'],
          name: 'node',
          sequence: { groupOrder: 0 },
        },
      },
      defineVitestProject({
        root: process.cwd(),
        test: {
          environmentOptions: {
            nuxt: { overrides: componentTestNuxt },
          },
          // Let happy-dom provide storage instead of Node's unavailable localStorage global.
          execArgv: ['--no-experimental-webstorage'],
          include: ['layers/**/*.nuxt.test.ts'],
          name: 'nuxt',
          sequence: { groupOrder: 1 },
          setupFiles: ['./vitest.setup.ts'],
        },
      }),
      defineVitestProject({
        root: process.cwd(),
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [
              {
                browser: 'chromium',
                viewport: {
                  height: 720,
                  width: 1280,
                },
              },
            ],
            provider: playwright({
              contextOptions: { reducedMotion: 'reduce' },
            }),
            screenshotFailures: false,
          },
          environment: 'nuxt',
          environmentOptions: {
            nuxt: { overrides: componentTestNuxt },
          },
          fileParallelism: false,
          include: ['layers/**/*.browser.test.ts'],
          isolate: false,
          name: 'browser',
          restoreMocks: true,
          sequence: { groupOrder: 2 },
          setupFiles: ['./vitest.setup.ts'],
        },
      }),
    ],
  },
})
