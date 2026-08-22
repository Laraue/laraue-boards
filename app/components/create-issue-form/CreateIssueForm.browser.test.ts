import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { CreateIssueFormDeps } from './CreateIssueForm.deps'
import CreateIssueForm from './CreateIssueForm.vue'

const createDeps = (): CreateIssueFormDeps => ({
  assigneeSelect: {
    loadAssignees: vi.fn<CreateIssueFormDeps['assigneeSelect']['loadAssignees']>(async () => ({
      data: [
        {
          color: '#4774d4',
          initials: 'AL',
          isCurrentUser: true,
          label: 'Ann Lee',
          value: '9',
        },
      ],
      status: 'success',
    })),
  },
  boardSelect: {
    loadBoards: vi.fn<CreateIssueFormDeps['boardSelect']['loadBoards']>(async () => ({
      data: [{ label: 'Sprint board', value: '12' }],
      status: 'success',
    })),
  },
  create: vi.fn<CreateIssueFormDeps['create']>(async () => ({
    data: { issueKey: 'ISS-1' },
    status: 'success',
  })),
  spaceSelect: {
    loadSpaces: vi.fn<CreateIssueFormDeps['spaceSelect']['loadSpaces']>(async () => ({
      data: [{ label: 'Product', value: '7' }],
      status: 'success',
    })),
  },
  statusSelect: {
    loadStatuses: vi.fn<CreateIssueFormDeps['statusSelect']['loadStatuses']>(async () => ({
      data: [{ label: 'To do', value: '1' }],
      status: 'success',
    })),
  },
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const chooseOption = async (label: string, option: string, value: string) => {
  const select = page.getByLabelText(label)
  await select.click()
  await expect.element(page.getByRole('option', { name: option })).toBeInTheDocument()
  await select.selectOptions(value)
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('lets the user choose a destination and create an issue from the issue list', async () => {
  const onCreated = vi.fn<(issueKey: string) => void>()
  const deps = createDeps()
  currentWrapper = await mountSuspended(CreateIssueForm, {
    attachTo: document.body,
    props: { attributes: [], deps, onCreated },
  })

  await page.getByRole('button', { name: 'Edit description' }).click()
  await page.getByLabelText('Content').fill('Fix the bug')
  await chooseOption('Space', 'Product', '7')
  await chooseOption('Board', 'Sprint board', '12')
  await expect.element(page.getByLabelText('Status')).toHaveValue('1')
  await expect.element(page.getByLabelText('Assignee')).toHaveValue('9')
  await page.getByRole('button', { name: 'Add issue' }).click()

  expect(deps.create).toHaveBeenCalledWith({
    assigneeId: '9',
    attributeValues: [],
    content: 'Fix the bug',
    files: [],
    statusId: '1',
  })
  expect(onCreated).toHaveBeenCalledWith('ISS-1')
})

it('creates an issue in a fixed board without showing destination selects', async () => {
  const onCreated = vi.fn<(issueKey: string) => void>()
  const deps = createDeps()
  deps.statusSelect.loadStatuses = vi.fn<CreateIssueFormDeps['statusSelect']['loadStatuses']>(
    async () => ({
      data: [
        { label: 'To do', value: '1' },
        { label: 'In progress', value: '2' },
      ],
      status: 'success',
    }),
  )
  currentWrapper = await mountSuspended(CreateIssueForm, {
    attachTo: document.body,
    props: {
      attributes: [],
      board: { id: '12', name: 'Sprint board', spaceKey: 'product' },
      deps,
      initialStatusId: '2',
      onCreated,
    },
  })

  await page.getByRole('button', { name: 'Edit description' }).click()
  await page.getByLabelText('Content').fill('Fix the bug')
  await expect.element(page.getByLabelText('Status')).toHaveValue('2')
  await expect.element(page.getByLabelText('Assignee')).toHaveValue('9')
  await page.getByRole('button', { name: 'Add issue' }).click()

  await expect.element(page.getByText('Sprint board')).toBeInTheDocument()
  await expect.element(page.getByLabelText('Space')).not.toBeInTheDocument()
  await expect.element(page.getByLabelText('Board')).not.toBeInTheDocument()
  expect(onCreated).toHaveBeenCalledWith('ISS-1')
})

it('keeps the form open and shows the message when creation fails', async () => {
  const onCreated = vi.fn<(issueKey: string) => void>()
  const deps = createDeps()
  deps.create = vi.fn<CreateIssueFormDeps['create']>(async () => ({
    message: 'This board no longer accepts issues.',
    status: 'validation-error',
  }))
  currentWrapper = await mountSuspended(CreateIssueForm, {
    attachTo: document.body,
    props: {
      attributes: [],
      board: { id: '12', name: 'Sprint board', spaceKey: 'product' },
      deps,
      onCreated,
    },
  })

  await page.getByRole('button', { name: 'Edit description' }).click()
  await page.getByLabelText('Content').fill('Fix the bug')
  await chooseOption('Status', 'To do', '1')
  await chooseOption('Assignee', 'Ann Lee', '9')
  await page.getByRole('button', { name: 'Add issue' }).click()

  await expect.element(page.getByText('This board no longer accepts issues.')).toBeInTheDocument()
  expect(onCreated).not.toHaveBeenCalled()
})
