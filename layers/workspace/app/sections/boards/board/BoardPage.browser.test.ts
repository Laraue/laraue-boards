import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import type { LocationQueryRaw } from 'vue-router'

import { ApiError } from '#infrastructure/api/request'
import { createOrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

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
  data = board,
  issueCard = {
    assigneeSelect: {
      loadAssignees: vi.fn<BoardPageDeps['issueCard']['assigneeSelect']['loadAssignees']>(
        async () => [],
      ),
    },
    saveAssignee: vi.fn<BoardPageDeps['issueCard']['saveAssignee']>(async () => {}),
  },
  loadMoreBoardIssues = vi.fn<BoardPageDeps['loadMoreBoardIssues']>(),
  moveIssueToBacklog = vi.fn<BoardPageDeps['moveIssueToBacklog']>(),
  onCreateIssue = vi.fn<(statusId: string) => void>(),
  onPushQuery = vi.fn<(query: LocationQueryRaw) => void>(),
  onReplaceQuery = vi.fn<(query: LocationQueryRaw) => void>(),
  searchBoardIssues = vi.fn<BoardPageDeps['searchBoardIssues']>(),
}: {
  data?: BoardPageViewModel
  issueCard?: BoardPageDeps['issueCard']
  loadMoreBoardIssues?: BoardPageDeps['loadMoreBoardIssues']
  moveIssueToBacklog?: BoardPageDeps['moveIssueToBacklog']
  onCreateIssue?: (statusId: string) => void
  onPushQuery?: (query: LocationQueryRaw) => void
  onReplaceQuery?: (query: LocationQueryRaw) => void
  searchBoardIssues?: BoardPageDeps['searchBoardIssues']
} = {}) => {
  const deps: BoardPageDeps = {
    issueCard,
    issueDialog: {} as BoardPageDeps['issueDialog'],
    loadMoreBoardIssues,
    moveBoardIssue: vi.fn<BoardPageDeps['moveBoardIssue']>(),
    moveIssueToBacklog,
    searchBoardIssues,
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
      onPushQuery,
      onReplaceQuery,
      organizationRoutes: createOrganizationRoutes('acme-ab12'),
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

it('keeps the board status out of the header', async () => {
  await mount({ data: { ...board, status: 'Active' } })

  await expect.element(page.getByText('In progress', { exact: true })).not.toBeInTheDocument()
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
              assigneeId: 'jane',
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
    assigneeId: 'jane',
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
            {
              ...issue,
              blocked: true,
              issueKey: 'ISS-1',
              source: { keyName: null, kind: 'web' },
              title: 'Waits for the API',
            },
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
  expect(page.getByRole('combobox', { exact: true, name: 'Assignee' }).all()).toHaveLength(0)
  const card = currentWrapper!.get('.task').element
  expect(card.querySelector('.task-key')?.nextElementSibling?.className).toBe('task-blocked')
  expect(
    card.querySelector('time')?.previousElementSibling?.classList.contains('issue-source-icon'),
  ).toBe(true)
  expect(card.querySelector('.task-title .issue-source-icon')).toBeNull()
})

it('closes sibling assignee pickers, toggles them and dismisses on Escape or an outside click', async () => {
  const onPushQuery = vi.fn<(query: LocationQueryRaw) => void>()
  const issue = {
    assigneeColor: '#4774d4',
    assigneeId: 'jane',
    assigneeInitial: 'JD',
    assigneeName: 'Jane Doe',
    blocked: false,
    time: '2026-01-01T10:00:00Z',
  }
  await mount({
    data: {
      ...board,
      canMoveIssues: true,
      columns: ['1', '2'].map((id) => ({
        color: '#4774d4',
        hasNext: false,
        id,
        issueCount: 1,
        issues: [{ ...issue, issueKey: `ISS-${id}`, title: `Issue ${id}` }],
        title: `Column ${id}`,
      })),
      issueCount: 2,
    },
    onPushQuery,
  })
  const element: Element = currentWrapper!.element
  const buttons = element.querySelectorAll<HTMLButtonElement>('.task [role=combobox]')
  const outside = page.getByRole('searchbox', { name: 'Search issues' }).element()

  await userEvent.click(buttons[0]!)
  await expect.element(page.getByRole('listbox')).toBeVisible()
  await userEvent.click(buttons[1]!)
  await expect.element(page.getByRole('listbox')).toBeVisible()
  expect(buttons[0]!.getAttribute('aria-expanded')).toBe('false')
  expect(buttons[1]!.getAttribute('aria-expanded')).toBe('true')
  await expect.element(page.getByRole('option')).toHaveFocus()
  await userEvent.click(buttons[1]!)
  await expect.element(page.getByRole('listbox')).not.toBeInTheDocument()
  await userEvent.click(buttons[0]!)
  await userEvent.keyboard('{Escape}')
  await expect.element(page.getByRole('listbox')).not.toBeInTheDocument()
  await userEvent.click(buttons[0]!)
  await userEvent.click(outside)
  await expect.element(page.getByRole('listbox')).not.toBeInTheDocument()
  expect(onPushQuery).not.toHaveBeenCalled()
  expect(currentWrapper!.find('.board--dragging').exists()).toBe(false)
})

it.each([false, true])(
  'changes the card assignee without opening or dragging the issue (failure: %s)',
  async (fails) => {
    const issue = {
      assigneeColor: '#4774d4',
      assigneeId: 'jane',
      assigneeInitial: 'JD',
      assigneeName: 'Jane Doe',
      blocked: false,
      issueKey: 'ISS-1',
      time: '2026-01-01T10:00:00Z',
      title: 'Fix the regression',
    }
    const updated = {
      ...issue,
      assigneeId: 'grace',
      assigneeInitial: 'GH',
      assigneeName: 'Grace Hopper',
    }
    const saveAssignee = vi.fn<BoardPageDeps['issueCard']['saveAssignee']>(async () => {
      if (fails) {
        throw new ApiError(403, 'Assignment is not allowed.')
      }
    })
    const loadAssignees = vi.fn<BoardPageDeps['issueCard']['assigneeSelect']['loadAssignees']>(
      async () => [
        {
          color: '#4774d4',
          initials: 'JD',
          isCurrentUser: false,
          label: 'Jane Doe',
          value: 'jane',
        },
        {
          color: '#4774d4',
          initials: 'GH',
          isCurrentUser: false,
          label: 'Grace Hopper',
          value: 'grace',
        },
      ],
    )
    const onPushQuery = vi.fn<(query: LocationQueryRaw) => void>()
    const loadMoreBoardIssues = vi.fn<BoardPageDeps['loadMoreBoardIssues']>(async () => ({
      hasNext: false,
      issues: [updated],
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
            issues: [issue],
            title: 'To do',
          },
        ],
        issueCount: 1,
      },
      issueCard: { assigneeSelect: { loadAssignees }, saveAssignee },
      loadMoreBoardIssues,
      onPushQuery,
      searchBoardIssues: async () => ({
        columns: [{ hasNext: false, id: '1', issueCount: 1, issues: [updated] }],
        issueCount: 1,
      }),
    })

    expect(loadAssignees).not.toHaveBeenCalled()
    await page.getByRole('combobox', { exact: true, name: 'Assignee' }).click()
    await page.getByRole('option', { exact: true, name: 'Grace Hopper' }).click()
    expect(saveAssignee).toHaveBeenCalledWith({ assigneeId: 'grace', issueKey: 'ISS-1' })
    expect(onPushQuery).not.toHaveBeenCalled()
    expect(currentWrapper!.find('.board--dragging').exists()).toBe(false)
    expect(currentWrapper!.find('.task a [role=combobox]').exists()).toBe(false)
    await expect
      .element(page.getByRole('combobox', { exact: true, name: 'Assignee' }))
      .toHaveTextContent(fails ? 'Jane Doe' : 'Grace Hopper')
    const element: Element = currentWrapper!.element
    await vi.waitFor(() =>
      expect(
        Array.from(element.querySelectorAll('.task [role=alert]'), (alert) =>
          alert.textContent?.trim(),
        ),
      ).toEqual(fails ? ['Assignment is not allowed.'] : []),
    )
    expect(loadMoreBoardIssues).toHaveBeenCalledTimes(fails ? 0 : 1)
  },
)
