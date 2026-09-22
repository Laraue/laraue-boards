import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { OrganizationTransactionsPageDeps } from './OrganizationTransactionsPage.deps'
import OrganizationTransactionsPage from './OrganizationTransactionsPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('filters organization transactions by member', async () => {
  const view = vi.fn<OrganizationTransactionsPageDeps['view']>(async () => ({
    data: {
      hasNextPage: false,
      members: [{ id: 'user-1', name: 'Ada Lovelace' }],
      transactions: [],
    },
    status: 'success',
  }))

  currentWrapper = await mountSuspended(OrganizationTransactionsPage, {
    attachTo: document.body,
    props: {
      deps: { view },
    },
    route: '/organizations/acme-ab12/admin/transactions',
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
