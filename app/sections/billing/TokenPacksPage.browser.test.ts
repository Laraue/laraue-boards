import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { BillingPageDeps } from './BillingPage.deps'
import TokenPacksPage from './TokenPacksPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const createDeps = (overrides: Partial<BillingPageDeps> = {}, canPay = true): BillingPageDeps => ({
  getPlans: vi.fn<BillingPageDeps['getPlans']>(async () => ({ personal: [], team: [] })),
  getTokenPacks: vi.fn<BillingPageDeps['getTokenPacks']>(async () => [
    {
      currencyCode: 'RUB',
      expirationMonths: 6,
      formattedPrice: '250₽',
      id: 'small-id',
      title: 'Small',
      tokens: 100_000,
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
    kind: 'personal',
    periodEndsAt: null,
    periodResets: false,
    purchasedTokens: { count: 0, expireAt: null, expiringCount: 0 },
    subscriptionCode: 'Pro',
    tokens: { limit: 1000, remaining: 850, used: 150 },
  })),
  ...overrides,
})

const mountPage = async (
  deps: BillingPageDeps,
  onPay: (url: string) => void = vi.fn<(url: string) => void>(),
) => {
  currentWrapper = await mountSuspended(TokenPacksPage, {
    attachTo: document.body,
    props: { backTo: '/organizations/acme-ab12/account/plan', deps, onPay },
    route: '/organizations/acme-ab12/account/plan/tokens',
  })
}

it('lists the token packs with their tokens, expiry and price', async () => {
  await mountPage(createDeps())

  await expect.element(page.getByText('Small', { exact: true })).toBeVisible()
  await expect.element(page.getByText('250₽', { exact: true })).toBeVisible()
  await expect.element(page.getByText('100,000 tokens')).toBeVisible()
  await expect.element(page.getByText('Valid for 6 months')).toBeVisible()
})

it('asks to accept the offer in a dialog before paying for the selected pack', async () => {
  const deps = createDeps()
  const onPay = vi.fn<(url: string) => void>()
  await mountPage(deps, onPay)

  await page.getByRole('button', { name: 'Select this pack' }).click()

  await expect.element(page.getByRole('dialog')).toBeVisible()
  const pay = page.getByRole('button', { name: 'Pay 250₽' })
  await expect.element(pay).toBeDisabled()
  expect(deps.startCheckout).not.toHaveBeenCalled()

  await page.getByRole('checkbox').click()
  await pay.click()

  await vi.waitFor(() =>
    expect(deps.startCheckout).toHaveBeenCalledWith({
      currencyCode: 'RUB',
      itemId: 'small-id',
      kind: 'TokenPack',
    }),
  )
  await vi.waitFor(() => expect(onPay).toHaveBeenCalledWith('about:blank#checkout'))
})

it('does not let a member who is not the owner pay', async () => {
  await mountPage(createDeps({}, false))

  await expect
    .element(page.getByText('Only the organization owner can pay for tokens.'))
    .toBeVisible()
  await expect.element(page.getByRole('button', { name: 'Select this pack' })).toBeDisabled()
})

it('says there are no packs when none can be loaded', async () => {
  await mountPage(
    createDeps({ getTokenPacks: vi.fn<BillingPageDeps['getTokenPacks']>(async () => []) }),
  )

  await expect.element(page.getByText('There are no token packs to buy yet.')).toBeVisible()
})

it('links back to the plan', async () => {
  await mountPage(createDeps())

  await expect
    .element(page.getByRole('link', { name: 'Back to the plan' }))
    .toHaveAttribute('href', '/organizations/acme-ab12/account/plan')
})
