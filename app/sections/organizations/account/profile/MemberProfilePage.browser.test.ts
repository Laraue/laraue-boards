import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { MemberProfilePageDeps } from './MemberProfilePage.deps'
import MemberProfilePage from './MemberProfilePage.vue'

const createDeps = (overrides: Partial<MemberProfilePageDeps> = {}): MemberProfilePageDeps => ({
  update: vi.fn<MemberProfilePageDeps['update']>(async () => ({ data: true, status: 'success' })),
  view: vi.fn<MemberProfilePageDeps['view']>(async () => ({
    data: { color: '#4774d4', displayName: 'Ada Lovelace' },
    status: 'success',
  })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: MemberProfilePageDeps, onUpdated = vi.fn<() => void>()) => {
  currentWrapper = await mountSuspended(MemberProfilePage, {
    attachTo: document.body,
    props: { deps, onUpdated },
    route: '/organizations/acme-ab12/account',
  })
  return onUpdated
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  clearNuxtData()
  vi.restoreAllMocks()
})

it('saves the name shown in the organization', async () => {
  const deps = createDeps()
  const onUpdated = await mount(deps)

  await expect.element(page.getByLabelText('Name')).toHaveValue('Ada Lovelace')
  await page.getByLabelText('Name').fill('Ada')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(deps.update).toHaveBeenCalledWith({ color: '#4774d4', displayName: 'Ada' })
  await expect.element(page.getByText('Changes saved.')).toBeVisible()
  expect(onUpdated).toHaveBeenCalledTimes(1)
})

it('takes the name from the profile again when it is cleared', async () => {
  const deps = createDeps()
  await mount(deps)

  await page.getByLabelText('Name').fill('')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(deps.update).toHaveBeenCalledWith({ color: '#4774d4', displayName: '' })
})
