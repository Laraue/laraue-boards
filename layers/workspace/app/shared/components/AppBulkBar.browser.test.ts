import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import AppBulkBar from './AppBulkBar.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('runs the selected bulk action and lets the user clear the selection', async () => {
  const onAction = vi.fn<() => void>()
  const onClear = vi.fn<() => void>()
  currentWrapper = await mountSuspended(AppBulkBar, {
    attachTo: document.body,
    props: { actionLabel: 'Move issues', count: 2, onAction, onClear },
  })

  await page.getByRole('button', { name: 'Move issues' }).click()
  await page.getByRole('button', { name: 'Clear' }).click()

  expect(onAction).toHaveBeenCalledOnce()
  expect(onClear).toHaveBeenCalledOnce()
})
