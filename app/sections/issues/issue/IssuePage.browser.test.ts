import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import type { IssuePageDeps } from './IssuePage.deps'
import type { IssuePageViewModel } from './IssuePage.types'
import IssuePage from './IssuePage.vue'

const issue: IssuePageViewModel = {
  assignee: 'Ada Lovelace',
  assigneeColor: '#111',
  assigneeId: '9',
  assigneeInitial: 'A',
  attachments: [],
  attributes: [],
  boardId: '12',
  boardLabel: 'Sprint board',
  canEdit: true,
  comments: [],
  content: 'Fix the bug',
  createdAt: '2026-01-01T00:00:00Z',
  issueKey: 'ISS-1',
  owner: 'Grace Hopper',
  ownerColor: '#222',
  ownerInitial: 'G',
  spaceId: '7',
  spaceLabel: 'Product',
  statusId: '3',
  statusLabel: 'To do',
  updatedAt: '2026-01-02T00:00:00Z',
}

const createDeps = (overrides: Partial<IssuePageDeps> = {}): IssuePageDeps => ({
  assigneeSelect: {
    loadAssignees: vi.fn<IssuePageDeps['assigneeSelect']['loadAssignees']>(async () => ({
      data: [{ color: '#111', initials: 'A', label: 'Ada Lovelace', value: '9' }],
      status: 'success',
    })),
  },
  boardSelect: {
    loadBoards: vi.fn<IssuePageDeps['boardSelect']['loadBoards']>(async () => ({
      data: [{ label: 'Sprint board', value: '12' }],
      status: 'success',
    })),
  },
  comments: {
    create: vi.fn<IssuePageDeps['comments']['create']>(),
    delete: vi.fn<IssuePageDeps['comments']['delete']>(),
    load: vi.fn<IssuePageDeps['comments']['load']>(),
    update: vi.fn<IssuePageDeps['comments']['update']>(),
  },
  deleteIssue: vi.fn<IssuePageDeps['deleteIssue']>(async () => ({
    data: true,
    status: 'success',
  })),
  history: {
    load: vi.fn<IssuePageDeps['history']['load']>(async () => ({
      data: { hasNextPage: false, items: [] },
      status: 'success',
    })),
  },
  saveIssue: vi.fn<IssuePageDeps['saveIssue']>(),
  spaceSelect: {
    loadSpaces: vi.fn<IssuePageDeps['spaceSelect']['loadSpaces']>(async () => ({
      data: [{ label: 'Product', value: '7' }],
      status: 'success',
    })),
  },
  statusSelect: {
    loadStatuses: vi.fn<IssuePageDeps['statusSelect']['loadStatuses']>(async () => ({
      data: [{ label: 'To do', value: '3' }],
      status: 'success',
    })),
  },
  view: vi.fn<IssuePageDeps['view']>(async () => ({ data: issue, status: 'success' })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: IssuePageDeps,
  onBack: () => Promise<void> | void = vi.fn<() => void>(),
) => {
  currentWrapper = await mountSuspended(IssuePage, {
    attachTo: document.body,
    props: { deps, issueKey: 'ISS-1', onBack },
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
      view: vi.fn<IssuePageDeps['view']>(async () => ({ data: issue, status: 'success' })),
    }),
  )

  await expect.element(page.getByRole('heading', { name: 'ISS-1' })).toBeInTheDocument()
})

it('previews markdown content', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({
        data: { ...issue, content: '# Steps\n\nUse **preview**.' },
        status: 'success',
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
  await userEvent.keyboard('{Control>}z{/Control}')
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
  const create = vi.fn<IssuePageDeps['comments']['create']>(async () => ({
    data: true,
    status: 'success',
  }))
  const load = vi.fn<IssuePageDeps['comments']['load']>(async () => ({
    data: [comment],
    status: 'success',
  }))
  const view = vi.fn<IssuePageDeps['view']>(async () => ({ data: issue, status: 'success' }))

  await mount(
    createDeps({
      comments: {
        create,
        delete: vi.fn<IssuePageDeps['comments']['delete']>(),
        load,
        update: vi.fn<IssuePageDeps['comments']['update']>(),
      },
      view,
    }),
  )

  expect(load).not.toHaveBeenCalled()
  await page.getByLabelText('Write a comment').fill('New comment')
  await page.getByRole('button', { name: 'Add comment' }).click()

  await expect.element(page.getByText('New comment')).toBeInTheDocument()
  expect(load).toHaveBeenCalledWith({ issueKey: 'ISS-1' })
  expect(view).toHaveBeenCalledOnce()
})

it('loads history only when its tab is opened', async () => {
  const loadHistory = vi.fn<IssuePageDeps['history']['load']>(async () => ({
    data: {
      hasNextPage: false,
      items: [
        {
          changes: [
            {
              kind: 'status',
              label: 'Status changed',
              newColor: null,
              newValue: 'Done',
              oldColor: null,
              oldValue: 'To do',
            },
            {
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
              label: 'Description changed',
            },
          ],
          createdAt: '2026-01-03T00:00:00Z',
          owner: { color: '#111', initials: 'A', name: 'Ada Lovelace' },
        },
      ],
    },
    status: 'success',
  }))

  await mount(createDeps({ history: { load: loadHistory } }))

  expect(loadHistory).not.toHaveBeenCalled()
  await expect.element(page.getByLabelText('Write a comment')).toBeInTheDocument()
  await page.getByRole('tab', { name: 'History' }).click()

  expect(loadHistory).toHaveBeenCalledWith({ issueKey: 'ISS-1', page: 0 })
  await expect.element(page.getByText('Status changed')).toBeInTheDocument()
  await expect.element(page.getByText('Done')).toBeInTheDocument()
  await page.getByText('Description changed').click()
  await expect
    .element(page.getByLabelText('Description changes split view'))
    .toHaveTextContent('List Item 3')
  await expect
    .element(page.getByLabelText('Description changes split view'))
    .toHaveTextContent('List Item 4')
  await expect.element(page.getByRole('button', { name: 'Unified' })).not.toBeInTheDocument()
})

it('leaves the page when back is pressed', async () => {
  const onBack = vi.fn<() => Promise<void>>(() => new Promise(() => {}))

  await mount(createDeps(), onBack)

  await page.getByRole('button', { name: 'Back' }).click()

  expect(onBack).toHaveBeenCalledTimes(1)
  await expect.element(page.getByRole('heading', { name: 'ISS-1' })).toBeInTheDocument()
})

it('stays on the page after the issue is saved', async () => {
  const onBack = vi.fn<() => void>()
  const view = vi
    .fn<IssuePageDeps['view']>()
    .mockResolvedValueOnce({ data: issue, status: 'success' })
    .mockImplementation(() => new Promise(() => {}))
  await mount(
    createDeps({
      saveIssue: vi.fn<IssuePageDeps['saveIssue']>(async () => ({
        data: {
          boardId: '12',
          complete: true,
          content: 'Document the reproduction steps',
          issueKey: 'ISS-1',
          previousBoardId: '12',
          previousIssueKey: 'ISS-1',
          previousStatusId: '3',
          spaceKey: '7',
          statusId: '3',
        },
        status: 'success',
      })),
      view,
    }),
    onBack,
  )

  await page.getByRole('button', { name: 'Edit description' }).click()
  await page.getByLabelText('Content').fill('Document the reproduction steps')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(onBack).not.toHaveBeenCalled()
  await expect.element(page.getByRole('heading', { name: 'ISS-1' })).toBeInTheDocument()
})

it('hides the actions when the issue cannot be edited', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({
        data: { ...issue, canEdit: false },
        status: 'success',
      })),
    }),
  )

  await expect.element(page.getByRole('button', { name: 'Save changes' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Delete issue' })).not.toBeInTheDocument()
})

it('reloads the issue when the failed request is retried', async () => {
  const view = vi
    .fn<IssuePageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: issue, status: 'success' })

  await mount(createDeps({ view }))

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByRole('heading', { name: 'ISS-1' })).toBeInTheDocument()
})
