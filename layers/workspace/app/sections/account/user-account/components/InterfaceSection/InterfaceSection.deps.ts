import type { Ref } from 'vue'

import type { Locale } from '#layers/core/app/i18n/useI18n'
import type { Theme } from '#layers/core/app/preferences/useAppPreferences'

export type InterfaceSectionDeps = {
  locale: Readonly<Ref<Locale>>
  setLocale: (value: Locale) => Promise<void>
  setTheme: (value: Theme) => void
  theme: Readonly<Ref<Theme>>
}
