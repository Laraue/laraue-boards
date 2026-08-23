import { fileURLToPath } from 'node:url'

import { defineVitestProject } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'
import { defaultExclude, defineConfig } from 'vitest/config'

const MAX_WORKERS = process.env.CI ? 2 : undefined

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '#infrastructure': fileURLToPath(new URL('./infrastructure', import.meta.url)),
            '~': fileURLToPath(new URL('./app', import.meta.url)),
          },
        },
        test: {
          exclude: [...defaultExclude, '**/*.browser.test.ts', '**/*.nuxt.test.ts'],
          include: ['app/**/*.test.ts', 'infrastructure/**/*.test.ts'],
          maxWorkers: MAX_WORKERS,
          name: 'node',
          sequence: { groupOrder: 0 },
        },
      },
      defineVitestProject({
        root: process.cwd(),
        test: {
          include: ['app/**/*.nuxt.test.ts'],
          maxWorkers: MAX_WORKERS,
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
          include: ['app/**/*.browser.test.ts'],
          maxWorkers: MAX_WORKERS,
          name: 'browser',
          sequence: { groupOrder: 2 },
          setupFiles: ['./vitest.setup.ts'],
        },
      }),
    ],
  },
})
