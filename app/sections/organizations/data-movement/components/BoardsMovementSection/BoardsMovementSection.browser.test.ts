import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { OrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { DataMovementPageData } from '~/sections/organizations/data-movement/DataMovementPage.types'

import type { BoardsMovementSectionDeps } from './BoardsMovementSection.deps'
import BoardsMovementSection from './BoardsMovementSection.vue'
import type { MoveBoardsDialogDeps } from './components/MoveBoardsDialog/MoveBoardsDialog.deps'

const spaces: DataMovementPageData['spaces'] = [
  {
    boards: [
      { color: '#f00', id: '21', name: 'Roadmap' },
      { color: '#0f0', id: '22', name: 'Support' },
    ],
    color: '#000',
    isDefault: false,
    key: '10',
    name: 'Development',
  },
]

const createDeps = (overrides: Partial<MoveBoardsDialogDeps> = {}): BoardsMovementSectionDeps => ({
  dialog: {
    moveBoards: vi.fn<MoveBoardsDialogDeps['moveBoards']>(async () => ({
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
    spaceSelect: {
      loadSpaces: vi.fn<SpaceSelectDeps['loadSpaces']>(async () => ({
        data: [{ label: 'Development', value: '10' }],
        status: 'success',
      })),
    },
    ...overrides,
  },
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: BoardsMovementSectionDeps,
  onMoved: () => void = vi.fn<() => void>(),
  boardSpaces: DataMovementPageData['spaces'] = spaces,
) => {
  currentWrapper = await mountSuspended(BoardsMovementSection, {
    attachTo: document.body,
    props: {
      currentOrganizationId: '1',
      currentOrganizationName: 'Current',
      deps,
      onMoved,
      spaces: boardSpaces,
    },
    route: '/organizations/acme-ab12/settings/data-movement',
  })
  return currentWrapper
}

const dialog = () => page.getByRole('dialog')

const chooseSpace = async () => {
  await dialog().getByLabelText('Space').click()
  await expect.element(dialog().getByRole('option', { name: 'Development' })).toBeInTheDocument()
  await dialog().getByLabelText('Space').selectOptions('10')
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows an empty state when no space has boards', async () => {
  await mount(createDeps(), vi.fn<() => void>(), [
    { boards: [], color: '#000', isDefault: false, key: '10', name: 'Development' },
  ])

  await expect.element(page.getByText('No movable boards.')).toBeInTheDocument()
  await expect.element(page.getByLabelText('Move Roadmap')).not.toBeInTheDocument()
})

it('moves a single board through its row action without touching the selection', async () => {
  const moveBoards = vi.fn<MoveBoardsDialogDeps['moveBoards']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onMoved = vi.fn<() => void>()

  await mount(createDeps({ moveBoards }), onMoved)

  await page.getByLabelText('Select Support').click()
  await page.getByLabelText('Move Roadmap').click()
  await chooseSpace()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  expect(moveBoards).toHaveBeenCalledWith({
    boardIds: ['21'],
    destinationOrganizationId: '1',
    destinationSpaceKey: '10',
  })
  expect(onMoved).toHaveBeenCalledTimes(1)
})

it('moves every selected board through the bulk action', async () => {
  const moveBoards = vi.fn<MoveBoardsDialogDeps['moveBoards']>(async () => ({
    data: true,
    status: 'success',
  }))

  await mount(createDeps({ moveBoards }))

  await page.getByLabelText('Select Roadmap').click()
  await page.getByLabelText('Select Support').click()
  await page.getByRole('button', { name: 'Move boards' }).click()
  await chooseSpace()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  expect(moveBoards).toHaveBeenCalledWith({
    boardIds: ['21', '22'],
    destinationOrganizationId: '1',
    destinationSpaceKey: '10',
  })
})

it('drops the selection when it is cleared', async () => {
  await mount(createDeps())

  await page.getByLabelText('Select Roadmap').click()
  await expect.element(page.getByText('1 selected')).toBeInTheDocument()

  await page.getByRole('button', { name: 'Clear' }).click()

  await expect.element(page.getByText('1 selected')).not.toBeInTheDocument()
  await expect.element(page.getByLabelText('Select Roadmap')).not.toBeChecked()
})

it('keeps the dialog open and reports the failure without moving on', async () => {
  const moveBoards = vi.fn<MoveBoardsDialogDeps['moveBoards']>(async () => ({
    message: 'The destination space is full.',
    status: 'validation-error',
  }))
  const onMoved = vi.fn<() => void>()

  await mount(createDeps({ moveBoards }), onMoved)

  await page.getByLabelText('Move Roadmap').click()
  await chooseSpace()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  await expect.element(dialog().getByText('The destination space is full.')).toBeInTheDocument()
  expect(onMoved).not.toHaveBeenCalled()
})

it('clears the previous failure when the dialog is opened again', async () => {
  const moveBoards = vi.fn<MoveBoardsDialogDeps['moveBoards']>(async () => ({
    message: 'The destination space is full.',
    status: 'validation-error',
  }))

  await mount(createDeps({ moveBoards }))

  await page.getByLabelText('Move Roadmap').click()
  await chooseSpace()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()
  await expect.element(dialog().getByText('The destination space is full.')).toBeInTheDocument()

  await dialog().getByRole('button', { name: 'Cancel' }).click()
  await page.getByLabelText('Move Support').click()

  await expect.element(dialog().getByText('The destination space is full.')).not.toBeInTheDocument()
  await expect.element(dialog().getByRole('button', { exact: true, name: 'Move' })).toBeDisabled()
})
