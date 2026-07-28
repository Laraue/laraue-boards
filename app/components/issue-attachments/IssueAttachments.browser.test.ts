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
        { id: '1', originalUrl: 'https://example.com/original.png', previewUrl: '/preview.png' },
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
  await page.getByRole('button', { name: 'Close attachment preview' }).click()

  await expect
    .element(page.getByRole('dialog', { includeHidden: true, name: 'Attachment preview' }))
    .not.toHaveAttribute('open')
})

it('removes an existing attachment when requested', async () => {
  const onRemoveAttachment = await mount()

  await page.getByRole('button', { name: 'Remove attachment 1' }).click()

  expect(onRemoveAttachment).toHaveBeenCalledWith('1')
})
