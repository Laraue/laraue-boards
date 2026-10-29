import { defineNuxtPlugin, useNuxtApp } from '#app'
import { isLocale } from '#layers/core/app/i18n/useI18n'

// URL selects the public language; unlocalized workspace pages restore the user's preference.
export default defineNuxtPlugin({
  hooks: {
    'i18n:beforeLocaleSwitch': (options) => {
      const { $i18n, $router } = useNuxtApp()
      if (options.initialSetup && $router.currentRoute.value.meta.i18n === false) {
        const preferred = $i18n.getLocaleCookie() ?? $i18n.getBrowserLocale()
        if (isLocale(preferred)) {
          options.newLocale = preferred
        }
      }
    },
  },
})
