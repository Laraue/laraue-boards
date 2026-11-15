import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import AppRefreshButton from './AppRefreshButton.vue'

let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

it('runs only the supplied action and prevents parallel refreshes', async () => {
  const { promise, resolve: finish } = Promise.withResolvers<void>()
  const refresh = vi.fn<() => Promise<void>>(() => promise)
  wrapper = await mountSuspended(AppRefreshButton, {
    attachTo: document.body,
    props: { onRefresh: refresh },
  })
  const button = page.getByRole('button', { name: 'Refresh' })
  await button.click()
  await expect.element(button).toBeDisabled()
  expect(refresh).toHaveBeenCalledOnce()
  finish()
  await expect.element(button).toBeEnabled()
})
