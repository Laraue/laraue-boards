import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { ApiError } from '#infrastructure/api/request'

import type { IssueCommentsDeps } from './IssueComments.deps'
import type { IssueCommentViewModel } from './IssueComments.deps'
import IssueComments from './IssueComments.vue'

const comments: IssueCommentViewModel[] = [
  {
    attachments: [],
    canModify: true,
    createdAt: '2026-01-01T00:00:00Z',
    id: '12',
    owner: { color: '#111', initials: 'A', name: 'Ada Lovelace' },
    text: 'Initial comment',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

const createDeps = (overrides: Partial<IssueCommentsDeps> = {}): IssueCommentsDeps => ({
  create: vi.fn<IssueCommentsDeps['create']>(async () => {}),
  delete: vi.fn<IssueCommentsDeps['delete']>(async () => {}),
  load: vi.fn<IssueCommentsDeps['load']>(async () => comments),
  summarizeContent: vi.fn<IssueCommentsDeps['summarizeContent']>(async () => 'Improved content'),
  update: vi.fn<IssueCommentsDeps['update']>(async () => {}),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  vi.unstubAllGlobals()
})

const mount = async (deps = createDeps()) => {
  currentWrapper = await mountSuspended(IssueComments, {
    attachTo: document.body,
    props: { deps, issueKey: 'ISS-1' },
  })
  return currentWrapper
}

it('names the API key a comment was written through', async () => {
  await mount(
    createDeps({
      load: vi.fn<IssueCommentsDeps['load']>(async () => [
        { ...comments[0]!, owner: { ...comments[0]!.owner, apiKeyName: 'boards-agent' } },
      ]),
    }),
  )

  await expect.element(page.getByText('via boards-agent')).toBeInTheDocument()
})

it('creates a comment', async () => {
  const create = vi.fn<IssueCommentsDeps['create']>(async () => {})
  const load = vi.fn<IssueCommentsDeps['load']>(async () => comments)
  await mount(createDeps({ create, load }))

  await expect.element(page.getByRole('button', { name: 'Add comment' })).toBeDisabled()
  await page.getByLabelText('Write a comment').fill('New comment')
  await expect.element(page.getByRole('button', { name: 'Add comment' })).toBeEnabled()
  await page.getByRole('button', { name: 'Add comment' }).click()

  expect(create).toHaveBeenCalledWith({ files: [], issueKey: 'ISS-1', text: 'New comment' })
  expect(load).toHaveBeenCalledTimes(2)
})

const pasteFile = (target: Element, file: File) => {
  const clipboardData = new DataTransfer()
  clipboardData.items.add(file)
  const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData })
  target.dispatchEvent(event)
  return event
}

it('attaches a file pasted into the comment to the comment', async () => {
  const create = vi.fn<IssueCommentsDeps['create']>(async () => {})
  await mount(createDeps({ create }))
  const report = new File(['# Report'], 'report.md', { type: 'text/markdown' })

  await page.getByLabelText('Write a comment').fill('See the report')
  const event = pasteFile(page.getByLabelText('Write a comment').element(), report)
  await expect.element(page.getByText('report.md')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Add comment' }).click()

  // Taken by the comment: the issue's attachments skip a paste already handled.
  expect(event.defaultPrevented).toBe(true)
  expect(create).toHaveBeenCalledWith({
    files: [report],
    issueKey: 'ISS-1',
    text: 'See the report',
  })
  await expect.element(page.getByText('report.md')).not.toBeInTheDocument()
})

it('removes and adds attachments when editing a comment', async () => {
  const update = vi.fn<IssueCommentsDeps['update']>(async () => {})
  await mount(
    createDeps({
      load: vi.fn<IssueCommentsDeps['load']>(async () => [
        {
          ...comments[0]!,
          attachments: [
            {
              fileName: 'old.txt',
              fileSize: 10,
              id: 'old',
              kind: 'document',
              url: 'https://api.test/api/files/old',
            },
          ],
        },
      ]),
      update,
    }),
  )
  const config = new File(['{}'], 'config.json', { type: 'application/json' })

  await page.getByRole('button', { name: 'Actions for the comment by Ada Lovelace' }).click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()
  await page.getByRole('button', { name: 'Remove old.txt' }).click()
  pasteFile(page.getByLabelText('Edit comment by Ada Lovelace').element(), config)
  await expect.element(page.getByText('config.json')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Save' }).click()

  expect(update).toHaveBeenCalledWith({
    files: [config],
    id: '12',
    removeAttachmentIds: ['old'],
    text: 'Initial comment',
  })
})

it('keeps the text and shows a validation error when creating a comment fails', async () => {
  const create = vi
    .fn<IssueCommentsDeps['create']>()
    .mockRejectedValue(new ApiError(400, 'Comment is too long.'))
  await mount(createDeps({ create }))

  await page.getByLabelText('Write a comment').fill('New comment')
  await page.getByRole('button', { name: 'Add comment' }).click()

  await expect.element(page.getByRole('alert')).toHaveTextContent('Comment is too long.')
  await expect.element(page.getByLabelText('Write a comment')).toHaveTextContent('New comment')
})

it('edits and deletes a comment', async () => {
  const update = vi.fn<IssueCommentsDeps['update']>(async () => {})
  const remove = vi.fn<IssueCommentsDeps['delete']>(async () => {})
  vi.stubGlobal('confirm', () => true)
  await mount(createDeps({ delete: remove, update }))

  const actions = page.getByRole('button', { name: 'Actions for the comment by Ada Lovelace' })
  await actions.click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()
  await page.getByLabelText('Edit comment by Ada Lovelace').fill('Updated')
  await page.getByRole('button', { name: 'Save' }).click()
  await actions.click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()

  expect(update).toHaveBeenCalledWith({
    files: [],
    id: '12',
    removeAttachmentIds: [],
    text: 'Updated',
  })
  expect(remove).toHaveBeenCalledWith({ id: '12' })
})
