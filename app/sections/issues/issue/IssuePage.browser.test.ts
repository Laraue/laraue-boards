import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { ApiError } from '#infrastructure/api/request'

import type { IssuePageDeps, IssuePageViewModel } from './IssuePage.deps'
import IssuePage from './IssuePage.vue'

const issue: IssuePageViewModel = {
  assignee: 'Ada Lovelace',
  assigneeColor: '#111',
  assigneeId: '9',
  assigneeInitial: 'A',
  assigneeIsCurrentUser: true,
  attachments: [],
  attributes: [],
  boardId: '12',
  boardLabel: 'Sprint board',
  canEdit: true,
  content: 'Fix the bug',
  createdAt: '2026-01-01T00:00:00Z',
  issueKey: 'ISS-1',
  owner: 'Grace Hopper',
  ownerColor: '#222',
  ownerInitial: 'G',
  spaceColor: '#4774d4',
  spaceId: '7',
  spaceLabel: 'Product',
  statusId: '3',
  statusLabel: 'To do',
  title: 'Fix the bug',
  updatedAt: '2026-01-02T00:00:00Z',
}

const createDeps = (overrides: Partial<IssuePageDeps> = {}): IssuePageDeps => ({
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

  await expect.element(page.getByRole('heading', { name: 'ISS-1' })).toBeInTheDocument()
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

it('formats selected description text', async () => {
  await mount(createDeps())

  await page.getByRole('button', { name: 'Edit description' }).click()
  await page.getByLabelText('Content').fill('Fix the bug')
  const textarea = document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Content"]')
  textarea?.setSelectionRange(0, 3)
  await page.getByRole('button', { name: 'Bold' }).click()

  await expect.element(page.getByLabelText('Content')).toHaveValue('**Fix** the bug')
  await userEvent.keyboard(
    /Mac/i.test(navigator.platform) ? '{Meta>}z{/Meta}' : '{Control>}z{/Control}',
  )
  await expect.element(page.getByLabelText('Content')).toHaveValue('Fix the bug')

  textarea?.setSelectionRange(0, textarea.value.length)
  await page.getByLabelText('Heading level').selectOptions('###')
  await expect.element(page.getByLabelText('Content')).toHaveValue('### Fix the bug')
  await page.getByRole('button', { name: 'Return to visual' }).click()
  await expect.element(page.getByRole('heading', { name: 'Fix the bug' })).toBeInTheDocument()
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
  await expect
    .element(page.getByLabelText('Description changes split view'))
    .toHaveTextContent('List Item 3')
  await expect
    .element(page.getByLabelText('Description changes split view'))
    .toHaveTextContent('List Item 4')
  await expect.element(page.getByRole('button', { name: 'Unified' })).not.toBeInTheDocument()
})

it('leaves the dialog when back is pressed', async () => {
  const onBack = vi.fn<() => Promise<void>>(() => new Promise(() => {}))

  await mount(createDeps(), onBack, undefined, true)

  await page.getByRole('button', { name: 'Back' }).click()

  expect(onBack).toHaveBeenCalledTimes(1)
  await expect.element(page.getByRole('heading', { name: 'ISS-1' })).toBeInTheDocument()
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

  await page.getByRole('button', { name: 'Edit description' }).click()
  await page.getByLabelText('Content').fill('Document the reproduction steps')
  await vi.waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true))
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(onBack).not.toHaveBeenCalled()
  expect(onDirtyChange).toHaveBeenLastCalledWith(false)
  await expect.element(page.getByRole('heading', { name: 'ISS-1' })).toBeInTheDocument()
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

  await expect.element(page.getByRole('heading', { name: 'ISS-1' })).toBeInTheDocument()
})
