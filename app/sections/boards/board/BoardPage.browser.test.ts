import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import type { LocationQueryRaw } from 'vue-router'

import type { BoardPageDeps } from './BoardPage.deps'
import type { BoardPageViewModel } from './BoardPage.types'
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
  title: 'Roadmap',
}

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async ({
  data = board,
  moveIssueToBacklog = vi.fn<BoardPageDeps['moveIssueToBacklog']>(),
  onReplaceQuery = vi.fn<(query: LocationQueryRaw) => void>(),
}: {
  data?: BoardPageViewModel
  moveIssueToBacklog?: BoardPageDeps['moveIssueToBacklog']
  onReplaceQuery?: (query: LocationQueryRaw) => void
} = {}) => {
  const deps: BoardPageDeps = {
    issueDialog: {} as BoardPageDeps['issueDialog'],
    loadMoreBoardIssues: vi.fn<BoardPageDeps['loadMoreBoardIssues']>(),
    moveBoardIssue: vi.fn<BoardPageDeps['moveBoardIssue']>(),
    moveIssueToBacklog,
    searchBoardIssues: vi.fn<BoardPageDeps['searchBoardIssues']>(),
    view: vi.fn<BoardPageDeps['view']>(async () => ({
      data,
      status: 'success',
    })),
  }
  currentWrapper = await mountSuspended(BoardPage, {
    attachTo: document.body,
    props: {
      boardId: '12',
      deps,
      issueKey: null,
      onBack: vi.fn<() => void>(),
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

it('moves an issue to backlog and removes it from the board', async () => {
  const moveIssueToBacklog = vi.fn<BoardPageDeps['moveIssueToBacklog']>(async () => ({
    data: true,
    status: 'success',
  }))

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
              content: 'Fix the regression',
              issueKey: 'ISS-1',
              time: '2026-01-01T10:00:00Z',
            },
          ],
          title: 'To do',
        },
      ],
      issueCount: 1,
    },
    moveIssueToBacklog,
  })

  await page.getByRole('button', { exact: true, name: 'Move to backlog' }).click()

  await expect.element(page.getByText('ISS-1')).not.toBeInTheDocument()
  expect(moveIssueToBacklog).toHaveBeenCalledWith({
    boardId: '12',
    issueKey: 'ISS-1',
    spaceKey: 'product-AB12',
  })
})
