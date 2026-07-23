import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { h } from 'vue'

import AppPopover from './AppPopover.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('closes the popover when the user presses Escape', async () => {
  currentWrapper = await mountSuspended(AppPopover, {
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
