import { fileURLToPath } from 'node:url'

import { defineVitestProject } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'
import { defaultExclude, defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#infrastructure': fileURLToPath(new URL('./infrastructure', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    projects: [
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
            provider: playwright(),
            screenshotFailures: false,
          },
          environment: 'nuxt',
          include: ['app/**/*.browser.test.ts'],
          name: 'browser',
          sequence: { groupOrder: 0 },
          setupFiles: ['./vitest.setup.ts'],
        },
      }),
      defineVitestProject({
        root: process.cwd(),
        test: {
          environment: 'nuxt',
          exclude: [...defaultExclude, '**/*.browser.test.ts'],
          include: ['app/**/*.test.ts', 'infrastructure/**/*.test.ts'],
          name: 'unit',
          sequence: { groupOrder: 1 },
          setupFiles: ['./vitest.setup.ts'],
        },
      }),
    ],
  },
})
