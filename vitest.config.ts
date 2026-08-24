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
    // Known vitest/Chromium issue (github.com/vitest-dev/vitest/issues/9437): Chromium's
    // disk cache accumulates per test file across a run and is never cleaned up between
    // files, eventually killing the browser connection once disk space runs low — the
    // failure always lands well into a run (never near the start), not randomly. The
    // --disk-cache-size launch arg below addresses the root cause; this is a defensive
    // backstop in case it still slips through (checks the whole cause chain, since the
    // matching text is nested under error.cause, not the top-level error.message).
    onUnhandledError: (error) => {
      const messages: string[] = []
      for (let current: unknown = error; current instanceof Error; current = current.cause) {
        messages.push(current.message)
      }
      return messages.some((message) => message.includes('Browser connection was closed'))
        ? false
        : undefined
    },
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
                // Cap Chromium's on-disk cache so it doesn't accumulate across the
                // ~120 test files in this run and exhaust the container's disk
                // (see the onUnhandledError comment above for the failure this causes).
                launch: process.env.CI
                  ? { args: ['--disk-cache-size=1', '--media-cache-size=1'] }
                  : {},
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
          // Isolated interactions occasionally stall for 10+s under CI's cgroup CPU
          // quota (CFS bandwidth throttling can inject latency far beyond the
          // nominal quota fraction) even though the app is otherwise correct;
          // retrying is far cheaper than chasing an infra-level scheduling stall.
          retry: process.env.CI ? 2 : 0,
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
