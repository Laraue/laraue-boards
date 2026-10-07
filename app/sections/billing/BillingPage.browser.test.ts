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
    periodEndsAt: null,
    periodResets: false,
    purchasedTokens: { count: 0, expireAt: null, expiringCount: 0 },
    kind: 'personal',
    subscriptionCode: 'Pro',
    tokens: { limit: 1000, remaining: 850, used: 150 },
  })),
  ...overrides,
})

const mountPage = async (
  deps: BillingPageDeps,
  onChangePlan: () => void = vi.fn<() => void>(),
  onBuyTokens: () => void = vi.fn<() => void>(),
) => {
  currentWrapper = await mountSuspended(BillingPage, {
    attachTo: document.body,
    props: { deps, onBuyTokens, onChangePlan },
    route: '/organizations/acme-ab12/account/plan',
  })
}

it('shows the current plan and available usage limits', async () => {
  await mountPage(createDeps())

  await expect.element(page.getByText('Pro')).toBeVisible()
  await expect.element(page.getByText('850', { exact: true })).toBeVisible()
  await expect.element(page.getByText('150 used of 1,000 in the plan')).toBeVisible()
})

it('opens the plan change from the current plan', async () => {
  const onChangePlan = vi.fn<() => void>()
  await mountPage(createDeps(), onChangePlan)

  await page.getByRole('button', { name: 'Change plan' }).click()

  expect(onChangePlan).toHaveBeenCalled()
})

it('opens the token packs from the tokens balance', async () => {
  const onBuyTokens = vi.fn<() => void>()
  await mountPage(createDeps(), undefined, onBuyTokens)

  await page.getByRole('button', { name: 'Buy tokens' }).click()

  expect(onBuyTokens).toHaveBeenCalled()
})

it('shows when the allowance of a Free plan resets and the purchased tokens with their nearest expiry', async () => {
  await mountPage(
    createDeps({
      view: vi.fn<BillingPageDeps['view']>(async () => ({
        canPay: true,
        freeTeamOrganizations: { limit: 2, remaining: 1, used: 1 },
        issuesPerMonth: null,
        kind: 'personal',
        periodEndsAt: '2026-11-06T12:00:00Z',
        periodResets: true,
        purchasedTokens: { count: 125_000, expireAt: '2027-04-06T12:00:00Z', expiringCount: 25_000 },
        subscriptionCode: 'Free',
        tokens: { limit: 25_000, remaining: 25_000, used: 0 },
      })),
    }),
  )

  await expect.element(page.getByText('Resets on Nov 6, 2026').first()).toBeVisible()
  // The number at the top is everything that can be spent: the plan's 25,000 and the 125,000 purchased.
  await expect.element(page.getByText('150,000', { exact: true })).toBeVisible()
  await expect.element(page.getByText('0 used of 25,000 in the plan')).toBeVisible()
  await expect.element(page.getByText('+ 125,000 purchased tokens')).toBeVisible()
  await expect.element(page.getByText('25,000 of them expire on Apr 6, 2027')).toBeVisible()
})

it('says when a paid plan ends and that all the purchased tokens expire together', async () => {
  await mountPage(
    createDeps({
      view: vi.fn<BillingPageDeps['view']>(async () => ({
        canPay: true,
        issuesPerMonth: null,
        kind: 'team',
        periodEndsAt: '2026-11-06T12:00:00Z',
        periodResets: false,
        purchasedTokens: { count: 100_000, expireAt: '2027-04-06T12:00:00Z', expiringCount: 100_000 },
        subscriptionCode: 'Team',
        tokens: { limit: 750_000, remaining: 700_000, used: 50_000 },
      })),
    }),
  )

  await expect.element(page.getByText('Active until Nov 6, 2026').first()).toBeVisible()
  await expect.element(page.getByText('+ 100,000 purchased tokens')).toBeVisible()
  await expect.element(page.getByText('all expire on Apr 6, 2027')).toBeVisible()
})

it('shows no purchased tokens line when there are none', async () => {
  await mountPage(createDeps())

  await expect.element(page.getByText('purchased tokens')).not.toBeInTheDocument()
})

it('offers to change the plan from the issues limit too', async () => {
  const onChangePlan = vi.fn<() => void>()
  await mountPage(
    createDeps({
      view: vi.fn<BillingPageDeps['view']>(async () => ({
        canPay: true,
        issuesPerMonth: { limit: 500, remaining: 498, used: 2 },
        kind: 'team',
        periodEndsAt: null,
        periodResets: false,
        purchasedTokens: { count: 0, expireAt: null, expiringCount: 0 },
        subscriptionCode: 'Free',
        tokens: { limit: 25_000, remaining: 25_000, used: 0 },
      })),
    }),
    onChangePlan,
  )

  // The first button is the plan card's, the second one belongs to the issues limit.
  await page.getByRole('button', { name: 'Change plan' }).nth(1).click()

  expect(onChangePlan).toHaveBeenCalled()
})
