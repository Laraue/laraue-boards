import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, test, vi } from 'vitest'
import { page } from 'vitest/browser'
import { nextTick } from 'vue'

import type { ConsentChoice } from '#layers/core/app/analytics/consent/decision'
import { useLocale } from '#layers/core/app/i18n/useI18n'

import CookieConsent from './CookieConsent.vue'

let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  useLocale().value = 'en'
})

test('names and describes the consent dialog in the current language and reports the choice', async () => {
  const onChoice = vi.fn<(choice: ConsentChoice) => void>()
  wrapper = await mountSuspended(CookieConsent, {
    attachTo: document.body,
    props: { onChoice },
    route: '/',
  })
  const dialog = page.getByRole('dialog', { name: 'Analytics cookies' })
  await expect.element(dialog).toHaveAccessibleDescription(/We use cookies for analytics/)

  useLocale().value = 'ru'
  await nextTick()
  const russianDialog = page.getByRole('dialog', { name: 'Файлы cookie для аналитики' })
  await expect.element(russianDialog).toHaveAccessibleDescription(/Мы используем файлы cookie/)
  await russianDialog.getByRole('button', { name: 'Отклонить' }).click()
  expect(onChoice).toHaveBeenCalledWith('denied')
})
