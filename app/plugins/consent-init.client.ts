import { consentStorageKey, decideConsent, detectCountryCode, isConsentPage } from '~/utils/consent'

export default defineNuxtPlugin(() => {
  const state = useConsent()
  const route = useRoute()
  const { gtag, initialize } = useGtag()
  let initialized = false

  // Analytics runs on the public content pages, for a visitor who allows it (or does not need to be
  // asked). Once the Google tag is on the page it cannot be removed, so it is switched off again
  // when the visitor moves to the app, and back on when they return to a content page.
  const apply = (): void => {
    const allowed = state.value.consent === 'granted' && isConsentPage(route.path)
    if (allowed) {
      gtag('consent', 'update', { analytics_storage: 'granted' })
      if (!initialized) {
        // The Google tag script is only added now, when analytics is allowed.
        initialize()
        initialized = true
      }
    } else if (initialized) {
      gtag('consent', 'update', { analytics_storage: 'denied' })
    }
  }

  // Not awaited, so the app starts at once: the banner appears (or analytics starts) when Cloudflare
  // has told us the country.
  void detectCountryCode().then((countryCode) => {
    state.value = {
      ...decideConsent(countryCode, localStorage.getItem(consentStorageKey)),
      resolved: true,
    }
  })

  watch(() => [state.value.consent, route.path], apply)
})
