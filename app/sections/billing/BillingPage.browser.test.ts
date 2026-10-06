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
    subscriptionCode: 'Pro',
    tokens: { limit: 1000, remaining: 850, used: 150 },
  })),
  ...overrides,
})

const mountPage = async (
  deps: BillingPageDeps,
  onPay: (url: string) => void = vi.fn<(url: string) => void>(),
) => {
  currentWrapper = await mountSuspended(BillingPage, {
    attachTo: document.body,
    props: { deps, onPay },
    route: '/organizations/acme-ab12/account/plan',
  })
}

it('shows the current plan and available usage limits', async () => {
  await mountPage(createDeps())

  await expect.element(page.getByText('Pro')).toBeVisible()
  await expect.element(page.getByText('850')).toBeVisible()
})

it('starts the checkout of a plan only after the offer is accepted', async () => {
  const deps = createDeps()
  const onPay = vi.fn<(url: string) => void>()
  await mountPage(deps, onPay)

  const buy = page.getByRole('button', { name: 'Buy' })
  await expect.element(buy).toBeDisabled()

  await page.getByRole('checkbox').click()
  await buy.click()

  await vi.waitFor(() =>
    expect(deps.startCheckout).toHaveBeenCalledWith({ currencyCode: 'RUB', planId: 'plus-id' }),
  )
  await vi.waitFor(() => expect(onPay).toHaveBeenCalledWith('about:blank#checkout'))
})

it('does not let a member who is not the owner pay', async () => {
  await mountPage(createDeps({}, false))

  await expect
    .element(page.getByText('Only the organization owner can pay for the plan.'))
    .toBeVisible()
  await expect.element(page.getByRole('button', { name: 'Buy' })).toBeDisabled()
})
