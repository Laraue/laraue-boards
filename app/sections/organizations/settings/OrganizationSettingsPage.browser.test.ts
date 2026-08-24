import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { OrganizationSettingsPageDeps } from './OrganizationSettingsPage.deps'
import type { OrganizationSettingsPageData } from './OrganizationSettingsPage.types'
import OrganizationSettingsPage from './OrganizationSettingsPage.vue'

const pageData: OrganizationSettingsPageData = {
  canDelete: true,
  canUpdate: true,
  color: '#4774d4',
  id: '7',
  name: 'Acme',
  slug: 'acme',
}

const createDeps = (
  overrides: Partial<OrganizationSettingsPageDeps> = {},
): OrganizationSettingsPageDeps => ({
  remove: vi.fn<OrganizationSettingsPageDeps['remove']>(async () => ({
    data: true,
    status: 'success',
  })),
  updateOrganization: vi.fn<OrganizationSettingsPageDeps['updateOrganization']>(async () => ({
    data: true,
    status: 'success',
  })),
  view: vi.fn<OrganizationSettingsPageDeps['view']>(async () => ({
    data: pageData,
    status: 'success',
  })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: OrganizationSettingsPageDeps,
  onUpdated: () => void = vi.fn<() => void>(),
  onDeleted: () => void = vi.fn<() => void>(),
) => {
  currentWrapper = await mountSuspended(OrganizationSettingsPage, {
    attachTo: document.body,
    props: { deps, onDeleted, onUpdated },
    route: '/organizations/acme-ab12/settings',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  vi.restoreAllMocks()
})

it('shows the loaded settings', async () => {
  await mount(createDeps(), vi.fn<() => void>())

  await expect.element(page.getByLabelText('Name')).toHaveValue('Acme')
})

it('submits the edited settings and reports success', async () => {
  const updateOrganization = vi.fn<OrganizationSettingsPageDeps['updateOrganization']>(
    async () => ({ data: true, status: 'success' }),
  )
  const onUpdated = vi.fn<() => void>()

  await mount(createDeps({ updateOrganization }), onUpdated)

  await page.getByLabelText('Name').fill('Acme Studio')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(updateOrganization).toHaveBeenCalledWith({
    color: '#4774d4',
    id: '7',
    name: 'Acme Studio',
    slug: 'acme',
  })
  expect(onUpdated).toHaveBeenCalledTimes(1)
  await expect.element(page.getByText('Changes saved.')).toBeInTheDocument()
})

it('keeps the form open and shows the validation message returned by the backend', async () => {
  const updateOrganization = vi.fn<OrganizationSettingsPageDeps['updateOrganization']>(
    async () => ({ message: 'Name is already taken.', status: 'validation-error' }),
  )
  const onUpdated = vi.fn<() => void>()

  await mount(createDeps({ updateOrganization }), onUpdated)

  await page.getByRole('button', { name: 'Save changes' }).click()

  await expect.element(page.getByText('Name is already taken.')).toBeInTheDocument()
  expect(onUpdated).not.toHaveBeenCalled()
})

it('deletes the organization after confirmation', async () => {
  const remove = vi.fn<OrganizationSettingsPageDeps['remove']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onDeleted = vi.fn<() => void>()
  vi.spyOn(window, 'confirm').mockReturnValue(true)

  await mount(createDeps({ remove }), vi.fn<() => void>(), onDeleted)
  await page.getByRole('button', { name: 'Delete organization' }).click()

  expect(remove).toHaveBeenCalledWith({ id: '7' })
  expect(onDeleted).toHaveBeenCalledTimes(1)
})

it('reloads the settings when the failed request is retried', async () => {
  const view = vi
    .fn<OrganizationSettingsPageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: pageData, status: 'success' })

  await mount(createDeps({ view }), vi.fn<() => void>())

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByLabelText('Name')).toHaveValue('Acme')
})

it('hides unavailable settings actions', async () => {
  const view = vi.fn<OrganizationSettingsPageDeps['view']>(async () => ({
    data: { ...pageData, canDelete: false, canUpdate: false },
    status: 'success',
  }))

  await mount(createDeps({ view }), vi.fn<() => void>())

  await expect.element(page.getByLabelText('Name')).toBeDisabled()
  await expect.element(page.getByRole('button', { name: 'Save changes' })).not.toBeInTheDocument()
  await expect
    .element(page.getByRole('button', { name: 'Delete organization' }))
    .not.toBeInTheDocument()
})
