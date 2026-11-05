import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineComponent, h } from 'vue'

import BaseButton from './BaseButton.vue'
import BaseMenu from './BaseMenu.vue'
import BaseMenuItem from './BaseMenuItem.vue'
import BasePopover from './BasePopover.vue'
import BaseSelect from './BaseSelect.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const select = () =>
  h(BaseSelect, {
    'aria-label': 'Assignee',
    modelValue: 'ada',
    options: [{ label: 'Ada', value: 'ada' }],
  })

it('switches between a sibling menu and select with one click', async () => {
  currentWrapper = await mountSuspended(
    defineComponent({
      setup: () => () =>
        h('div', { style: { display: 'flex', gap: '1rem' } }, [
          h(
            BaseMenu,
            {},
            {
              default: () => h(BaseMenuItem, {}, () => 'Rename'),
              trigger: () => h(BaseButton, {}, () => 'Actions'),
            },
          ),
          select(),
        ]),
    }),
    { attachTo: document.body },
  )

  const actions = page.getByRole('button', { name: 'Actions' }).element()
  await userEvent.click(actions)
  await expect.element(page.getByRole('menu')).toBeVisible()
  await page.getByRole('combobox', { name: 'Assignee' }).click()
  await expect.element(page.getByRole('menu')).not.toBeInTheDocument()
  await expect.element(page.getByRole('listbox')).toBeVisible()
  await userEvent.click(actions)
  await expect.element(page.getByRole('listbox')).not.toBeInTheDocument()
  await expect.element(page.getByRole('menu')).toBeVisible()
})

it('keeps a parent popover open while using a nested select', async () => {
  currentWrapper = await mountSuspended(BasePopover, {
    attachTo: document.body,
    slots: {
      default: select,
      trigger: ({ toggle }: { toggle: () => void }) =>
        h(BaseButton, { onClick: toggle }, () => 'Filters'),
    },
  })

  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByRole('combobox', { name: 'Assignee' }).click()
  await expect.element(currentWrapper.get('.base-popover-content').element).toBeVisible()
  await page.getByRole('option', { name: 'Ada' }).click()
  await expect.element(page.getByRole('listbox')).not.toBeInTheDocument()
  await expect.element(page.getByRole('dialog')).toBeVisible()
  await userEvent.keyboard('{Escape}')
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
})
