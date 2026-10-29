import { computed } from 'vue'

import { useNuxtApp } from '#app'

import { createTranslator, isLocale } from './translator'
import type { Locale, TranslationMessages, TranslationSchema } from './translator'

export { isLocale, locales } from './translator'
export type { Locale } from './translator'

export const useLocale = () => {
  const current = useNuxtApp().$i18n.locale
  return computed<Locale>({
    get: () => (isLocale(current.value) ? current.value : 'en'),
    set: (value) => {
      current.value = value
    },
  })
}

export const useAvailableLocales = () => {
  const { $i18n } = useNuxtApp()
  const current = useLocale()
  return computed(() =>
    $i18n.locales.value.flatMap((option) => {
      const { code } = option
      return isLocale(code) && code !== current.value ? [{ ...option, code }] : []
    }),
  )
}

export const useI18n = <const Schema extends TranslationSchema>(
  messages: TranslationMessages<Schema>,
  localeOverride?: Locale,
) => {
  // An explicit language also allows pure consumers to use the wrapper without a Nuxt app.
  const current = localeOverride === undefined ? useLocale() : undefined
  const locale = computed<Locale>(() => localeOverride ?? current?.value ?? 'en')
  const translator = computed(() => createTranslator(messages, locale.value))
  type Key = Extract<keyof Schema, string>
  const t = (key: Key, params?: Readonly<Record<string, number | string>>) =>
    translator.value.t(key, params)
  const tp = (key: Key, count: number) => translator.value.tp(key, count)
  return { locale, t, tp }
}
