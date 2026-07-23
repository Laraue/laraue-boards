import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { OrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps'
import type { DataMovementPageData } from '~/sections/organizations/data-movement/DataMovementPage.types'

import type { MoveSpacesDialogDeps } from './components/MoveSpacesDialog/MoveSpacesDialog.deps'
import type { SpacesMovementSectionDeps } from './SpacesMovementSection.deps'
import SpacesMovementSection from './SpacesMovementSection.vue'

const spaces: DataMovementPageData['spaces'] = [
  { boards: [], color: '#aaa', id: '9', isDefault: true, name: 'Backlog' },
  { boards: [], color: '#000', id: '10', isDefault: false, name: 'Development' },
  { boards: [], color: '#fff', id: '11', isDefault: false, name: 'Product' },
]

const createDeps = (overrides: Partial<MoveSpacesDialogDeps> = {}): SpacesMovementSectionDeps => ({
  dialog: {
    moveSpaces: vi.fn<MoveSpacesDialogDeps['moveSpaces']>(async () => ({
      data: true,
      status: 'success',
    })),
    organizationSelect: {
      loadOrganizations: vi.fn<OrganizationSelectDeps['loadOrganizations']>(async () => ({
        data: [
          { label: 'Current', value: '1' },
          { label: 'Target', value: '2' },
        ],
        status: 'success',
      })),
    },
    ...overrides,
  },
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: SpacesMovementSectionDeps,
  onMoved: () => void = vi.fn<() => void>(),
  sectionSpaces: DataMovementPageData['spaces'] = spaces,
) => {
  currentWrapper = await mountSuspended(SpacesMovementSection, {
    attachTo: document.body,
    props: { deps, onMoved, spaces: sectionSpaces },
    route: '/organizations/acme-ab12/settings/data-movement',
  })
  return currentWrapper
}

const dialog = () => page.getByRole('dialog')

const chooseOrganization = async () => {
  await dialog().getByLabelText('Organization').click()
  await expect.element(dialog().getByRole('option', { name: 'Target' })).toBeInTheDocument()
  await dialog().getByLabelText('Organization').selectOptions('2')
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('hides the default space because it cannot be moved', async () => {
  await mount(createDeps())

  await expect.element(page.getByLabelText('Select Development')).toBeInTheDocument()
  await expect.element(page.getByLabelText('Select Backlog')).not.toBeInTheDocument()
})

it('shows an empty state when only the default space exists', async () => {
  await mount(createDeps(), vi.fn<() => void>(), [
    { boards: [], color: '#aaa', id: '9', isDefault: true, name: 'Backlog' },
  ])

  await expect.element(page.getByText('No movable spaces.')).toBeInTheDocument()
})

it('moves a single space through its row action without touching the selection', async () => {
  const moveSpaces = vi.fn<MoveSpacesDialogDeps['moveSpaces']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onMoved = vi.fn<() => void>()

  await mount(createDeps({ moveSpaces }), onMoved)

  await page.getByLabelText('Select Product').click()
  await page.getByLabelText('Move Development').click()
  await chooseOrganization()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  expect(moveSpaces).toHaveBeenCalledWith({ destinationOrganizationId: '2', spaceIds: ['10'] })
  expect(onMoved).toHaveBeenCalledTimes(1)
})

it('moves every selected space through the bulk action', async () => {
  const moveSpaces = vi.fn<MoveSpacesDialogDeps['moveSpaces']>(async () => ({
    data: true,
    status: 'success',
  }))

  await mount(createDeps({ moveSpaces }))

  await page.getByLabelText('Select Development').click()
  await page.getByLabelText('Select Product').click()
  await page.getByRole('button', { name: 'Move spaces' }).click()
  await chooseOrganization()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  expect(moveSpaces).toHaveBeenCalledWith({
    destinationOrganizationId: '2',
    spaceIds: ['10', '11'],
  })
})

it('drops the selection when it is cleared', async () => {
  await mount(createDeps())

  await page.getByLabelText('Select Development').click()
  await expect.element(page.getByText('1 selected')).toBeInTheDocument()

  await page.getByRole('button', { name: 'Clear' }).click()

  await expect.element(page.getByText('1 selected')).not.toBeInTheDocument()
  await expect.element(page.getByLabelText('Select Development')).not.toBeChecked()
})

it('keeps the dialog open and reports the failure without moving on', async () => {
  const moveSpaces = vi.fn<MoveSpacesDialogDeps['moveSpaces']>(async () => ({
    message: 'The destination organization is full.',
    status: 'validation-error',
  }))
  const onMoved = vi.fn<() => void>()

  await mount(createDeps({ moveSpaces }), onMoved)

  await page.getByLabelText('Move Development').click()
  await chooseOrganization()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  await expect
    .element(dialog().getByText('The destination organization is full.'))
    .toBeInTheDocument()
  expect(onMoved).not.toHaveBeenCalled()
})

it('resets the destination and the previous failure when the dialog is opened again', async () => {
  const moveSpaces = vi.fn<MoveSpacesDialogDeps['moveSpaces']>(async () => ({
    message: 'The destination organization is full.',
    status: 'validation-error',
  }))

  await mount(createDeps({ moveSpaces }))

  await page.getByLabelText('Move Development').click()
  await chooseOrganization()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()
  await expect
    .element(dialog().getByText('The destination organization is full.'))
    .toBeInTheDocument()

  await dialog().getByRole('button', { name: 'Cancel' }).click()
  await page.getByLabelText('Move Product').click()

  await expect
    .element(dialog().getByText('The destination organization is full.'))
    .not.toBeInTheDocument()
  await expect.element(dialog().getByLabelText('Organization')).toHaveValue('')
  await expect.element(dialog().getByRole('button', { exact: true, name: 'Move' })).toBeDisabled()
})
