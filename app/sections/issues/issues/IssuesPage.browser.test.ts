import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { MoveIssuesDialogDeps } from '~/components/issue-list/components/move-issues-dialog/MoveIssuesDialog.deps'
import type { IssueListItem } from '~/components/issue-list/IssueList.types'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'
import type { TourStateDeps } from '~/composables/useTour'

import type { IssuesPageDeps } from './IssuesPage.deps'
import type { IssuesPageData } from './IssuesPage.types'
import IssuesPage from './IssuesPage.vue'

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

const pageData: IssuesPageData = {
  attributes: [{ color: '#fff', id: '3', name: 'Note', type: 'text' }],
  hasNextPage: false,
  issues: [issueOf('ISS-1', 'First issue')],
  spaces: [{ label: 'Product', value: '7' }],
}

const createTourDeps = () => ({
  loadStatus: vi.fn<TourStateDeps['loadStatus']>(async () => 'completed'),
  saveStatus: vi.fn<TourStateDeps['saveStatus']>(async () => undefined),
})

const createDeps = (overrides: Partial<IssuesPageDeps> = {}): IssuesPageDeps => ({
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
  searchIssues: vi.fn<IssuesPageDeps['searchIssues']>(async () => ({
    data: { hasNextPage: false, issues: [issueOf('ISS-2', 'Searched issue')] },
    status: 'success',
  })),
  tour: createTourDeps(),
  view: vi.fn<IssuesPageDeps['view']>(async () => ({ data: pageData, status: 'success' })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: IssuesPageDeps,
  onUpdateQuery: (query: LocationQueryRaw) => void = vi.fn<(query: LocationQueryRaw) => void>(),
  routeQuery: LocationQuery = {},
) => {
  currentWrapper = await mountSuspended(IssuesPage, {
    attachTo: document.body,
    props: { deps, onUpdateQuery, organizationKey: 'acme-ab12', routeQuery },
    route: '/organizations/acme-ab12/issues',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('loads the issues for the current route query', async () => {
  const view = vi.fn<IssuesPageDeps['view']>(async () => ({ data: pageData, status: 'success' }))

  await mount(createDeps({ view }), vi.fn<(query: LocationQueryRaw) => void>(), {
    page: '2',
    search: 'bug',
    space: ['7'],
  })

  await expect.element(page.getByText('First issue')).toBeInTheDocument()
})

it('links to the issue creation page only when a space exists', async () => {
  await mount(createDeps())

  await expect
    .element(page.getByRole('link', { name: 'Add issue' }))
    .toHaveAttribute('href', '/organizations/acme-ab12/issues/new')
})

it('introduces the all issues page once', async () => {
  localStorage.setItem('onboarding:opt-in:v1', 'accepted')
  const tour = createTourDeps()
  tour.loadStatus.mockResolvedValue(undefined)

  await mount(createDeps({ tour }))

  await expect.element(page.getByText('Find any issue')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect.element(page.getByText('Add an issue')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Create an issue' }).click()

  await vi.waitFor(() => expect(tour.saveStatus).toHaveBeenCalledWith('completed'))
})

it('hides the issue creation link when there is no space', async () => {
  const view = vi.fn<IssuesPageDeps['view']>(async () => ({
    data: { ...pageData, spaces: [] },
    status: 'success',
  }))

  await mount(createDeps({ view }))

  await expect.element(page.getByRole('link', { name: 'Add issue' })).not.toBeInTheDocument()
})

it('pushes the typed search into the route query and drops the page', async () => {
  const onUpdateQuery = vi.fn<(query: LocationQueryRaw) => void>()

  await mount(createDeps(), onUpdateQuery, { page: '3' })

  await page.getByLabelText('Search issues').fill('bug')

  expect(onUpdateQuery).toHaveBeenLastCalledWith({ search: 'bug' })
})

it('removes the search from the route query when it is cleared', async () => {
  const onUpdateQuery = vi.fn<(query: LocationQueryRaw) => void>()

  await mount(createDeps(), onUpdateQuery, { search: 'bug' })

  await page.getByLabelText('Search issues').fill('')

  expect(onUpdateQuery).toHaveBeenLastCalledWith({})
})

it('searches again when the route query changes and shows the new issues', async () => {
  const searchIssues = vi.fn<IssuesPageDeps['searchIssues']>(async () => ({
    data: { hasNextPage: false, issues: [issueOf('ISS-2', 'Searched issue')] },
    status: 'success',
  }))

  await mount(createDeps({ searchIssues }))
  await currentWrapper!.setProps({ routeQuery: { search: 'bug' } })

  await expect.element(page.getByText('Searched issue')).toBeInTheDocument()
  await expect.element(page.getByText('First issue')).not.toBeInTheDocument()
})

it('shows the failure message when searching fails and keeps the previous issues', async () => {
  const searchIssues = vi.fn<IssuesPageDeps['searchIssues']>(async () => ({
    code: 403,
    status: 'error',
  }))

  await mount(createDeps({ searchIssues }))
  await currentWrapper!.setProps({ routeQuery: { search: 'bug' } })

  await expect.element(page.getByText('You do not have permission to do this.')).toBeInTheDocument()
  await expect.element(page.getByText('First issue')).toBeInTheDocument()
})

it('reloads the issues when the failed request is retried', async () => {
  const view = vi
    .fn<IssuesPageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: pageData, status: 'success' })

  await mount(createDeps({ view }))

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByText('First issue')).toBeInTheDocument()
})
