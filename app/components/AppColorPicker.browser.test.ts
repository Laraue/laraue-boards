import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import AppColorPicker from './AppColorPicker.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('returns the color picked by the user and closes the palette', async () => {
  const onUpdate = vi.fn<(color: string) => void>()
  currentWrapper = await mountSuspended(AppColorPicker, {
    attachTo: document.body,
    props: { modelValue: '#4774d4', 'onUpdate:modelValue': onUpdate },
  })

  await page.getByRole('button', { name: 'Blue' }).click()
  await page.getByRole('option', { name: 'Red' }).click()

  expect(onUpdate).toHaveBeenCalledWith('#d65f63')
  await expect.element(page.getByRole('listbox')).not.toBeInTheDocument()
})
