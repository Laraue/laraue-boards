import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { BillingPageDeps } from './BillingPage.deps'
import ChangePlanPage from './ChangePlanPage.vue'

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
        formattedPrice: '0₽',
        id: 'free-id',
        isFree: true,
        title: 'Free',
        tokens: 10_000,
      },
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
    subscriptionCode: 'Free',
    tokens: { limit: 1000, remaining: 850, used: 150 },
  })),
  ...overrides,
})

const mountPage = async (
  deps: BillingPageDeps,
  onPay: (url: string) => void = vi.fn<(url: string) => void>(),
  onBack: () => void = vi.fn<() => void>(),
) => {
  currentWrapper = await mountSuspended(ChangePlanPage, {
    attachTo: document.body,
    props: { deps, onBack, onPay },
    route: '/organizations/acme-ab12/account/plan/change',
  })
}

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

it('shows every plan and marks the current one', async () => {
  await mountPage(createDeps())

  await expect.element(page.getByText('Free', { exact: true })).toBeVisible()
  await expect.element(page.getByText('Plus', { exact: true })).toBeVisible()
  await expect.element(page.getByText('Current plan', { exact: true })).toBeVisible()
})

it('goes back to the plan', async () => {
  const onBack = vi.fn<() => void>()
  await mountPage(createDeps(), undefined, onBack)

  await page.getByRole('button', { name: /Back to the plan/ }).click()

  expect(onBack).toHaveBeenCalled()
})
