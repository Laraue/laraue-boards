import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineComponent, h } from 'vue'

import BasePopover from './BasePopover.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('closes the popover when the user presses Escape', async () => {
  currentWrapper = await mountSuspended(BasePopover, {
    attachTo: document.body,
    slots: {
      default: () => h('button', { type: 'button' }, 'Popover content'),
      trigger: ({ toggle }: { toggle: () => void }) =>
        h('button', { onClick: toggle, type: 'button' }, 'Open popover'),
    },
  })

  await page.getByRole('button', { name: 'Open popover' }).click()
  await expect.element(page.getByText('Popover content')).toBeVisible()
  await page.getByText('Popover content').click()
  await userEvent.keyboard('{Escape}')

  await expect.element(page.getByText('Popover content')).not.toBeInTheDocument()
})

it('closes a sibling popover when another one opens', async () => {
  currentWrapper = await mountSuspended(
    defineComponent({
      setup: () => () =>
        h(
          'div',
          { style: { display: 'flex', gap: '1rem' } },
          ['First', 'Second'].map((name) =>
            h(
              BasePopover,
              {},
              {
                default: () => h('span', `${name} content`),
                trigger: ({ toggle }: { toggle: () => void }) =>
                  h('button', { onClick: toggle, type: 'button' }, name),
              },
            ),
          ),
        ),
    }),
    { attachTo: document.body },
  )

  await page.getByRole('button', { name: 'First' }).click()
  await expect.element(page.getByText('First content')).toBeVisible()
  await page.getByRole('button', { name: 'Second' }).click()
  await expect.element(page.getByText('First content')).not.toBeInTheDocument()
  await expect.element(page.getByText('Second content')).toBeVisible()
  await page.getByRole('button', { name: 'Second' }).click()
  await expect.element(page.getByText('Second content')).not.toBeInTheDocument()
})
