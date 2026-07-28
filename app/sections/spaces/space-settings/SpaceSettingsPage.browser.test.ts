import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { SpaceSettingsPageDeps } from './SpaceSettingsPage.deps'
import type { SpaceSettingsPageData } from './SpaceSettingsPage.types'
import SpaceSettingsPage from './SpaceSettingsPage.vue'

const pageData: SpaceSettingsPageData = {
  canDelete: true,
  canUpdate: true,
  color: '#4774d4',
  id: '4',
  name: 'Product',
  spaceKey: 'product',
}

const createDeps = (overrides: Partial<SpaceSettingsPageDeps> = {}): SpaceSettingsPageDeps => ({
  remove: vi.fn<SpaceSettingsPageDeps['remove']>(async () => ({
    data: true,
    status: 'success',
  })),
  update: vi.fn<SpaceSettingsPageDeps['update']>(async () => ({
    data: true,
    status: 'success',
  })),
  view: vi.fn<SpaceSettingsPageDeps['view']>(async () => ({
    data: pageData,
    status: 'success',
  })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: SpaceSettingsPageDeps,
  onDeleted: () => void = vi.fn<() => void>(),
  onUpdated: (spaceKey: string) => void = vi.fn<(spaceKey: string) => void>(),
) => {
  currentWrapper = await mountSuspended(SpaceSettingsPage, {
    attachTo: document.body,
    props: { deps, onDeleted, onUpdated, spaceKey: 'product' },
    route: '/organizations/acme-ab12/spaces/product/settings',
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  vi.restoreAllMocks()
})

it('submits edited settings and reports the trimmed key', async () => {
  const update = vi.fn<SpaceSettingsPageDeps['update']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onUpdated = vi.fn<(spaceKey: string) => void>()

  await mount(createDeps({ update }), vi.fn<() => void>(), onUpdated)
  await page.getByLabelText('Name').fill('Product team')
  await page.getByLabelText('Key').fill(' product-team ')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(update).toHaveBeenCalledWith({
    color: '#4774d4',
    key: 'product-team',
    name: 'Product team',
    spaceId: '4',
  })
  expect(onUpdated).toHaveBeenCalledWith('product-team')
})

it('deletes the space after confirmation', async () => {
  const remove = vi.fn<SpaceSettingsPageDeps['remove']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onDeleted = vi.fn<() => void>()
  vi.spyOn(window, 'confirm').mockReturnValue(true)

  await mount(createDeps({ remove }), onDeleted)
  await page.getByRole('button', { name: 'Delete space' }).click()

  expect(remove).toHaveBeenCalledWith({ spaceId: '4' })
  expect(onDeleted).toHaveBeenCalledTimes(1)
})

it('shows a validation message and stays on the page when updating fails', async () => {
  const update = vi.fn<SpaceSettingsPageDeps['update']>(async () => ({
    message: 'Key is already taken.',
    status: 'validation-error',
  }))
  const onUpdated = vi.fn<(spaceKey: string) => void>()

  await mount(createDeps({ update }), vi.fn<() => void>(), onUpdated)
  await page.getByRole('button', { name: 'Save changes' }).click()

  await expect.element(page.getByText('Key is already taken.')).toBeInTheDocument()
  expect(onUpdated).not.toHaveBeenCalled()
})

it('hides unavailable settings actions', async () => {
  const view = vi.fn<SpaceSettingsPageDeps['view']>(async () => ({
    data: { ...pageData, canDelete: false, canUpdate: false },
    status: 'success',
  }))

  await mount(createDeps({ view }))

  await expect.element(page.getByLabelText('Name')).toBeDisabled()
  await expect.element(page.getByRole('button', { name: 'Save changes' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Delete space' })).not.toBeInTheDocument()
})

it('reloads settings when the failed request is retried', async () => {
  const view = vi
    .fn<SpaceSettingsPageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: pageData, status: 'success' })

  await mount(createDeps({ view }))
  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByLabelText('Name')).toHaveValue('Product')
})
