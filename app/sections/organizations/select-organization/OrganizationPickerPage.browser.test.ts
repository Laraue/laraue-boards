import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { ActionResult } from '#infrastructure/api/apiResult'
import type { TourStateDeps } from '~/composables/useTour'

import type { OrganizationPickerPageDeps } from './OrganizationPickerPage.deps'
import type { OrganizationPickerItem } from './OrganizationPickerPage.types'
import OrganizationPickerPage from './OrganizationPickerPage.vue'

type Item = OrganizationPickerItem

const organization: Item = {
  canLeave: true,
  color: '#4774d4',
  description: 'Team organization',
  id: '42',
  initial: 'L',
  isPersonal: false,
  key: 'laraue-HF2P0',
  name: 'Laraue',
}

const createTourDeps = () => ({
  loadStatus: vi.fn<TourStateDeps['loadStatus']>(async () => 'completed'),
  saveStatus: vi.fn<TourStateDeps['saveStatus']>(async () => undefined),
})

const createDeps = (
  view: OrganizationPickerPageDeps['view'],
  select: OrganizationPickerPageDeps['select'] = vi.fn<OrganizationPickerPageDeps['select']>(),
  leave: OrganizationPickerPageDeps['leave'] = vi.fn<OrganizationPickerPageDeps['leave']>(),
): OrganizationPickerPageDeps => ({ leave, select, tour: createTourDeps(), view })

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

  await page.getByRole('button', { name: 'L Laraue Team organization' }).click()

  expect(select).toHaveBeenCalledWith({ organizationId: '42' })
  expect(onSelected).toHaveBeenCalledWith('laraue-HF2P0')
})

it('shows no organizations when the list is empty', async () => {
  const view = vi.fn<OrganizationPickerPageDeps['view']>(async () => ({
    data: [],
    status: 'success',
  }))

  await mount(createDeps(view), vi.fn<(organizationKey: string) => void>())

  await expect.element(page.getByText('No organizations yet')).toBeInTheDocument()
  await expect
    .element(page.getByRole('button', { name: 'L Laraue Team organization' }))
    .not.toBeInTheDocument()
})

it('leaves a team organization and reloads the list', async () => {
  const view = vi.fn<OrganizationPickerPageDeps['view']>(async () => ({
    data: [organization],
    status: 'success',
  }))
  const leave = vi.fn<OrganizationPickerPageDeps['leave']>(async () => ({
    data: true,
    status: 'success',
  }))
  vi.spyOn(window, 'confirm').mockReturnValue(true)

  await mount(createDeps(view, undefined, leave), vi.fn<(organizationKey: string) => void>())
  await page.getByRole('button', { name: 'Leave Laraue' }).click()

  expect(leave).toHaveBeenCalledWith({ id: '42' })
  await vi.waitFor(() => expect(view).toHaveBeenCalledTimes(2))
})

it('does not offer leaving an owned organization', async () => {
  const view = vi.fn<OrganizationPickerPageDeps['view']>(async () => ({
    data: [{ ...organization, canLeave: false }],
    status: 'success',
  }))

  await mount(createDeps(view), vi.fn<(organizationKey: string) => void>())

  await expect.element(page.getByRole('button', { name: 'Leave Laraue' })).not.toBeInTheDocument()
})

it('introduces the personal organization once', async () => {
  const tour = createTourDeps()
  tour.loadStatus.mockResolvedValue(undefined)
  const view = vi.fn<OrganizationPickerPageDeps['view']>(async () => ({
    data: [{ ...organization, description: 'Personal organization', isPersonal: true }],
    status: 'success',
  }))

  await mount({ ...createDeps(view), tour }, vi.fn<(organizationKey: string) => void>())

  await expect.element(page.getByText('Your personal workspace')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect.element(page.getByText('Bring your team together')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Start working' }).click()

  await vi.waitFor(() => expect(tour.saveStatus).toHaveBeenCalledWith('completed'))

  await currentWrapper?.unmount()
  currentWrapper = undefined
  tour.loadStatus.mockResolvedValue('completed')
  await mount({ ...createDeps(view), tour }, vi.fn<(organizationKey: string) => void>())

  await expect.element(page.getByText('Your personal workspace')).not.toBeInTheDocument()
})

it('reloads the organizations when the failed request is retried', async () => {
  const view = vi
    .fn<OrganizationPickerPageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: [organization], status: 'success' })

  await mount(createDeps(view), vi.fn<(organizationKey: string) => void>())

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect
    .element(page.getByRole('button', { name: 'L Laraue Team organization' }))
    .toBeInTheDocument()
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

  await page.getByRole('button', { name: 'L Laraue Team organization' }).click()

  await expect
    .element(page.getByText('This organization is no longer available.'))
    .toBeInTheDocument()
  expect(onSelected).not.toHaveBeenCalled()
})
