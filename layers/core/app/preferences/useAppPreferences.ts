import type { Ref } from 'vue'

import { reloadNuxtApp, useCookie, useNuxtApp, useState } from '#app'
import type { Locale } from '#layers/core/app/i18n/useI18n'
import { isLocale, useLocale } from '#layers/core/app/i18n/useI18n'

export type Theme = 'dark' | 'light'

export type AppPreferences = {
  locale: Readonly<Ref<Locale>>
  setLocale: (value: Locale) => Promise<void>
  setTheme: (value: Theme) => void
  theme: Readonly<Ref<Theme>>
}

const isTheme = (value: unknown): value is Theme => value === 'dark' || value === 'light'

const useTheme = () => {
  const cookie = useCookie<string>('theme')

  return useState<Theme>('app-theme', () => (isTheme(cookie.value) ? cookie.value : 'light'))
}

export const useAppPreferences = (): AppPreferences => {
  const locale = useLocale()
  const { $i18n } = useNuxtApp()
  const theme = useTheme()
  const themeCookie = useCookie<string>('theme')

  const setTheme = (value: Theme): void => {
    theme.value = value
    themeCookie.value = value
  }

  const setLocale = async (value: Locale): Promise<void> => {
    if (!isLocale(value)) {
      throw new Error(`Locale "${value}" is not registered`)
    }

    await $i18n.setLocale(value)

    if (import.meta.client) {
      reloadNuxtApp({ force: true })
    }
  }

  return { locale, setLocale, setTheme, theme }
}
