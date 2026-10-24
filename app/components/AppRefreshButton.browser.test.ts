import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { defineComponent, h } from 'vue'

import { useViewRefresh } from '~/composables/useViewRefresh'

import AppRefreshButton from './AppRefreshButton.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

// A view on screen with the button in its header, as PageHeader places it.
const mountView = async (refresh: () => Promise<void>) => {
  const View = defineComponent({
    setup() {
      useViewRefresh(refresh)
      return () => h(AppRefreshButton)
    },
  })
  currentWrapper = await mountSuspended(View, { attachTo: document.body })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('hides the button when no view on screen can refresh', async () => {
  currentWrapper = await mountSuspended(AppRefreshButton, { attachTo: document.body })

  await expect.element(page.getByRole('button', { name: 'Refresh' })).not.toBeInTheDocument()
})

it("reloads the view's data once while a refresh is running", async () => {
  let finish = () => {}
  const refresh = vi.fn<() => Promise<void>>(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  await mountView(refresh)
  const button = page.getByRole('button', { name: 'Refresh' })

  await button.click()

  await expect.element(button).toBeDisabled()
  expect(refresh).toHaveBeenCalledTimes(1)

  finish()

  await expect.element(button).toBeEnabled()
})
