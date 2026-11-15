import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { ApiError } from '#infrastructure/api/request'
import type { IssueDetailsDeps } from '#layers/workspace/app/shared/components/IssueDetails/IssueDetails.deps'
import type {
  IssueDetailsSavedIssue,
  IssueDetailsViewModel,
} from '#layers/workspace/app/shared/components/IssueDetails/IssueDetails.deps'
import { createOrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

import IssueDialog from './IssueDialog.vue'

const issue: IssueDetailsViewModel = {
  agentHandOff: { available: true, blocker: null, canSendBack: false, missingStatusCategories: [] },
  agentRun: null,
  assignee: 'Ada Lovelace',
  assigneeColor: '#4774d4',
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
  createdVia: null,
  issueKey: 'ISS-1',
  links: [],
  owner: 'Grace Hopper',
  ownerColor: '#d65f63',
  ownerInitial: 'G',
  source: null,
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

const createDeps = (overrides: Partial<IssueDetailsDeps> = {}): IssueDetailsDeps => ({
  agentRun: {
    cancel: vi.fn<IssueDetailsDeps['agentRun']['cancel']>(async () => {}),
    handOff: vi.fn<IssueDetailsDeps['agentRun']['handOff']>(async () => {}),
    sendBack: vi.fn<IssueDetailsDeps['agentRun']['sendBack']>(async () => {}),
  },
  assigneeSelect: {
    loadAssignees: vi.fn<IssueDetailsDeps['assigneeSelect']['loadAssignees']>(),
  },
  boardSelect: {
    loadBoards: vi.fn<IssueDetailsDeps['boardSelect']['loadBoards']>(),
  },
  comments: {
    create: vi.fn<IssueDetailsDeps['comments']['create']>(),
    delete: vi.fn<IssueDetailsDeps['comments']['delete']>(),
    load: vi.fn<IssueDetailsDeps['comments']['load']>(async () => []),
    summarizeContent: vi.fn<IssueDetailsDeps['comments']['summarizeContent']>(),
    update: vi.fn<IssueDetailsDeps['comments']['update']>(),
  },
  deleteIssue: vi.fn<IssueDetailsDeps['deleteIssue']>(),
  description: {
    summarizeContent: vi.fn<IssueDetailsDeps['description']['summarizeContent']>(),
  },
  history: {
    load: vi.fn<IssueDetailsDeps['history']['load']>(),
  },
  links: {
    add: vi.fn<IssueDetailsDeps['links']['add']>(async () => ({ outcome: 'added' as const })),
    remove: vi.fn<IssueDetailsDeps['links']['remove']>(async () => {}),
    searchIssues: vi.fn<IssueDetailsDeps['links']['searchIssues']>(async () => ({
      issues: [],
      outcome: 'found' as const,
    })),
  },
  saveIssue: vi.fn<IssueDetailsDeps['saveIssue']>(),
  spaceSelect: {
    loadSpaces: vi.fn<IssueDetailsDeps['spaceSelect']['loadSpaces']>(),
  },
  statusSelect: {
    loadStatuses: vi.fn<IssueDetailsDeps['statusSelect']['loadStatuses']>(),
  },
  view: vi.fn<IssueDetailsDeps['view']>(async () => issue),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  vi.restoreAllMocks()
})

it('lets the user close an unavailable issue dialog', async () => {
  const onClose = vi.fn<() => void>()
  const deps = createDeps({
    view: vi.fn<IssueDetailsDeps['view']>().mockRejectedValue(new ApiError(404)),
  })

  currentWrapper = await mountSuspended(IssueDialog, {
    attachTo: document.body,
    props: {
      deps,
      issueKey: 'ISS-1',
      onClose,
      onDeleted: vi.fn<(issueKey: string) => void>(),
      onDirtyChange: vi.fn<(dirty: boolean) => void>(),
      onSaved: vi.fn<(issue: IssueDetailsSavedIssue) => void>(),
      organizationRoutes: createOrganizationRoutes('acme-ab12'),
    },
    route: '/organizations/acme-ab12/spaces/product-AB12/12?issue=ISS-1',
  })

  await userEvent.keyboard('{Escape}')

  expect(onClose).toHaveBeenCalledOnce()
})

it('lets the user close the dialog while the issue is still loading', async () => {
  const onClose = vi.fn<() => void>()
  const deps = createDeps({
    view: vi.fn<IssueDetailsDeps['view']>(() => new Promise(() => {})),
  })

  currentWrapper = await mountSuspended(IssueDialog, {
    attachTo: document.body,
    props: {
      deps,
      issueKey: 'ISS-1',
      onClose,
      onDeleted: vi.fn<(issueKey: string) => void>(),
      onDirtyChange: vi.fn<(dirty: boolean) => void>(),
      onSaved: vi.fn<(issue: IssueDetailsSavedIssue) => void>(),
      organizationRoutes: createOrganizationRoutes('acme-ab12'),
    },
    route: '/organizations/acme-ab12/spaces/product-AB12/12?issue=ISS-1',
  })

  await expect.element(page.getByLabelText('Loading issue')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Close dialog' }).click()

  expect(onClose).toHaveBeenCalledOnce()
})

it('warns before the close button closes a dirty issue', async () => {
  const onClose = vi.fn<() => void>()
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)

  currentWrapper = await mountSuspended(IssueDialog, {
    attachTo: document.body,
    props: {
      deps: createDeps(),
      issueKey: 'ISS-1',
      onClose,
      onDeleted: vi.fn<(issueKey: string) => void>(),
      onDirtyChange: vi.fn<(dirty: boolean) => void>(),
      onSaved: vi.fn<(issue: IssueDetailsSavedIssue) => void>(),
      organizationRoutes: createOrganizationRoutes('acme-ab12'),
    },
    route: '/organizations/acme-ab12/spaces/product-AB12/12?issue=ISS-1',
  })

  await page.getByLabelText('Content').fill('Changed description')
  await page.getByRole('button', { name: 'Close dialog' }).click()

  expect(confirm).toHaveBeenCalledOnce()
  expect(onClose).not.toHaveBeenCalled()
})

it('notifies the board and stays open after the issue is saved', async () => {
  const onClose = vi.fn<() => void>()
  const onSaved = vi.fn<(issue: IssueDetailsSavedIssue) => void>()
  const deps = createDeps({
    saveIssue: vi.fn<IssueDetailsDeps['saveIssue']>(async () => ({
      boardId: '12',
      complete: true,
      content: 'Document the reproduction steps',
      issueKey: 'ISS-1',
      previousBoardId: '12',
      previousIssueKey: 'ISS-1',
      previousStatusId: '3',
      spaceKey: 'product-AB12',
      statusId: '3',
      title: 'Fix the bug',
    })),
    view: vi.fn<IssueDetailsDeps['view']>(async () => issue),
  })

  currentWrapper = await mountSuspended(IssueDialog, {
    attachTo: document.body,
    props: {
      deps,
      issueKey: 'ISS-1',
      onClose,
      onDeleted: vi.fn<(issueKey: string) => void>(),
      onDirtyChange: vi.fn<(dirty: boolean) => void>(),
      onSaved,
      organizationRoutes: createOrganizationRoutes('acme-ab12'),
    },
    route: '/organizations/acme-ab12/spaces/product-AB12/12?issue=ISS-1',
  })

  await page.getByLabelText('Content').fill('Document the reproduction steps')
  await page.getByRole('button', { exact: true, name: 'Save' }).click()

  expect(onSaved).toHaveBeenCalledOnce()
  expect(onClose).not.toHaveBeenCalled()
  await expect.element(page.getByRole('dialog', { name: 'Issue details' })).toBeInTheDocument()
})
