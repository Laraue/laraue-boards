import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import PageLoadState from './PageLoadState.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('lets the user retry after a load failure', async () => {
  const onRetry = vi.fn<() => void>()
  currentWrapper = await mountSuspended(PageLoadState, {
    attachTo: document.body,
    props: {
      errorText: 'Could not load the organization.',
      loading: false,
      loadingText: 'Loading organization…',
      onRetry,
    },
  })

  await page.getByRole('button', { name: 'Try again' }).click()

  expect(onRetry).toHaveBeenCalledOnce()
})

it('hides the retry button while loading', async () => {
  currentWrapper = await mountSuspended(PageLoadState, {
    attachTo: document.body,
    props: {
      errorText: 'Could not load the organization.',
      loading: true,
      loadingText: 'Loading organization…',
    },
  })

  await expect.element(page.getByText('Loading organization…')).toBeVisible()
  await expect.element(page.getByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
})
