import type { Ref } from 'vue'

import type { Locale } from '~/composables/useI18n'
import { isLocale, useLocale } from '~/composables/useI18n'

export type Theme = 'dark' | 'light'

export type AppPreferences = {
  locale: Readonly<Ref<Locale>>
  setLocale: (value: Locale) => void
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
  const localeCookie = useCookie<string>('locale')
  const theme = useTheme()
  const themeCookie = useCookie<string>('theme')

  const setTheme = (value: Theme): void => {
    theme.value = value
    themeCookie.value = value
  }

  const setLocale = (value: Locale): void => {
    if (!isLocale(value)) {
      throw new Error(`Locale "${value}" is not registered`)
    }

    localeCookie.value = value

    if (import.meta.client) {
      globalThis.setTimeout(() => globalThis.location.reload())
    }
  }

  return { locale, setLocale, setTheme, theme }
}
