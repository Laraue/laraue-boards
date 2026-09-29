import { consentStorageKey, decideConsent, detectCountryCode } from '~/utils/consent'

export default defineNuxtPlugin(() => {
  const state = useConsent()
  const { gtag, initialize } = useGtag()

  // Not awaited, so the app starts at once: the banner appears (or analytics starts) when Cloudflare
  // has told us the country.
  void detectCountryCode().then((countryCode) => {
    const decision = decideConsent(countryCode, localStorage.getItem(consentStorageKey))
    state.value = { ...decision, resolved: true }

    if (decision.consent === 'granted') {
      gtag('consent', 'update', { analytics_storage: 'granted' })
      // The Google tag script is only added now, when analytics is allowed.
      initialize()
    }
  })
})
