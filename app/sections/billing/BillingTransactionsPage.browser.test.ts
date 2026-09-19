import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { BillingTransactionsPageDeps } from './BillingTransactionsPage.deps'
import BillingTransactionsPage from './BillingTransactionsPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows transaction details and requests the current route page', async () => {
  const view = vi.fn<BillingTransactionsPageDeps['view']>(async () => ({
    data: {
      hasNextPage: true,
      members: [],
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

  currentWrapper = await mountSuspended(BillingTransactionsPage, {
    attachTo: document.body,
    props: {
      admin: false,
      deps: { view },
    },
    route: '/organizations/acme-ab12/billing',
  })

  expect(view).toHaveBeenCalledWith({ page: 1, signal: expect.anything(), userId: undefined })
  await expect.element(page.getByText('Spend')).toBeVisible()
  await expect.element(page.getByText('-25')).toBeVisible()
  await page.getByRole('button', { name: 'Next page' }).click()

  await vi.waitFor(() =>
    expect(view).toHaveBeenCalledWith({ page: 2, signal: expect.anything(), userId: undefined }),
  )
})

it('filters organization transactions by member', async () => {
  const view = vi.fn<BillingTransactionsPageDeps['view']>(async () => ({
    data: {
      hasNextPage: false,
      members: [{ id: 'user-1', name: 'Ada Lovelace' }],
      transactions: [],
    },
    status: 'success',
  }))

  currentWrapper = await mountSuspended(BillingTransactionsPage, {
    attachTo: document.body,
    props: {
      admin: true,
      deps: { view },
    },
    route: '/organizations/acme-ab12/billing',
  })

  await page.getByLabelText('Member').selectOptions('user-1')
  await vi.waitFor(() =>
    expect(view).toHaveBeenCalledWith({
      page: 1,
      signal: expect.anything(),
      userId: 'user-1',
    }),
  )
})
