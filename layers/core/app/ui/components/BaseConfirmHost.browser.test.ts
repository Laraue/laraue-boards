import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineComponent, h, onBeforeUnmount } from 'vue'

import { createConfirmation } from '../feedback/createConfirmation'
import BaseConfirmHost from './BaseConfirmHost.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined
const answers: boolean[] = []

const Harness = defineComponent({
  setup() {
    const service = createConfirmation()
    const confirm = service.ask
    onBeforeUnmount(() => service.answer(false))
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
      h(BaseConfirmHost, {
        answer: service.answer,
        cancelLabel: 'Cancel',
        dangerLabel: 'Delete',
        request: service.pending.value,
      }),
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
