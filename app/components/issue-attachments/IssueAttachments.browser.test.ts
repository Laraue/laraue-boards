import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import IssueAttachments from './IssueAttachments.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (onRemoveAttachment = vi.fn<(id: string) => void>()) => {
  currentWrapper = await mountSuspended(IssueAttachments, {
    attachTo: document.body,
    props: {
      attachments: [
        {
          id: '1',
          kind: 'image',
          originalUrl: 'https://example.com/original.png',
          previewUrl: '/preview.png',
        },
        {
          fileName: 'spec.pdf',
          fileSize: 2_500_000,
          id: '2',
          kind: 'document',
          url: 'https://example.com/spec.pdf',
        },
      ],
      disabled: false,
      files: [],
      onChange: vi.fn<(files: File[]) => void>(),
      onRemoveAttachment,
    },
  })
  return onRemoveAttachment
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('opens and closes a preview of an existing attachment', async () => {
  await mount()

  await page.getByRole('button', { name: 'Open attachment 1' }).click()
  await expect.element(page.getByRole('dialog', { name: 'Attachment preview' })).toBeVisible()
  await expect
    .element(page.getByRole('status', { name: 'Loading attachment preview' }))
    .toBeVisible()
  await page.getByRole('button', { name: 'Close attachment preview' }).click()

  await expect
    .element(page.getByRole('dialog', { name: 'Attachment preview' }))
    .not.toBeInTheDocument()
})

it('removes an existing attachment when requested', async () => {
  const onRemoveAttachment = await mount()

  await page.getByRole('button', { name: 'Remove attachment 1' }).click()

  expect(onRemoveAttachment).toHaveBeenCalledWith('1')
})

it('shows a document as a download with its name and size', async () => {
  await mount()

  const link = page.getByRole('link', { name: /spec\.pdf/ })
  await expect.element(link).toHaveAttribute('href', 'https://example.com/spec.pdf')
  await expect.element(link).toHaveAttribute('download')
  await expect.element(link).toHaveTextContent('2.5 MB')
})

it('removes an existing document when requested', async () => {
  const onRemoveAttachment = await mount()

  await page.getByRole('button', { name: 'Remove spec.pdf' }).click()

  expect(onRemoveAttachment).toHaveBeenCalledWith('2')
})
