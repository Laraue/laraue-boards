import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { OrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'

import type { MoveBoardsDialogDeps } from './components/BoardsMovementSection/components/MoveBoardsDialog/MoveBoardsDialog.deps'
import type { MoveSpacesDialogDeps } from './components/SpacesMovementSection/components/MoveSpacesDialog/MoveSpacesDialog.deps'
import type { DataMovementPageDeps } from './DataMovementPage.deps'
import type { DataMovementPageData } from './DataMovementPage.types'
import DataMovementPage from './DataMovementPage.vue'

const pageData: DataMovementPageData = {
  currentOrganizationId: '1',
  currentOrganizationName: 'Current',
  spaces: [
    {
      boards: [{ color: '#f00', id: '21', name: 'Board' }],
      color: '#000',
      id: '10',
      isDefault: false,
      name: 'Development',
    },
  ],
}

const createOrganizationSelect = (): OrganizationSelectDeps => ({
  loadOrganizations: vi.fn<OrganizationSelectDeps['loadOrganizations']>(async () => ({
    data: [
      { label: 'Current', value: '1' },
      { label: 'Target', value: '2' },
    ],
    status: 'success',
  })),
})

const createDeps = (view?: DataMovementPageDeps['view']): DataMovementPageDeps => ({
  boardsMovementSection: {
    dialog: {
      moveBoards: vi.fn<MoveBoardsDialogDeps['moveBoards']>(async () => ({
        data: true,
        status: 'success',
      })),
      organizationSelect: createOrganizationSelect(),
      spaceSelect: {
        loadSpaces: vi.fn<SpaceSelectDeps['loadSpaces']>(async () => ({
          data: [{ label: 'Development', value: '10' }],
          status: 'success',
        })),
      },
    },
  },
  spacesMovementSection: {
    dialog: {
      moveSpaces: vi.fn<MoveSpacesDialogDeps['moveSpaces']>(async () => ({
        data: true,
        status: 'success',
      })),
      organizationSelect: createOrganizationSelect(),
    },
  },
  view:
    view ??
    vi.fn<DataMovementPageDeps['view']>(async () => ({ data: pageData, status: 'success' })),
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: DataMovementPageDeps, onSpacesMoved = vi.fn<() => void>()) => {
  currentWrapper = await mountSuspended(DataMovementPage, {
    attachTo: document.body,
    props: { deps, onSpacesMoved },
    route: '/organizations/acme-ab12/settings/data-movement',
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
    .mockResolvedValueOnce({ data: pageData, status: 'success' })
    .mockResolvedValue({ data: { ...pageData, spaces: [] }, status: 'success' })
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
    .mockResolvedValueOnce({ data: pageData, status: 'success' })
    .mockResolvedValue({
      data: { ...pageData, spaces: [{ ...pageData.spaces[0]!, boards: [] }] },
      status: 'success',
    })
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
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: pageData, status: 'success' })

  await mount(createDeps(view))

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByLabelText('Select Development')).toBeInTheDocument()
})
