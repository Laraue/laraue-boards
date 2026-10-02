import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { ApiError } from '#infrastructure/api/request'

import type { ProfileSectionDeps } from './ProfileSection.deps'
import ProfileSection from './ProfileSection.vue'

const createDeps = (overrides: Partial<ProfileSectionDeps> = {}): ProfileSectionDeps => ({
  update: vi.fn<ProfileSectionDeps['update']>(async ({ displayName, familyName, givenName }) => ({
    displayName,
    familyName,
    givenName,
  })),
  view: vi.fn<ProfileSectionDeps['view']>(async () => ({
    displayName: 'Ada Lovelace',
    familyName: 'Lovelace',
    givenName: 'Ada',
  })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: ProfileSectionDeps, onUpdated = vi.fn<() => void>()) => {
  currentWrapper = await mountSuspended(ProfileSection, {
    attachTo: document.body,
    props: { deps, onUpdated },
    route: '/account',
  })
  return onUpdated
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  clearNuxtData()
  vi.restoreAllMocks()
})

it('saves the global profile', async () => {
  const deps = createDeps()
  const onUpdated = await mount(deps)

  await expect.element(page.getByLabelText('Display name')).toHaveValue('Ada Lovelace')
  await page.getByLabelText('Given name').fill('Augusta')
  await page.getByLabelText('Family name').fill('King')
  await page.getByLabelText('Display name').fill('Countess of Lovelace')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(deps.update).toHaveBeenCalledWith({
    displayName: 'Countess of Lovelace',
    familyName: 'King',
    givenName: 'Augusta',
  })
  await expect.element(page.getByText('Changes saved.')).toBeVisible()
  expect(onUpdated).toHaveBeenCalledTimes(1)
})

it('does not save an empty display name', async () => {
  const deps = createDeps()
  await mount(deps)

  await page.getByLabelText('Display name').fill('  ')

  await expect.element(page.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  expect(deps.update).not.toHaveBeenCalled()
})

it('shows why the profile was not saved', async () => {
  const deps = createDeps({
    update: vi.fn<ProfileSectionDeps['update']>(async () => {
      throw new ApiError(503)
    }),
  })
  const onUpdated = await mount(deps)

  await page.getByRole('button', { name: 'Save changes' }).click()

  await expect.element(page.getByText('Changes saved.')).not.toBeInTheDocument()
  expect(onUpdated).not.toHaveBeenCalled()
})
