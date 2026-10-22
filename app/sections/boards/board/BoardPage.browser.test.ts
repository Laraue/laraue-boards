import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import type { LocationQueryRaw } from 'vue-router'

import { ApiError } from '#infrastructure/api/request'

import type { BoardPageDeps, BoardPageViewModel } from './BoardPage.deps'
import BoardPage from './BoardPage.vue'

const board: BoardPageViewModel = {
  attributes: [],
  canCreateIssues: true,
  canDelete: false,
  canMoveIssues: false,
  canUpdate: true,
  color: '#4774d4',
  columns: [],
  id: '12',
  issueCount: 0,
  spaceColor: '#4774d4',
  spaceName: 'Product',
  status: 'New',
  title: 'Roadmap',
}

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async ({
  changeBoardStatus = vi.fn<BoardPageDeps['changeBoardStatus']>(async () => {}),
  data = board,
  moveIssueToBacklog = vi.fn<BoardPageDeps['moveIssueToBacklog']>(),
  onCreateIssue = vi.fn<(statusId: string) => void>(),
  onReplaceQuery = vi.fn<(query: LocationQueryRaw) => void>(),
}: {
  changeBoardStatus?: BoardPageDeps['changeBoardStatus']
  data?: BoardPageViewModel
  moveIssueToBacklog?: BoardPageDeps['moveIssueToBacklog']
  onCreateIssue?: (statusId: string) => void
  onReplaceQuery?: (query: LocationQueryRaw) => void
} = {}) => {
  const deps: BoardPageDeps = {
    changeBoardStatus,
    issueDialog: {} as BoardPageDeps['issueDialog'],
    loadMoreBoardIssues: vi.fn<BoardPageDeps['loadMoreBoardIssues']>(),
    moveBoardIssue: vi.fn<BoardPageDeps['moveBoardIssue']>(),
    moveIssueToBacklog,
    searchBoardIssues: vi.fn<BoardPageDeps['searchBoardIssues']>(),
    view: vi.fn<BoardPageDeps['view']>(async () => data),
  }
  currentWrapper = await mountSuspended(BoardPage, {
    attachTo: document.body,
    props: {
      boardId: '12',
      deps,
      issueKey: null,
      onBack: vi.fn<() => void>(),
      onCreateIssue,
      onIssueDirtyChange: vi.fn<(dirty: boolean) => void>(),
      onIssueMoved: vi.fn<() => void>(),
      onPushQuery: vi.fn<(query: LocationQueryRaw) => void>(),
      onReplaceQuery,
      routePath: '/organizations/acme-ab12/spaces/product-AB12/12',
      routeQuery: {},
      spaceKey: 'product-AB12',
    },
    route: '/organizations/acme-ab12/spaces/product-AB12/12',
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('puts a typed board search into the route query', async () => {
  const onReplaceQuery = vi.fn<(query: LocationQueryRaw) => void>()

  await mount({ onReplaceQuery })
  await page.getByLabelText('Search issues').fill('bug')

  await vi.waitFor(() => expect(onReplaceQuery).toHaveBeenLastCalledWith({ search: 'bug' }))
})

it('changes the board status from the header', async () => {
  const changeBoardStatus = vi.fn<BoardPageDeps['changeBoardStatus']>(async () => {})

  await mount({ changeBoardStatus })
  await page.getByRole('button', { name: 'Board status: New. Change' }).click()
  await page.getByRole('menuitem', { name: 'In progress' }).click()

  expect(changeBoardStatus).toHaveBeenCalledWith({ boardId: '12', status: 'Active' })
  await expect
    .element(page.getByRole('button', { name: 'Board status: In progress. Change' }))
    .toBeInTheDocument()
})

it('puts the previous board status back when saving it fails', async () => {
  const changeBoardStatus = vi.fn<BoardPageDeps['changeBoardStatus']>(async () => {
    throw new ApiError(400)
  })

  await mount({ changeBoardStatus })
  await page.getByRole('button', { name: 'Board status: New. Change' }).click()
  await page.getByRole('menuitem', { name: 'Done' }).click()

  await expect.element(page.getByRole('alert')).toBeInTheDocument()
  await expect
    .element(page.getByRole('button', { name: 'Board status: New. Change' }))
    .toBeInTheDocument()
})

it('shows the board status read-only to someone who cannot update the board', async () => {
  await mount({ data: { ...board, canUpdate: false, status: 'Done' } })

  await expect.element(page.getByText('Done', { exact: true })).toBeInTheDocument()
  await expect
    .element(page.getByRole('button', { name: /^Board status/ }))
    .not.toBeInTheDocument()
})

it('requests issue creation in the selected column', async () => {
  const onCreateIssue = vi.fn<(statusId: string) => void>()

  await mount({
    data: {
      ...board,
      columns: [
        {
          color: '#4774d4',
          hasNext: false,
          id: '3',
          issueCount: 0,
          issues: [],
          title: 'To do',
        },
      ],
    },
    onCreateIssue,
  })
  await page.getByRole('button', { name: 'Add issue to To do' }).click()

  expect(onCreateIssue).toHaveBeenCalledWith('3')
})

it('does not show a backlog action on issue cards', async () => {
  const moveIssueToBacklog = vi.fn<BoardPageDeps['moveIssueToBacklog']>(async () => {})

  await mount({
    data: {
      ...board,
      canMoveIssues: true,
      columns: [
        {
          color: '#4774d4',
          hasNext: false,
          id: '1',
          issueCount: 1,
          issues: [
            {
              assigneeColor: '#4774d4',
              assigneeInitial: 'JD',
              assigneeName: 'Jane Doe',
              blocked: false,
              issueKey: 'ISS-1',
              time: '2026-01-01T10:00:00Z',
              title: 'Fix the regression',
            },
          ],
          title: 'To do',
        },
      ],
      issueCount: 1,
    },
    moveIssueToBacklog,
  })

  await expect.element(page.getByText('ISS-1')).toBeInTheDocument()
  await expect
    .element(page.getByRole('button', { exact: true, name: 'Move to backlog' }))
    .not.toBeInTheDocument()
  expect(moveIssueToBacklog).not.toHaveBeenCalled()
})

it('marks the card of a blocked issue', async () => {
  const issue = {
    assigneeColor: '#4774d4',
    assigneeInitial: 'JD',
    assigneeName: 'Jane Doe',
    time: '2026-01-01T10:00:00Z',
  }

  await mount({
    data: {
      ...board,
      columns: [
        {
          color: '#4774d4',
          hasNext: false,
          id: '1',
          issueCount: 2,
          issues: [
            { ...issue, blocked: true, issueKey: 'ISS-1', title: 'Waits for the API' },
            { ...issue, blocked: false, issueKey: 'ISS-2', title: 'Build the API' },
          ],
          title: 'To do',
        },
      ],
      issueCount: 2,
    },
  })

  await expect.element(page.getByText('ISS-2')).toBeInTheDocument()
  expect(page.getByRole('img', { name: 'Blocked' }).all()).toHaveLength(1)
})
