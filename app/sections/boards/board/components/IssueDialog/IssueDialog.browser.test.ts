import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import type { IssuePageDeps } from '~/sections/issues/issue/IssuePage.deps'
import type {
  IssuePageSavedIssue,
  IssuePageViewModel,
} from '~/sections/issues/issue/IssuePage.types'

import IssueDialog from './IssueDialog.vue'

const issue: IssuePageViewModel = {
  assignee: 'Ada Lovelace',
  assigneeColor: '#4774d4',
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
  ownerColor: '#d65f63',
  ownerInitial: 'G',
  spaceId: '7',
  spaceLabel: 'Product',
  statusId: '3',
  statusLabel: 'To do',
  updatedAt: '2026-01-02T00:00:00Z',
}

const createDeps = (overrides: Partial<IssuePageDeps> = {}): IssuePageDeps => ({
  assigneeSelect: {
    loadAssignees: vi.fn<IssuePageDeps['assigneeSelect']['loadAssignees']>(),
  },
  boardSelect: {
    loadBoards: vi.fn<IssuePageDeps['boardSelect']['loadBoards']>(),
  },
  comments: {
    create: vi.fn<IssuePageDeps['comments']['create']>(),
    delete: vi.fn<IssuePageDeps['comments']['delete']>(),
    load: vi.fn<IssuePageDeps['comments']['load']>(),
    update: vi.fn<IssuePageDeps['comments']['update']>(),
  },
  deleteIssue: vi.fn<IssuePageDeps['deleteIssue']>(),
  saveIssue: vi.fn<IssuePageDeps['saveIssue']>(),
  spaceSelect: {
    loadSpaces: vi.fn<IssuePageDeps['spaceSelect']['loadSpaces']>(),
  },
  statusSelect: {
    loadStatuses: vi.fn<IssuePageDeps['statusSelect']['loadStatuses']>(),
  },
  view: vi.fn<IssuePageDeps['view']>(),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('lets the user close an unavailable issue dialog', async () => {
  const onClose = vi.fn<() => void>()
  const deps = createDeps({
    view: vi.fn<IssuePageDeps['view']>(async () => ({ code: 404, status: 'error' })),
  })

  currentWrapper = await mountSuspended(IssueDialog, {
    attachTo: document.body,
    props: {
      deps,
      issueKey: 'ISS-1',
      onClose,
      onDeleted: vi.fn<(issueKey: string) => void>(),
      onSaved: vi.fn<(issue: IssuePageSavedIssue) => void>(),
    },
    route: '/organizations/acme-ab12/spaces/product-AB12/12?issue=ISS-1',
  })

  await userEvent.keyboard('{Escape}')

  expect(onClose).toHaveBeenCalledOnce()
})

it('lets the user close the dialog while the issue is still loading', async () => {
  const onClose = vi.fn<() => void>()
  const deps = createDeps({
    view: vi.fn<IssuePageDeps['view']>(() => new Promise(() => {})),
  })

  currentWrapper = await mountSuspended(IssueDialog, {
    attachTo: document.body,
    props: {
      deps,
      issueKey: 'ISS-1',
      onClose,
      onDeleted: vi.fn<(issueKey: string) => void>(),
      onSaved: vi.fn<(issue: IssuePageSavedIssue) => void>(),
    },
    route: '/organizations/acme-ab12/spaces/product-AB12/12?issue=ISS-1',
  })

  await expect.element(page.getByLabelText('Loading issue')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Close dialog' }).click()

  expect(onClose).toHaveBeenCalledOnce()
})

it('notifies the board and stays open after the issue is saved', async () => {
  const onClose = vi.fn<() => void>()
  const onSaved = vi.fn<(issue: IssuePageSavedIssue) => void>()
  const deps = createDeps({
    saveIssue: vi.fn<IssuePageDeps['saveIssue']>(async () => ({
      data: {
        boardId: '12',
        complete: true,
        content: 'Document the reproduction steps',
        issueKey: 'ISS-1',
        previousBoardId: '12',
        previousStatusId: '3',
        statusId: '3',
      },
      status: 'success',
    })),
    view: vi.fn<IssuePageDeps['view']>(async () => ({ data: issue, status: 'success' })),
  })

  currentWrapper = await mountSuspended(IssueDialog, {
    attachTo: document.body,
    props: {
      deps,
      issueKey: 'ISS-1',
      onClose,
      onDeleted: vi.fn<(issueKey: string) => void>(),
      onSaved,
    },
    route: '/organizations/acme-ab12/spaces/product-AB12/12?issue=ISS-1',
  })

  await page.getByLabelText('Content').fill('Document the reproduction steps')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(onSaved).toHaveBeenCalledOnce()
  expect(onClose).not.toHaveBeenCalled()
  await expect.element(page.getByRole('dialog', { name: 'Issue details' })).toBeInTheDocument()
})
