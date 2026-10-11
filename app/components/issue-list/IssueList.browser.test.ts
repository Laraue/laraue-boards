import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { ApiError } from '#infrastructure/api/request'
import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'

import type { MoveIssuesDialogDeps } from './components/move-issues-dialog/MoveIssuesDialog.deps'
import type { IssueListDeps, IssueListQuickEditDeps } from './IssueList.deps'
import type { IssueListItem } from './IssueList.types'
import IssueList from './IssueList.vue'

const issueOf = (issueKey: string, title: string): IssueListItem => ({
  assignee: 'Ada',
  assigneeColor: '#111',
  assigneeInitial: 'A',
  boardColor: '#222',
  boardName: 'Roadmap',
  canMove: true,
  issueKey,
  spaceColor: '#333',
  spaceName: 'Product',
  status: 'To do',
  statusColor: '#444',
  title,
})

const issues = [issueOf('ISS-1', 'First issue'), issueOf('ISS-2', 'Second issue')]

const createDeps = (overrides: Partial<MoveIssuesDialogDeps> = {}): IssueListDeps => ({
  moveIssuesDialog: {
    boardSelect: {
      loadBoards: vi.fn<BoardSelectDeps['loadBoards']>(async () => [
        { label: 'Sprint board', value: '12' },
      ]),
    },
    moveIssues: vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => {}),
    spaceSelect: {
      loadSpaces: vi.fn<SpaceSelectDeps['loadSpaces']>(async () => [
        { label: 'Product', value: '7' },
      ]),
    },
    statusSelect: {
      loadStatuses: vi.fn<StatusSelectDeps['loadStatuses']>(async () => [
        { label: 'To do', value: '3' },
        { label: 'Done', value: '4' },
      ]),
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

const rowAction = async (index: number, name: string) => {
  await page.getByRole('button', { name: 'Issue actions' }).nth(index).click()
  await page.getByRole('menuitem', { exact: true, name }).last().click()
}

it('loads inline choices on opening and keeps the current status after a failed save', async () => {
  const deps = createDeps()
  const loadStatuses = vi.fn<StatusSelectDeps['loadStatuses']>(async () => [
    { label: 'To do', value: '3' },
    { label: 'Done', value: '4' },
  ])
  deps.quickEdit = {
    assigneeSelect: {
      loadAssignees: vi.fn<IssueListQuickEditDeps['assigneeSelect']['loadAssignees']>(async () => [
        { color: '#111', initials: 'A', isCurrentUser: false, label: 'Ada', value: 'ada' },
      ]),
    },
    saveAssignee: vi.fn<IssueListQuickEditDeps['saveAssignee']>(async () => {}),
    saveStatus: vi.fn<IssueListQuickEditDeps['saveStatus']>(async () => {
      throw new ApiError(400, 'Status cannot be changed.')
    }),
    statusSelect: { loadStatuses },
  }
  const onMoved = vi.fn<() => void>()
  await mount(deps, onMoved, [
    { ...issues[0]!, assigneeId: 'ada', boardId: '12', spaceKey: 'product', statusId: '3' },
  ])
  expect(loadStatuses).not.toHaveBeenCalled()
  expect(deps.quickEdit.assigneeSelect.loadAssignees).not.toHaveBeenCalled()
  await page.getByRole('combobox', { exact: true, name: 'Status' }).click()
  await page.getByRole('option', { exact: true, name: 'Done' }).click()
  await expect.element(page.getByRole('alert')).toBeInTheDocument()
  expect(deps.quickEdit.saveStatus).toHaveBeenCalledWith({ issueKey: 'ISS-1', statusId: '4' })
  await expect
    .element(page.getByRole('combobox', { exact: true, name: 'Status' }))
    .toHaveTextContent('To do')
  expect(onMoved).not.toHaveBeenCalled()
  await page.getByRole('combobox', { exact: true, name: 'Assignee' }).click()
  await expect.element(page.getByRole('option', { exact: true, name: 'Ada' })).toBeInTheDocument()
  expect(deps.quickEdit.assigneeSelect.loadAssignees).toHaveBeenCalledOnce()
})

const chooseDestination = async () => {
  await dialog().getByLabelText('Space').click()
  await expect.element(dialog().getByRole('option', { name: 'Product' })).toBeInTheDocument()
  await dialog().getByRole('option', { name: 'Product' }).click()
  await dialog().getByLabelText('Board').click()
  await expect.element(dialog().getByRole('option', { name: 'Sprint board' })).toBeInTheDocument()
  await dialog().getByRole('option', { name: 'Sprint board' }).click()
  await dialog().getByLabelText('Status').click()
  await expect.element(dialog().getByRole('option', { name: 'To do' })).toBeInTheDocument()
  await dialog().getByRole('option', { name: 'To do' }).click()
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
  const moveIssues = vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => {})
  const onMoved = vi.fn<() => void>()

  await mount(createDeps({ moveIssues }), onMoved)

  await rowAction(1, 'Select issue')
  await rowAction(0, 'Move to board')
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  expect(moveIssues).toHaveBeenCalledWith({ issueKeys: ['ISS-1'], statusId: '3' })
  expect(onMoved).toHaveBeenCalledTimes(1)
})

it('moves every selected issue and clears the selection afterwards', async () => {
  const moveIssues = vi.fn<MoveIssuesDialogDeps['moveIssues']>(async () => {})

  await mount(createDeps({ moveIssues }))

  await rowAction(0, 'Select issue')
  await page.getByLabelText('Select issue').nth(1).click()
  await page.getByRole('button', { name: 'Move to board' }).first().click()
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  expect(moveIssues).toHaveBeenCalledWith({ issueKeys: ['ISS-1', 'ISS-2'], statusId: '3' })
  await expect.element(page.getByText('2 selected')).not.toBeInTheDocument()
})

it('keeps the dialog open and shows the message when moving fails', async () => {
  const moveIssues = vi
    .fn<MoveIssuesDialogDeps['moveIssues']>()
    .mockRejectedValue(new ApiError(400, 'These issues can no longer be moved.'))
  const onMoved = vi.fn<() => void>()

  await mount(createDeps({ moveIssues }), onMoved)

  await rowAction(0, 'Move to board')
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()

  await expect
    .element(dialog().getByText('These issues can no longer be moved.'))
    .toBeInTheDocument()
  expect(onMoved).not.toHaveBeenCalled()
})

it('drops the failure message as soon as the destination changes', async () => {
  const moveIssues = vi
    .fn<MoveIssuesDialogDeps['moveIssues']>()
    .mockRejectedValue(new ApiError(400, 'These issues can no longer be moved.'))

  await mount(createDeps({ moveIssues }))

  await rowAction(0, 'Move to board')
  await chooseDestination()
  await dialog().getByRole('button', { exact: true, name: 'Move' }).click()
  await expect
    .element(dialog().getByText('These issues can no longer be moved.'))
    .toBeInTheDocument()

  await dialog().getByLabelText('Status').click()
  await dialog().getByRole('option', { name: 'Done' }).click()

  await expect
    .element(dialog().getByText('These issues can no longer be moved.'))
    .not.toBeInTheDocument()
})
