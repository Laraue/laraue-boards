import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { MoveIssuesDialogDeps } from '~/components/issue-list/components/move-issues-dialog/MoveIssuesDialog.deps'
import type { IssueListItem } from '~/components/issue-list/IssueList.types'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'

import type { BacklogPageDeps } from './BacklogPage.deps'
import type { BacklogPageData } from './BacklogPage.types'
import BacklogPage from './BacklogPage.vue'

const issueOf = (issueKey: string, content: string): IssueListItem => ({
  assignee: 'Ada',
  assigneeColor: '#111',
  assigneeInitial: 'A',
  boardColor: '#222',
  boardName: 'Backlog',
  canMove: true,
  content,
  issueKey,
  status: 'Backlog',
  statusColor: '#333',
})

const pageData: BacklogPageData = {
  attributes: [],
  backlogBoardId: '8',
  color: '#4774d4',
  hasNextPage: false,
  issues: [issueOf('ISS-1', 'First issue')],
  spaceKey: 'product',
  title: 'Backlog',
}

const createDeps = (overrides: Partial<BacklogPageDeps> = {}): BacklogPageDeps => ({
  issueList: {
    moveIssuesDialog: {
      boardSelect: {
        loadBoards: vi.fn<BoardSelectDeps['loadBoards']>(async () => ({
          data: [],
          status: 'success',
        })),
      },
      moveIssues: vi.fn<MoveIssuesDialogDeps['moveIssues']>(),
      spaceSelect: {
        loadSpaces: vi.fn<SpaceSelectDeps['loadSpaces']>(async () => ({
          data: [],
          status: 'success',
        })),
      },
      statusSelect: {
        loadStatuses: vi.fn<StatusSelectDeps['loadStatuses']>(async () => ({
          data: [],
          status: 'success',
        })),
      },
    },
  },
  search: vi.fn<BacklogPageDeps['search']>(async () => ({
    data: { hasNextPage: false, issues: [issueOf('ISS-2', 'Searched issue')] },
    status: 'success',
  })),
  view: vi.fn<BacklogPageDeps['view']>(async () => ({
    data: pageData,
    status: 'success',
  })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: BacklogPageDeps,
  onUpdateQuery: (query: LocationQueryRaw) => void = vi.fn<(query: LocationQueryRaw) => void>(),
  routeQuery: LocationQuery = {},
) => {
  currentWrapper = await mountSuspended(BacklogPage, {
    attachTo: document.body,
    props: { deps, onUpdateQuery, routeQuery, spaceKey: 'product' },
    route: '/organizations/acme-ab12/spaces/product/backlog',
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('loads the current backlog and links to issue creation', async () => {
  const view = vi.fn<BacklogPageDeps['view']>(async () => ({
    data: pageData,
    status: 'success',
  }))

  await mount(createDeps({ view }), vi.fn<(query: LocationQueryRaw) => void>(), {
    page: '2',
    search: 'bug',
  })

  await expect.element(page.getByText('First issue')).toBeInTheDocument()
  await expect
    .element(page.getByRole('link', { name: 'Add issue' }))
    .toHaveAttribute('href', '/organizations/acme-ab12/spaces/product/backlog/issues/new')
})

it('pushes typed search into the route query and drops the page', async () => {
  const onUpdateQuery = vi.fn<(query: LocationQueryRaw) => void>()

  await mount(createDeps(), onUpdateQuery, { page: '3' })
  await page.getByLabelText('Search issues').fill('bug')

  expect(onUpdateQuery).toHaveBeenLastCalledWith({ search: 'bug' })
})

it('searches again when the route query changes and shows the new issues', async () => {
  const search = vi.fn<BacklogPageDeps['search']>(async () => ({
    data: { hasNextPage: false, issues: [issueOf('ISS-2', 'Searched issue')] },
    status: 'success',
  }))

  await mount(createDeps({ search }))
  await currentWrapper!.setProps({ routeQuery: { search: 'bug' } })

  await expect.element(page.getByText('Searched issue')).toBeInTheDocument()
})

it('shows a search failure while keeping the previous issues', async () => {
  const search = vi.fn<BacklogPageDeps['search']>(async () => ({
    code: 403,
    status: 'error',
  }))

  await mount(createDeps({ search }))
  await currentWrapper!.setProps({ routeQuery: { search: 'bug' } })

  await expect.element(page.getByText('You do not have permission to do this.')).toBeInTheDocument()
  await expect.element(page.getByText('First issue')).toBeInTheDocument()
})

it('reloads the backlog when the failed request is retried', async () => {
  const view = vi
    .fn<BacklogPageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: pageData, status: 'success' })

  await mount(createDeps({ view }))
  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByText('First issue')).toBeInTheDocument()
})
