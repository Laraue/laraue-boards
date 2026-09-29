import type { LandingLocale, LandingMessageKey } from './LandingPage.messages'

import { landingMessages } from './LandingPage.messages'

export type LandingText = (
  key: LandingMessageKey,
  params?: Readonly<Record<string, number | string>>,
) => string

// The landing page is indexed per URL, so its language comes from the route (`/` is English, `/ru`
// is Russian) and never from the app's locale cookie.
export const useLandingText = (locale: LandingLocale): LandingText => {
  return (key, params) => {
    const message: string = landingMessages[locale][key]

    return params
      ? message.replaceAll(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match))
      : message
  }
}
