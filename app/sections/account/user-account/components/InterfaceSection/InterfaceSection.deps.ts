import type { Ref } from 'vue'

import type { Theme } from '~/composables/useAppPreferences'
import type { Locale } from '~/composables/useI18n'

export type InterfaceSectionDeps = {
  locale: Readonly<Ref<Locale>>
  setLocale: (value: Locale) => void
  setTheme: (value: Theme) => void
  theme: Readonly<Ref<Theme>>
}
