import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { UserTransactionsPageDeps } from './UserTransactionsPage.deps'
import UserTransactionsPage from './UserTransactionsPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows transaction details and requests the current route page', async () => {
  const view = vi.fn<UserTransactionsPageDeps['view']>(async () => ({
    data: {
      hasNextPage: true,
      transactions: [
        {
          createdAt: '2026-09-19T10:00:00Z',
          delta: -25,
          error: null,
          finishedAt: null,
          id: 'transaction-1',
          ownerName: null,
          reason: 'Spend',
          status: 'Confirmed',
        },
      ],
    },
    status: 'success',
  }))

  currentWrapper = await mountSuspended(UserTransactionsPage, {
    attachTo: document.body,
    props: {
      deps: { view },
    },
    route: '/organizations/acme-ab12/account/transactions',
  })

  expect(view).toHaveBeenCalledWith({ page: 1, signal: expect.anything(), userId: undefined })
  await expect.element(page.getByText('Spend')).toBeVisible()
  await expect.element(page.getByText('-25')).toBeVisible()
  await page.getByRole('button', { name: 'Next page' }).click()

  await vi.waitFor(() =>
    expect(view).toHaveBeenCalledWith({ page: 2, signal: expect.anything(), userId: undefined }),
  )
})
