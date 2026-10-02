import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { ApiError } from '#infrastructure/api/request'
import type { OrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'

import type { MoveBoardsDialogDeps } from './components/BoardsMovementSection/components/MoveBoardsDialog/MoveBoardsDialog.deps'
import type { MoveSpacesDialogDeps } from './components/SpacesMovementSection/components/MoveSpacesDialog/MoveSpacesDialog.deps'
import type { DataMovementPageData, DataMovementPageDeps } from './DataMovementPage.deps'
import DataMovementPage from './DataMovementPage.vue'

const pageData: DataMovementPageData = {
  currentOrganizationId: '1',
  currentOrganizationName: 'Current',
  spaces: [
    {
      boards: [{ color: '#f00', id: '21', name: 'Board' }],
      color: '#000',
      isDefault: false,
      key: '10',
      name: 'Development',
    },
  ],
}

const createOrganizationSelect = (): OrganizationSelectDeps => ({
  loadOrganizations: vi.fn<OrganizationSelectDeps['loadOrganizations']>(async () => [
    { label: 'Current', value: '1' },
    { label: 'Target', value: '2' },
  ]),
})

const createDeps = (view?: DataMovementPageDeps['view']): DataMovementPageDeps => ({
  boardsMovementSection: {
    dialog: {
      moveBoards: vi.fn<MoveBoardsDialogDeps['moveBoards']>(async () => {}),
      organizationSelect: createOrganizationSelect(),
      spaceSelect: {
        loadSpaces: vi.fn<SpaceSelectDeps['loadSpaces']>(async () => [
          { label: 'Development', value: '10' },
        ]),
      },
    },
  },
  spacesMovementSection: {
    dialog: {
      moveSpaces: vi.fn<MoveSpacesDialogDeps['moveSpaces']>(async () => {}),
      organizationSelect: createOrganizationSelect(),
    },
  },
  view: view ?? vi.fn<DataMovementPageDeps['view']>(async () => pageData),
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: DataMovementPageDeps, onSpacesMoved = vi.fn<() => void>()) => {
  currentWrapper = await mountSuspended(DataMovementPage, {
    attachTo: document.body,
    props: { deps, onSpacesMoved },
    route: '/organizations/acme-ab12/admin/data-movement',
  })
  return currentWrapper
}

const dialog = () => page.getByRole('dialog')

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('feeds both sections with the loaded spaces and boards', async () => {
  await mount(createDeps())

  await expect.element(page.getByLabelText('Select Development')).toBeInTheDocument()
  await expect.element(page.getByLabelText('Select Board')).toBeInTheDocument()
})

it('refreshes the page and notifies the layout after spaces moved', async () => {
  const view = vi
    .fn<DataMovementPageDeps['view']>()
    .mockResolvedValueOnce(pageData)
    .mockResolvedValue({ ...pageData, spaces: [] })
  const onSpacesMoved = vi.fn<() => void>()

  await mount(createDeps(view), onSpacesMoved)

  await page.getByLabelText('Move Development').click()
  await dialog().getByLabelText('Organization').click()
  await expect.element(dialog().getByRole('option', { name: 'Target' })).toBeInTheDocument()
  await dialog().getByLabelText('Organization').selectOptions('2')
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  await expect.element(page.getByText('No movable spaces.')).toBeInTheDocument()
  expect(onSpacesMoved).toHaveBeenCalledTimes(1)
})

it('refreshes the page without notifying the layout after boards moved', async () => {
  const view = vi
    .fn<DataMovementPageDeps['view']>()
    .mockResolvedValueOnce(pageData)
    .mockResolvedValue({ ...pageData, spaces: [{ ...pageData.spaces[0]!, boards: [] }] })
  const onSpacesMoved = vi.fn<() => void>()

  await mount(createDeps(view), onSpacesMoved)

  await page.getByLabelText('Move Board').click()
  await dialog().getByLabelText('Space').click()
  await expect.element(dialog().getByRole('option', { name: 'Development' })).toBeInTheDocument()
  await dialog().getByLabelText('Space').selectOptions('10')
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  await expect.element(page.getByText('No movable boards.')).toBeInTheDocument()
  expect(onSpacesMoved).not.toHaveBeenCalled()
})

it('reloads the page when the failed request is retried', async () => {
  const view = vi
    .fn<DataMovementPageDeps['view']>()
    .mockRejectedValueOnce(new ApiError(403))
    .mockResolvedValue(pageData)

  await mount(createDeps(view))

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByLabelText('Select Development')).toBeInTheDocument()
})
