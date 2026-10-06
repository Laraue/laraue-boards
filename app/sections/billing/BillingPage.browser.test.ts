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

const createDeps = (overrides: Partial<BillingPageDeps> = {}, canPay = true): BillingPageDeps => ({
  getPlans: vi.fn<BillingPageDeps['getPlans']>(async () => ({
    personal: [
      {
        currencyCode: 'RUB',
        formattedPrice: '334₽',
        id: 'plus-id',
        isFree: false,
        title: 'Plus',
        tokens: 300_000,
      },
    ],
    team: [],
  })),
  startCheckout: vi.fn<BillingPageDeps['startCheckout']>(async () => ({
    url: 'about:blank#checkout',
  })),
  view: vi.fn<BillingPageDeps['view']>(async () => ({
    canPay,
    freeTeamOrganizations: { limit: 2, remaining: 1, used: 1 },
    issuesPerMonth: null,
    kind: 'personal',
    paymentCurrencyCode: 'RUB',
    subscriptionCode: 'Pro',
    tokens: { limit: 1000, remaining: 850, used: 150 },
  })),
  ...overrides,
})

const mountPage = async (deps: BillingPageDeps, onChangePlan: () => void = vi.fn<() => void>()) => {
  currentWrapper = await mountSuspended(BillingPage, {
    attachTo: document.body,
    props: { deps, onChangePlan },
    route: '/organizations/acme-ab12/account/plan',
  })
}

it('shows the current plan and available usage limits', async () => {
  await mountPage(createDeps())

  await expect.element(page.getByText('Pro')).toBeVisible()
  await expect.element(page.getByText('850')).toBeVisible()
})

it('opens the plan change from the current plan', async () => {
  const onChangePlan = vi.fn<() => void>()
  await mountPage(createDeps(), onChangePlan)

  await page.getByRole('button', { name: 'Change plan' }).click()

  expect(onChangePlan).toHaveBeenCalled()
})
