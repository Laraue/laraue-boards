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
  getTokenPacks: vi.fn<BillingPageDeps['getTokenPacks']>(async () => [
    {
      currencyCode: 'RUB',
      expirationMonths: 6,
      formattedPrice: '250₽',
      id: 'small-id',
      title: 'Small',
      tokens: 100_000,
    },
    {
      currencyCode: 'RUB',
      expirationMonths: null,
      formattedPrice: '1000₽',
      id: 'medium-id',
      title: 'Medium',
      tokens: 600_000,
    },
  ]),
  startCheckout: vi.fn<BillingPageDeps['startCheckout']>(async () => ({
    url: 'about:blank#checkout',
  })),
  view: vi.fn<BillingPageDeps['view']>(async () => ({
    canPay,
    freeTeamOrganizations: { limit: 2, remaining: 1, used: 1 },
    issuesPerMonth: null,
    issuesResetAt: null,
    periodEndsAt: null,
    periodResets: false,
    purchasedTokens: { count: 0, expireAt: null, expiringCount: 0 },
    kind: 'personal',
    subscriptionCode: 'Free',
    tokens: { limit: 1000, remaining: 850, used: 150 },
  })),
  ...overrides,
})

const mountPage = async (
  deps: BillingPageDeps,
  onPay: (url: string) => void = vi.fn<(url: string) => void>(),
) => {
  currentWrapper = await mountSuspended(ChangePlanPage, {
    attachTo: document.body,
    props: { backTo: '/organizations/acme-ab12/account/plan', deps, onPay },
    route: '/organizations/acme-ab12/account/plan/change',
  })
}

it('asks to accept the offer in a dialog before paying for the selected plan', async () => {
  const deps = createDeps()
  const onPay = vi.fn<(url: string) => void>()
  await mountPage(deps, onPay)

  await page.getByRole('button', { name: 'Select this plan' }).click()

  await expect.element(page.getByRole('dialog')).toBeVisible()
  const pay = page.getByRole('button', { name: 'Pay 334₽' })
  await expect.element(pay).toBeDisabled()
  expect(deps.startCheckout).not.toHaveBeenCalled()

  await page.getByRole('checkbox').click()
  await pay.click()

  await vi.waitFor(() =>
    expect(deps.startCheckout).toHaveBeenCalledWith({
      currencyCode: 'RUB',
      itemId: 'plus-id',
      kind: 'Subscription',
    }),
  )
  await vi.waitFor(() => expect(onPay).toHaveBeenCalledWith('about:blank#checkout'))
})

it('does not let a member who is not the owner pay', async () => {
  await mountPage(createDeps({}, false))

  await expect
    .element(page.getByText('Only the organization owner can pay for the plan.'))
    .toBeVisible()
  await expect.element(page.getByRole('button', { name: 'Select this plan' })).toBeDisabled()
})

it('shows every plan and marks the current one', async () => {
  await mountPage(createDeps())

  await expect.element(page.getByText('Free', { exact: true })).toBeVisible()
  await expect.element(page.getByText('Plus', { exact: true })).toBeVisible()
  await expect.element(page.getByRole('button', { name: 'This plan is active' })).toBeDisabled()
})

it('links back to the plan', async () => {
  await mountPage(createDeps())

  await expect
    .element(page.getByRole('link', { name: 'Back to the plan' }))
    .toHaveAttribute('href', '/organizations/acme-ab12/account/plan')
})
