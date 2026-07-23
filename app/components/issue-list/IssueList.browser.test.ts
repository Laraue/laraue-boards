import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'

import type { MoveIssuesDialogDeps } from './components/move-issues-dialog/MoveIssuesDialog.deps'
import type { IssueListDeps } from './IssueList.deps'
import type { IssueListItem } from './IssueList.types'
import IssueList from './IssueList.vue'

const issueOf = (issueKey: string, content: string): IssueListItem => ({
  assignee: 'Ada',
  assigneeColor: '#111',
  assigneeInitial: 'A',
  boardColor: '#222',
  boardName: 'Roadmap',
  canMove: true,
  content,
  issueKey,
  spaceColor: '#333',
  spaceName: 'Product',
  status: 'To do',
  statusColor: '#444',
})

const issues = [issueOf('ISS-1', 'First issue'), issueOf('ISS-2', 'Second issue')]

const createDeps = (overrides: Partial<MoveIssuesDialogDeps> = {}): IssueListDeps => ({
  moveIssuesDialog: {
    boardSelect: {
      loadBoards: vi.fn<BoardSelectDeps['loadBoards']>(async () => ({
        data: [{ label: 'Sprint board', value: '12' }],
        status: 'success',
      })),
    },
    moveIssues: vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => ({
      data: true,
      status: 'success',
    })),
    spaceSelect: {
      loadSpaces: vi.fn<SpaceSelectDeps['loadSpaces']>(async () => ({
        data: [{ label: 'Product', value: '7' }],
        status: 'success',
      })),
    },
    statusSelect: {
      loadStatuses: vi.fn<StatusSelectDeps['loadStatuses']>(async () => ({
        data: [
          { label: 'To do', value: '3' },
          { label: 'Done', value: '4' },
        ],
        status: 'success',
      })),
    },
    ...overrides,
  },
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: IssueListDeps,
  onMoved: () => void = vi.fn<() => void>(),
  listIssues: IssueListItem[] = issues,
) => {
  currentWrapper = await mountSuspended(IssueList, {
    attachTo: document.body,
    props: {
      deps,
      emptyText: 'No issues yet.',
      filtering: false,
      hasNextPage: false,
      issues: listIssues,
      onMoved,
      onUpdatePage: vi.fn<(value: number) => void>(),
      page: 1,
    },
    route: '/organizations/acme-ab12/issues',
  })
  return currentWrapper
}

const dialog = () => page.getByRole('dialog')

const chooseDestination = async () => {
  await dialog().getByLabelText('Space').click()
  await expect.element(dialog().getByRole('option', { name: 'Product' })).toBeInTheDocument()
  await dialog().getByLabelText('Space').selectOptions('7')
  await dialog().getByLabelText('Board').click()
  await expect.element(dialog().getByRole('option', { name: 'Sprint board' })).toBeInTheDocument()
  await dialog().getByLabelText('Board').selectOptions('12')
  await dialog().getByLabelText('Column').click()
  await expect.element(dialog().getByRole('option', { name: 'To do' })).toBeInTheDocument()
  await dialog().getByLabelText('Column').selectOptions('3')
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the empty text when there are no issues', async () => {
  await mount(createDeps(), vi.fn<() => void>(), [])

  await expect.element(page.getByText('No issues yet.')).toBeInTheDocument()
})

it('moves a single issue through its row action without touching the selection', async () => {
  const moveIssues = vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onMoved = vi.fn<() => void>()

  await mount(createDeps({ moveIssues }), onMoved)

  await page.getByLabelText('Select issue').nth(1).click()
  await page.getByLabelText('Move to board').nth(0).click()
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  expect(moveIssues).toHaveBeenCalledWith({ issueKeys: ['ISS-1'], statusId: '3' })
  expect(onMoved).toHaveBeenCalledTimes(1)
})

it('moves every selected issue and clears the selection afterwards', async () => {
  const moveIssues = vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => ({
    data: true,
    status: 'success',
  }))

  await mount(createDeps({ moveIssues }))

  await page.getByLabelText('Select issue').nth(0).click()
  await page.getByLabelText('Select issue').nth(1).click()
  await page.getByRole('button', { name: 'Move to board' }).first().click()
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  expect(moveIssues).toHaveBeenCalledWith({ issueKeys: ['ISS-1', 'ISS-2'], statusId: '3' })
  await expect.element(page.getByText('2 selected')).not.toBeInTheDocument()
})

it('keeps the dialog open and shows the message when moving fails', async () => {
  const moveIssues = vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => ({
    message: 'These issues can no longer be moved.',
    status: 'validation-error',
  }))
  const onMoved = vi.fn<() => void>()

  await mount(createDeps({ moveIssues }), onMoved)

  await page.getByLabelText('Move to board').nth(0).click()
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  await expect
    .element(dialog().getByText('These issues can no longer be moved.'))
    .toBeInTheDocument()
  expect(onMoved).not.toHaveBeenCalled()
})

it('drops the failure message as soon as the destination changes', async () => {
  const moveIssues = vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => ({
    message: 'These issues can no longer be moved.',
    status: 'validation-error',
  }))

  await mount(createDeps({ moveIssues }))

  await page.getByLabelText('Move to board').nth(0).click()
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()
  await expect
    .element(dialog().getByText('These issues can no longer be moved.'))
    .toBeInTheDocument()

  await dialog().getByLabelText('Column').selectOptions('4')

  await expect
    .element(dialog().getByText('These issues can no longer be moved.'))
    .not.toBeInTheDocument()
})
