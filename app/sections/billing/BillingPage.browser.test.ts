import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { BillingPageDeps } from './BillingPage.deps'
import BillingPage from './BillingPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the current plan and available usage limits', async () => {
  const deps: BillingPageDeps = {
    view: vi.fn<BillingPageDeps['view']>(async () => ({
      freeTeamOrganizations: { limit: 2, remaining: 1, used: 1 },
      issuesPerMonth: null,
      kind: 'personal',
      subscriptionCode: 'Pro',
      tokens: { limit: 1000, remaining: 850, used: 150 },
    })),
  }

  currentWrapper = await mountSuspended(BillingPage, {
    attachTo: document.body,
    props: { deps },
    route: '/organizations/acme-ab12/account/plan',
  })

  await expect.element(page.getByText('Pro')).toBeVisible()
  await expect.element(page.getByText('850')).toBeVisible()
})
