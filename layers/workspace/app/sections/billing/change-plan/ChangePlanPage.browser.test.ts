import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { ChangePlanPageDeps } from './ChangePlanPage.deps'
import ChangePlanPage from './ChangePlanPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const createDeps = (
  overrides: Partial<ChangePlanPageDeps> = {},
  canPay = true,
): ChangePlanPageDeps => ({
  getPlans: vi.fn<ChangePlanPageDeps['getPlans']>(async () => ({
    personal: [
      {
        currencyCode: 'RUB',
        formattedPrice: '0₽',
        id: 'free-id',
        isFree: true,
        storageAddonPrices: [],
        storageMegabytes: 100,
        title: 'Free',
        tokens: 10_000,
      },
      {
        currencyCode: 'RUB',
        formattedPrice: '334₽',
        id: 'plus-id',
        isFree: false,
        storageAddonPrices: [{ addonId: 'addon-10', formattedPrice: '417₽' }],
        storageMegabytes: 1024,
        title: 'Plus',
        tokens: 300_000,
      },
    ],
    storageAddons: [
      { formattedPrice: '84₽', id: 'addon-10', storageMegabytes: 10_240, title: '+10 GB' },
    ],
    team: [],
  })),
  startCheckout: vi.fn<ChangePlanPageDeps['startCheckout']>(async () => ({
    kind: 'payment',
    url: 'about:blank#checkout',
  })),
  view: vi.fn<ChangePlanPageDeps['view']>(async () => ({
    canPay,
    kind: 'personal',
    storageAddonId: null,
    storageUsedBytes: 0,
    subscriptionCode: 'Free',
  })),
  ...overrides,
})

const mountPage = async (
  deps: ChangePlanPageDeps,
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
      storageAddonId: null,
    }),
  )
  await vi.waitFor(() => expect(onPay).toHaveBeenCalledWith('about:blank#checkout'))
})

it('charges the plan with the chosen extra storage as one price', async () => {
  const deps = createDeps()
  await mountPage(deps)

  await page.getByRole('button', { name: 'Select this plan' }).click()
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: '+10 GB for 84₽ / month' }).click()

  await expect.element(page.getByText('11 GB of file storage in total')).toBeVisible()
  await page.getByRole('checkbox').click()
  await page.getByRole('button', { name: 'Pay 417₽' }).click()

  await vi.waitFor(() =>
    expect(deps.startCheckout).toHaveBeenCalledWith({
      currencyCode: 'RUB',
      itemId: 'plus-id',
      kind: 'Subscription',
      storageAddonId: 'addon-10',
    }),
  )
})

it('says how much to delete when the files take more than the choice gives', async () => {
  const onPay = vi.fn<(url: string) => void>()
  const deps = createDeps({
    startCheckout: vi.fn<ChangePlanPageDeps['startCheckout']>(async () => ({
      excessBytes: 524_288_000,
      kind: 'storageOverLimit',
      quotaBytes: 1_073_741_824,
      usedBytes: 1_598_029_824,
    })),
  })
  await mountPage(deps, onPay)

  await page.getByRole('button', { name: 'Select this plan' }).click()
  await page.getByRole('checkbox').click()
  await page.getByRole('button', { name: 'Pay 334₽' }).click()

  await expect
    .element(
      page.getByText(
        'Your files take 1.5 GB, and this choice gives 1 GB. Delete 500 MB of files first, or choose more storage.',
      ),
    )
    .toBeVisible()
  expect(onPay).not.toHaveBeenCalled()
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
