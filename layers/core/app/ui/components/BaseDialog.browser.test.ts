import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { defineComponent, h, ref } from 'vue'

import BaseButton from './BaseButton.vue'
import BaseDialog from './BaseDialog.vue'
import BaseInput from './BaseInput.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const mount = (options: {
  autofocusCancel?: boolean
  description?: string
  onClose?: () => void
  onSubmit?: () => void
}) => {
  const Harness = defineComponent({
    setup() {
      const dialog = ref<InstanceType<typeof BaseDialog>>()
      const name = ref('Roadmap')

      return () => [
        h('button', { onClick: () => dialog.value?.open(), type: 'button' }, 'Open'),
        h(
          BaseDialog,
          {
            closeLabel: 'Close',
            description: options.description,
            onClose: options.onClose,
            onSubmit: options.onSubmit,
            ref: dialog,
            title: 'Rename the board',
          },
          {
            actions: () => [
              h(
                BaseButton,
                {
                  autofocus: options.autofocusCancel || undefined,
                  onClick: () => dialog.value?.close(),
                },
                () => 'Cancel',
              ),
              h(BaseButton, { type: 'submit', variant: 'primary' }, () => 'Rename'),
            ],
            default: () => [
              h('label', { for: 'board-name' }, 'Name'),
              h(BaseInput, {
                id: 'board-name',
                modelValue: name.value,
                'onUpdate:modelValue': (value: string) => {
                  name.value = value
                },
              }),
            ],
          },
        ),
      ]
    },
  })

  return mountSuspended(Harness, { attachTo: document.body })
}

it('focuses the first field on opening, not the close button', async () => {
  currentWrapper = await mount({})

  await page.getByRole('button', { name: 'Open' }).click()

  const dialog = page.getByRole('dialog', { name: 'Rename the board' })
  await expect.element(dialog).toBeVisible()
  await expect.element(dialog).not.toHaveAttribute('aria-describedby')
  await expect.element(dialog.getByLabelText('Name')).toHaveFocus()
})

it('connects an optional description to the dialog for assistive technology', async () => {
  currentWrapper = await mount({ description: 'The board name is visible to every member.' })
  await page.getByRole('button', { name: 'Open' }).click()
  await expect
    .element(page.getByRole('dialog'))
    .toHaveAccessibleDescription('The board name is visible to every member.')
})

it('focuses the element marked autofocus instead of the first field', async () => {
  currentWrapper = await mount({ autofocusCancel: true })

  await page.getByRole('button', { name: 'Open' }).click()

  await expect.element(page.getByRole('button', { name: 'Cancel' })).toHaveFocus()
})

it('closes from the close button and reports it', async () => {
  const onClose = vi.fn<() => void>()
  currentWrapper = await mount({ onClose })

  await page.getByRole('button', { name: 'Open' }).click()
  await page.getByRole('button', { name: 'Close' }).click()

  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
  expect(onClose).toHaveBeenCalledOnce()
})

it('emits submit from the submit button', async () => {
  const onSubmit = vi.fn<() => void>()
  currentWrapper = await mount({ onSubmit })

  await page.getByRole('button', { name: 'Open' }).click()
  await page.getByRole('button', { name: 'Rename' }).click()

  expect(onSubmit).toHaveBeenCalledOnce()
})
