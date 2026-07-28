import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { ActionResult } from '#infrastructure/api/apiResult'

import type { OrganizationPickerPageDeps } from './OrganizationPickerPage.deps'
import type { OrganizationPickerItem } from './OrganizationPickerPage.types'
import OrganizationPickerPage from './OrganizationPickerPage.vue'

type Item = OrganizationPickerItem

const organization: Item = {
  color: '#4774d4',
  description: 'Team organization',
  id: '42',
  initial: 'L',
  key: 'laraue-HF2P0',
  name: 'Laraue',
}

const createDeps = (
  view: OrganizationPickerPageDeps['view'],
  select: OrganizationPickerPageDeps['select'] = vi.fn<OrganizationPickerPageDeps['select']>(),
): OrganizationPickerPageDeps => ({ select, view })

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  props: OrganizationPickerPageDeps,
  onSelected: (organizationKey: string) => void,
) => {
  currentWrapper = await mountSuspended(OrganizationPickerPage, {
    attachTo: document.body,
    props: { deps: props, onSelected },
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows organizations and selects one', async () => {
  const view = vi.fn<OrganizationPickerPageDeps['view']>(async () => ({
    data: [organization],
    status: 'success',
  }))
  const select = vi.fn<OrganizationPickerPageDeps['select']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onSelected = vi.fn<(organizationKey: string) => void>()

  await mount(createDeps(view, select), onSelected)

  await page.getByRole('button', { name: /Laraue/ }).click()

  expect(select).toHaveBeenCalledWith({ organizationId: '42' })
  expect(onSelected).toHaveBeenCalledWith('laraue-HF2P0')
})

it('shows no organizations when the list is empty', async () => {
  const view = vi.fn<OrganizationPickerPageDeps['view']>(async () => ({
    data: [],
    status: 'success',
  }))

  await mount(createDeps(view), vi.fn<(organizationKey: string) => void>())

  await expect.element(page.getByText('No organizations yet.')).toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: /Laraue/ })).not.toBeInTheDocument()
})

it('reloads the organizations when the failed request is retried', async () => {
  const view = vi
    .fn<OrganizationPickerPageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: [organization], status: 'success' })

  await mount(createDeps(view), vi.fn<(organizationKey: string) => void>())

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByRole('button', { name: /Laraue/ })).toBeInTheDocument()
})

it('stays on the picker and shows the message when selecting fails', async () => {
  const view = vi.fn<OrganizationPickerPageDeps['view']>(async () => ({
    data: [organization],
    status: 'success',
  }))
  const select = vi.fn<OrganizationPickerPageDeps['select']>(
    async (): Promise<ActionResult<true>> => ({
      message: 'This organization is no longer available.',
      status: 'validation-error',
    }),
  )
  const onSelected = vi.fn<(organizationKey: string) => void>()

  await mount(createDeps(view, select), onSelected)

  await page.getByRole('button', { name: /Laraue/ }).click()

  await expect
    .element(page.getByText('This organization is no longer available.'))
    .toBeInTheDocument()
  expect(onSelected).not.toHaveBeenCalled()
})
