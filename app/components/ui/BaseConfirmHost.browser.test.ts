import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineComponent, h } from 'vue'

import BaseConfirmHost from './BaseConfirmHost.vue'
import { useConfirm } from './composables/useConfirm'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined
const answers: boolean[] = []

const Harness = defineComponent({
  setup() {
    const confirm = useConfirm()
    const ask = async () => {
      answers.push(
        await confirm({
          danger: true,
          description: 'It cannot be undone.',
          title: 'Delete the board?',
        }),
      )
    }

    return () => [
      h(BaseConfirmHost, { cancelLabel: 'Cancel', dangerLabel: 'Delete' }),
      h('button', { onClick: ask, type: 'button' }, 'Ask'),
    ]
  },
})

beforeEach(() => {
  answers.length = 0
})

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  vi.restoreAllMocks()
})

it('opens on Cancel and answers yes when the action is chosen', async () => {
  currentWrapper = await mountSuspended(Harness, { attachTo: document.body })

  await page.getByRole('button', { name: 'Ask' }).click()
  const dialog = page.getByRole('alertdialog', { name: 'Delete the board?' })
  await expect.element(dialog).toBeVisible()
  await expect.element(dialog.getByText('It cannot be undone.')).toBeVisible()
  await expect.element(dialog.getByRole('button', { name: 'Cancel' })).toHaveFocus()

  await dialog.getByRole('button', { name: 'Delete' }).click()

  await expect.element(dialog).not.toBeInTheDocument()
  expect(answers).toEqual([true])
})

it('answers no on Cancel and on Escape', async () => {
  currentWrapper = await mountSuspended(Harness, { attachTo: document.body })
  const dialog = page.getByRole('alertdialog')

  await page.getByRole('button', { name: 'Ask' }).click()
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect.element(dialog).not.toBeInTheDocument()

  await page.getByRole('button', { name: 'Ask' }).click()
  await expect.element(dialog).toBeVisible()
  await userEvent.keyboard('{Escape}')
  await expect.element(dialog).not.toBeInTheDocument()

  expect(answers).toEqual([false, false])
})

it('falls back to window.confirm with the same text when no host is mounted', async () => {
  const nativeConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
  const confirm = useConfirm()

  await expect(
    confirm({ description: 'It cannot be undone.', title: 'Delete the board?' }),
  ).resolves.toBe(true)
  expect(nativeConfirm).toHaveBeenCalledWith('Delete the board? It cannot be undone.')
})
