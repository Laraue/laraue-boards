import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineComponent, h } from 'vue'

import BaseButton from './BaseButton.vue'
import BaseMenu from './BaseMenu.vue'
import BaseMenuItem from './BaseMenuItem.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const mount = (onRename: () => void, onPin: () => void) =>
  mountSuspended(
    defineComponent({
      setup: () => () =>
        h(
          BaseMenu,
          {},
          {
            default: () => [
              h(BaseMenuItem, { onSelect: onRename }, () => 'Rename'),
              h(
                BaseMenuItem,
                {
                  onSelect: (event: Event) => {
                    event.preventDefault()
                    onPin()
                  },
                },
                () => 'Pin',
              ),
            ],
            trigger: () => h(BaseButton, null, () => 'Actions'),
          },
        ),
    }),
    { attachTo: document.body },
  )

it('moves between rows with the arrow keys and picks one with Enter', async () => {
  const onRename = vi.fn<() => void>()
  currentWrapper = await mount(onRename, vi.fn<() => void>())

  await page.getByRole('button', { name: 'Actions' }).click()
  // The menu takes its name from the trigger.
  const menu = page.getByRole('menu', { name: 'Actions' })
  await expect.element(menu).toBeVisible()

  await userEvent.keyboard('{ArrowDown}')
  await expect.element(menu.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()
  await userEvent.keyboard('{ArrowDown}')
  await expect.element(menu.getByRole('menuitem', { name: 'Pin' })).toHaveFocus()
  await userEvent.keyboard('{ArrowUp}{Enter}')

  expect(onRename).toHaveBeenCalledOnce()
  await expect.element(menu).not.toBeInTheDocument()
})

it('stays open when a row prevents the default of its select', async () => {
  const onPin = vi.fn<() => void>()
  currentWrapper = await mount(vi.fn<() => void>(), onPin)

  await page.getByRole('button', { name: 'Actions' }).click()
  await page.getByRole('menuitem', { name: 'Pin' }).click()

  expect(onPin).toHaveBeenCalledOnce()
  await expect.element(page.getByRole('menu')).toBeVisible()
})
