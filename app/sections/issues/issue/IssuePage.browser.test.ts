import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineComponent, h } from 'vue'

import { ApiError } from '#infrastructure/api/request'
import BaseConfirmHost from '~/components/ui/BaseConfirmHost.vue'

import type { IssuePageDeps, IssuePageViewModel } from './IssuePage.deps'
import IssuePage from './IssuePage.vue'

const issue: IssuePageViewModel = {
  agentRun: null,
  assignee: 'Ada Lovelace',
  assigneeColor: '#111',
  assigneeId: '9',
  assigneeInitial: 'A',
  assigneeIsCurrentUser: true,
  attachments: [],
  attributes: [],
  boardColor: '#4774d4',
  boardId: '12',
  boardIsBacklog: false,
  boardLabel: 'Sprint board',
  canEdit: true,
  content: 'Fix the bug',
  createdAt: '2026-01-01T00:00:00Z',
  issueKey: 'ISS-1',
  links: [],
  missingStatusCategoriesForAgent: [],
  owner: 'Grace Hopper',
  ownerColor: '#222',
  ownerInitial: 'G',
  spaceColor: '#4774d4',
  spaceId: '7',
  spaceLabel: 'Product',
  statusCategory: 'Created',
  statusColor: '#444',
  statusId: '3',
  statusLabel: 'To do',
  title: 'Fix the bug',
  updatedAt: '2026-01-02T00:00:00Z',
}

const createDeps = (overrides: Partial<IssuePageDeps> = {}): IssuePageDeps => ({
  agentRun: {
    cancel: vi.fn<IssuePageDeps['agentRun']['cancel']>(async () => {}),
    handOff: vi.fn<IssuePageDeps['agentRun']['handOff']>(async () => {}),
  },
  assigneeSelect: {
    loadAssignees: vi.fn<IssuePageDeps['assigneeSelect']['loadAssignees']>(async () => [
      {
        color: '#111',
        initials: 'A',
        isCurrentUser: false,
        label: 'Ada Lovelace',
        value: '9',
      },
    ]),
  },
  boardSelect: {
    loadBoards: vi.fn<IssuePageDeps['boardSelect']['loadBoards']>(async () => [
      { label: 'Sprint board', value: '12' },
    ]),
  },
  comments: {
    create: vi.fn<IssuePageDeps['comments']['create']>(),
    delete: vi.fn<IssuePageDeps['comments']['delete']>(),
    load: vi.fn<IssuePageDeps['comments']['load']>(async () => []),
    summarizeContent: vi.fn<IssuePageDeps['comments']['summarizeContent']>(
      async () => 'Improved content',
    ),
    update: vi.fn<IssuePageDeps['comments']['update']>(),
  },
  deleteIssue: vi.fn<IssuePageDeps['deleteIssue']>(async () => {}),
  description: {
    summarizeContent: vi.fn<IssuePageDeps['description']['summarizeContent']>(async () => ({
      content: 'Improved content',
      title: null,
    })),
  },
  history: {
    load: vi.fn<IssuePageDeps['history']['load']>(async () => ({ hasNextPage: false, items: [] })),
  },
  links: {
    add: vi.fn<IssuePageDeps['links']['add']>(async () => ({ outcome: 'added' as const })),
    remove: vi.fn<IssuePageDeps['links']['remove']>(async () => {}),
    searchIssues: vi.fn<IssuePageDeps['links']['searchIssues']>(async () => ({
      issues: [],
      outcome: 'found' as const,
    })),
  },
  saveIssue: vi.fn<IssuePageDeps['saveIssue']>(),
  spaceSelect: {
    loadSpaces: vi.fn<IssuePageDeps['spaceSelect']['loadSpaces']>(async () => [
      { label: 'Product', value: '7' },
    ]),
  },
  statusSelect: {
    loadStatuses: vi.fn<IssuePageDeps['statusSelect']['loadStatuses']>(async () => [
      { label: 'To do', value: '3' },
    ]),
  },
  view: vi.fn<IssuePageDeps['view']>(async () => issue),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: IssuePageDeps,
  onBack: () => Promise<void> | void = vi.fn<() => void>(),
  onDirtyChange = vi.fn<(dirty: boolean) => void>(),
  inDialog = false,
) => {
  currentWrapper = await mountSuspended(IssuePage, {
    attachTo: document.body,
    props: { deps, inDialog, issueKey: 'ISS-1', onBack, onDirtyChange },
    route: '/organizations/acme-ab12/issues/ISS-1',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the loaded issue', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => issue),
    }),
  )

  await expect.element(page.getByText('ISS-1', { exact: true })).toBeInTheDocument()
})

it('previews markdown content', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({
        ...issue,
        content: '# Steps\n\nUse **preview**.',
      })),
    }),
  )

  await expect.element(page.getByRole('heading', { name: 'Steps' })).toBeInTheDocument()
  await expect.element(page.getByText('preview', { exact: true })).toBeInTheDocument()
})

const bold = () => document.querySelector('[aria-label="Content"] strong')?.textContent

it('formats selected description text', async () => {
  await mount(createDeps())
  const modifier = /Mac/i.test(navigator.platform) ? 'Meta' : 'Control'

  await page.getByLabelText('Content').fill('Fix the bug')
  await userEvent.keyboard(`{${modifier}>}a{/${modifier}}`)
  await page.getByRole('button', { name: 'Bold (Ctrl+B)' }).click()
  await vi.waitFor(() => expect(bold()).toBe('Fix the bug'))

  await userEvent.keyboard(`{${modifier}>}z{/${modifier}}`)
  await vi.waitFor(() => expect(bold()).toBeUndefined())

  await userEvent.keyboard(`{${modifier}>}a{/${modifier}}`)
  await userEvent.keyboard('### Steps')
  await expect.element(page.getByRole('heading', { name: 'Steps' })).toBeInTheDocument()
})

it('shows comments loaded after creating one', async () => {
  const comment = {
    canModify: true,
    createdAt: '2026-01-03T00:00:00Z',
    id: '12',
    owner: { color: '#111', initials: 'A', name: 'Ada Lovelace' },
    text: 'New comment',
    updatedAt: '2026-01-03T00:00:00Z',
  }
  const create = vi.fn<IssuePageDeps['comments']['create']>(async () => {})
  const load = vi
    .fn<IssuePageDeps['comments']['load']>()
    .mockResolvedValueOnce([])
    .mockResolvedValue([comment])
  const view = vi.fn<IssuePageDeps['view']>(async () => issue)

  await mount(
    createDeps({
      comments: {
        create,
        delete: vi.fn<IssuePageDeps['comments']['delete']>(),
        load,
        summarizeContent: vi.fn<IssuePageDeps['comments']['summarizeContent']>(
          async () => 'Improved content',
        ),
        update: vi.fn<IssuePageDeps['comments']['update']>(),
      },
      view,
    }),
  )

  await page.getByLabelText('Write a comment').fill('New comment')
  await page.getByRole('button', { name: 'Add comment' }).click()

  await expect.element(page.getByText('New comment')).toBeInTheDocument()
  expect(load).toHaveBeenCalledTimes(2)
  expect(view).toHaveBeenCalledOnce()
})

it('retries the first history page after a failed load', async () => {
  const load = vi
    .fn<IssuePageDeps['history']['load']>()
    .mockRejectedValueOnce(new ApiError(503))
    .mockResolvedValueOnce({
      hasNextPage: false,
      items: [
        {
          changes: [
            {
              kind: 'status',
              newColor: null,
              newValue: 'Done',
              oldColor: null,
              oldValue: 'To do',
            },
          ],
          createdAt: '2026-01-03T00:00:00Z',
          owner: { color: '#111', initials: 'A', name: 'Ada Lovelace' },
        },
      ],
    })
  await mount(createDeps({ history: { load } }))
  await page.getByRole('tab', { name: 'History' }).click()
  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByText('Done', { exact: true })).toBeInTheDocument()
  expect(load).toHaveBeenCalledTimes(2)
  expect(load).toHaveBeenNthCalledWith(2, { issueKey: 'ISS-1', page: 0 })
  await expect.element(page.getByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
})

it('loads history only when its tab is opened', async () => {
  const loadHistory = vi.fn<IssuePageDeps['history']['load']>(async () => ({
    hasNextPage: false,
    items: [
      {
        changes: [
          {
            kind: 'status',

            newColor: null,
            newValue: 'Done',
            oldColor: null,
            oldValue: 'To do',
          },
          {
            commentAction: null,
            diff: [
              {
                kind: 'removed',
                oldLine: 1,
                spans: [
                  { changed: false, text: '- List Item ' },
                  { changed: true, text: '3' },
                ],
                text: '- List Item 3',
              },
              {
                kind: 'added',
                newLine: 1,
                spans: [
                  { changed: false, text: '- List Item ' },
                  { changed: true, text: '4' },
                ],
                text: '- List Item 4',
              },
            ],
            kind: 'description',
          },
        ],
        createdAt: '2026-01-03T00:00:00Z',
        owner: { color: '#111', initials: 'A', name: 'Ada Lovelace' },
      },
    ],
  }))

  await mount(createDeps({ history: { load: loadHistory } }))

  expect(loadHistory).not.toHaveBeenCalled()
  await expect.element(page.getByLabelText('Write a comment')).toBeInTheDocument()
  await page.getByRole('tab', { name: 'History' }).click()

  expect(loadHistory).toHaveBeenCalledWith({ issueKey: 'ISS-1', page: 0 })
  await expect.element(page.getByText('Status:')).toBeInTheDocument()
  await expect.element(page.getByText('Done')).toBeInTheDocument()
  await page.getByText('Description', { exact: true }).click()
  const changes = page.getByLabelText('Description changes')
  await expect.element(changes).toHaveTextContent('List Item')
  await expect.element(changes.getByRole('deletion')).toHaveTextContent('3')
  await expect.element(changes.getByRole('insertion')).toHaveTextContent('4')
  await expect.element(page.getByRole('button', { name: 'Unified' })).not.toBeInTheDocument()
})

it('links the dialog heading to the issue page without a back button', async () => {
  await mount(createDeps(), undefined, undefined, true)

  await expect
    .element(page.getByRole('link', { name: 'ISS-1' }))
    .toHaveAttribute('href', '/organizations/acme-ab12/issues/ISS-1')
  await expect.element(page.getByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  await expect.element(page.getByText('ISS-1', { exact: true })).toBeInTheDocument()
})

it('stays on the page after the issue is saved', async () => {
  const onBack = vi.fn<() => void>()
  const onDirtyChange = vi.fn<(dirty: boolean) => void>()
  const view = vi
    .fn<IssuePageDeps['view']>()
    .mockResolvedValueOnce(issue)
    .mockImplementation(() => new Promise(() => {}))
  await mount(
    createDeps({
      saveIssue: vi.fn<IssuePageDeps['saveIssue']>(async () => ({
        boardId: '12',
        complete: true,
        content: 'Document the reproduction steps',
        issueKey: 'ISS-1',
        previousBoardId: '12',
        previousIssueKey: 'ISS-1',
        previousStatusId: '3',
        spaceKey: '7',
        statusId: '3',
        title: 'Fix the bug',
      })),
      view,
    }),
    onBack,
    onDirtyChange,
  )

  await page.getByLabelText('Content').fill('Document the reproduction steps')
  await vi.waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true))
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(onBack).not.toHaveBeenCalled()
  expect(onDirtyChange).toHaveBeenLastCalledWith(false)
  await expect.element(page.getByText('ISS-1', { exact: true })).toBeInTheDocument()
})

it('hands the issue to the agent and shows the new run', async () => {
  const view = vi
    .fn<IssuePageDeps['view']>()
    .mockResolvedValueOnce(issue)
    .mockResolvedValue({
      ...issue,
      agentRun: { failureReason: null, finishedAt: null, id: '5', state: 'ready' },
    })
  const deps = createDeps({ view })
  await mount(deps)

  await page.getByRole('button', { name: 'Hand to agent' }).click()

  expect(deps.agentRun.handOff).toHaveBeenCalledWith({ issueKey: 'ISS-1' })
  await expect.element(page.getByText('For agent')).toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Cancel run' })).toBeInTheDocument()
})

it('cancels the open agent run after confirmation', async () => {
  const deps = createDeps({
    view: vi.fn<IssuePageDeps['view']>(async () => ({
      ...issue,
      agentRun: { failureReason: null, finishedAt: null, id: '5', state: 'working' },
    })),
  })
  // The confirmation is drawn by the app layout's host, which a bare page mount doesn't have.
  const PageWithConfirmHost = defineComponent({
    setup: () => () => [
      h(BaseConfirmHost, { cancelLabel: 'Cancel', dangerLabel: 'Delete' }),
      h(IssuePage, {
        deps,
        issueKey: 'ISS-1',
        onBack: vi.fn<() => void>(),
        onDirtyChange: vi.fn<(dirty: boolean) => void>(),
      }),
    ],
  })
  currentWrapper = await mountSuspended(PageWithConfirmHost, {
    attachTo: document.body,
    route: '/organizations/acme-ab12/issues/ISS-1',
  })

  await page.getByRole('button', { name: 'Cancel run' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Stop agent' }).click()

  await vi.waitFor(() => expect(deps.agentRun.cancel).toHaveBeenCalledWith({ runId: '5' }))
})

it('offers the hand-off only to the assignee', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({ ...issue, assigneeIsCurrentUser: false })),
    }),
  )

  await expect.element(page.getByRole('heading', { name: 'Agent' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Hand to agent' })).not.toBeInTheDocument()
})

it('locks the fields but still lets anyone who can edit cancel the run', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({
        ...issue,
        agentRun: { failureReason: null, finishedAt: null, id: '5', state: 'ready' },
        assigneeIsCurrentUser: false,
      })),
    }),
  )

  await expect.element(page.getByRole('textbox', { name: 'Title' })).toBeDisabled()
  await expect
    .element(
      page.getByText(
        'Editing is locked while the agent has the issue. Cancel the run to change it.',
      ),
    )
    .toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Cancel run' })).toBeEnabled()
})

it('disables the hand-off and says which statuses the board lacks', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({
        ...issue,
        missingStatusCategoriesForAgent: ['InProgress', 'Review'],
      })),
    }),
  )

  await expect.element(page.getByRole('button', { name: 'Hand to agent' })).toBeDisabled()
  await expect
    .element(
      page.getByRole('note', {
        name: 'Hand to agent: To hand issues to the agent, add statuses for these stages to the board: In progress, In review.',
      }),
    )
    .toBeInTheDocument()
})

it('disables the hand-off of a started issue and says why', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({ ...issue, statusCategory: 'InProgress' })),
    }),
  )

  await expect.element(page.getByRole('button', { name: 'Hand to agent' })).toBeDisabled()
  await expect
    .element(
      page.getByRole('note', {
        name: 'Hand to agent: Move the issue to a not started status to hand it to the agent.',
      }),
    )
    .toBeInTheDocument()
})

it('links the Links and Agent sections to their documentation', async () => {
  await mount(createDeps())

  await expect
    .element(
      page.getByRole('link', {
        name: 'Links: how it works (opens the documentation in a new tab)',
      }),
    )
    .toHaveAttribute('href', '/en/documentation/features/issue-links')
  await expect
    .element(
      page.getByRole('link', {
        name: 'Agent: how it works (opens the documentation in a new tab)',
      }),
    )
    .toHaveAttribute('href', '/en/documentation/integrations/agent-hand-off')
})

it('shows why a failed run gave up and how to try again', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({
        ...issue,
        agentRun: {
          failureReason: 'Timed out after 60 min',
          finishedAt: '2026-01-02T10:00:00Z',
          id: '5',
          state: 'failed',
        },
        statusCategory: 'InProgress',
      })),
    }),
  )

  await expect.element(page.getByText('Agent failed')).toBeInTheDocument()
  await expect.element(page.getByText(/Timed out after 60 min/)).toBeInTheDocument()
  await expect
    .element(page.getByText(/To try again, move the issue back to a not started status\./))
    .toBeInTheDocument()
})

it('says the agent waits for the open blockers', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({
        ...issue,
        links: [
          {
            issueKey: 'ISS-2',
            relation: 'blockedBy',
            statusCategory: 'InProgress',
            statusColor: '#111',
            statusLabel: 'In progress',
            title: 'Do this first',
          },
          {
            issueKey: 'ISS-3',
            relation: 'blockedBy',
            statusCategory: 'Completed',
            statusColor: '#222',
            statusLabel: 'Done',
            title: 'Already done',
          },
        ],
      })),
    }),
  )

  await expect
    .element(page.getByText('Blocked by ISS-2: the agent starts once they are completed.'))
    .toBeInTheDocument()
})

it('hides the agent actions when the issue cannot be edited', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({ ...issue, canEdit: false })),
    }),
  )

  await expect.element(page.getByRole('heading', { name: 'Agent' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Hand to agent' })).not.toBeInTheDocument()
})

it('hides the actions when the issue cannot be edited', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({ ...issue, canEdit: false })),
    }),
  )

  await expect.element(page.getByRole('button', { name: 'Save changes' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Delete issue' })).not.toBeInTheDocument()
})

it('reloads the issue when the failed request is retried', async () => {
  const view = vi
    .fn<IssuePageDeps['view']>()
    .mockRejectedValueOnce(new ApiError(403))
    .mockResolvedValue(issue)

  await mount(createDeps({ view }))

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByText('ISS-1', { exact: true })).toBeInTheDocument()
})

it('lists the issue links by what they mean and removes one', async () => {
  const remove = vi.fn<IssuePageDeps['links']['remove']>(async () => {})
  const view = vi.fn<IssuePageDeps['view']>(async () => ({
    ...issue,
    links: [
      {
        issueKey: 'ISS-2',
        relation: 'blockedBy' as const,
        statusCategory: 'InProgress' as const,
        statusColor: '#444',
        statusLabel: 'Doing',
        title: 'Build the API',
      },
    ],
  }))
  await mount(createDeps({ links: { ...createDeps().links, remove }, view }))

  await expect.element(page.getByRole('heading', { name: 'Blocked by' })).toBeInTheDocument()
  await expect.element(page.getByText('Build the API')).toBeInTheDocument()

  await page.getByRole('button', { name: 'Remove the link to ISS-2' }).click()

  expect(remove).toHaveBeenCalledWith({ issueKey: 'ISS-1', otherIssueKey: 'ISS-2' })
  expect(view).toHaveBeenCalledTimes(2)
})

it('adds a link to an issue picked from the suggestions', async () => {
  const add = vi.fn<IssuePageDeps['links']['add']>(async () => ({ outcome: 'added' as const }))
  const searchIssues = vi.fn<IssuePageDeps['links']['searchIssues']>(async () => ({
    issues: [
      { issueKey: 'ISS-1', title: 'Fix the bug' },
      { issueKey: 'ISS-7', title: 'Build the API' },
    ],
    outcome: 'found' as const,
  }))
  await mount(createDeps({ links: { ...createDeps().links, add, searchIssues } }))

  await page.getByRole('button', { name: 'Add link' }).click()
  await page.getByRole('combobox', { name: 'Issue' }).fill('api')
  await page.getByRole('option', { name: /ISS-7/ }).click()
  await page.getByRole('button', { exact: true, name: 'Add' }).click()

  expect(searchIssues).toHaveBeenCalledWith(expect.objectContaining({ search: 'api' }))
  // The issue itself is not suggested.
  expect(page.getByRole('option', { name: /ISS-1/ }).all()).toHaveLength(0)
  expect(add).toHaveBeenCalledWith({
    issueKey: 'ISS-1',
    otherIssueKey: 'ISS-7',
    relation: 'blockedBy',
  })
  await expect.element(page.getByRole('combobox', { name: 'Issue' })).not.toBeInTheDocument()
})

it('keeps the link fields open when no such issue is found', async () => {
  const add = vi.fn<IssuePageDeps['links']['add']>(async () => ({ outcome: 'notFound' as const }))
  await mount(createDeps({ links: { ...createDeps().links, add } }))

  await page.getByRole('button', { name: 'Add link' }).click()
  await page.getByRole('combobox', { name: 'Issue' }).fill('ISS-404')
  // Enter adds the typed key; the suggestion list's "No issues found" covers the Add button.
  await userEvent.keyboard('{Enter}')

  await expect.element(page.getByText('No issue ISS-404 that you can see')).toBeInTheDocument()
  await expect.element(page.getByRole('combobox', { name: 'Issue' })).toBeInTheDocument()
})
