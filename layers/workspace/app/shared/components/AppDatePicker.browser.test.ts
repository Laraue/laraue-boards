import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { type Locale, useLocale } from '#layers/core/app/i18n/useI18n'

import AppDatePicker from './AppDatePicker.vue'

let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined
let previousLocale: Locale = 'en'

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  useLocale().value = previousLocale
})

it('opens the calendar with labels in the application language', async () => {
  previousLocale = useLocale().value
  useLocale().value = 'ru'
  // A workspace page: its language is the user's, while `/` would switch it to English.
  wrapper = await mountSuspended(AppDatePicker, {
    attachTo: document.body,
    props: { modelValue: '2026-10-13' },
    route: '/login',
  })

  await page.getByRole('button', { name: 'Открыть календарь' }).click()

  await expect.element(page.getByRole('button', { name: 'Выбрать месяц и год' })).toBeVisible()
  expect(document.querySelector('thead th')?.textContent?.trim()).toBe('П')
})
