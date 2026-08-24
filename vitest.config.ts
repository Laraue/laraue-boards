import { fileURLToPath } from 'node:url'

import { defineVitestProject } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'
import { defaultExclude, defineConfig } from 'vitest/config'

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
          name: 'node',
        },
      },
      defineVitestProject({
        root: process.cwd(),
        test: {
          include: ['app/**/*.nuxt.test.ts'],
          name: 'nuxt',
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
          name: 'browser',
          // Isolated interactions occasionally stall for 10+s under CI's cgroup CPU
          // quota (CFS bandwidth throttling can inject latency far beyond the
          // nominal quota fraction) even though the app is otherwise correct;
          // retrying is far cheaper than chasing an infra-level scheduling stall.
          retry: process.env.CI ? 2 : 0,
          setupFiles: ['./vitest.setup.ts'],
        },
      }),
    ],
  },
})
