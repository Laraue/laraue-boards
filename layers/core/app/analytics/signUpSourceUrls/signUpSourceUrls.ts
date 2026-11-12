export const signUpSourceUrlsStorageKey = 'laraue.signUpSourceUrls'

export type SignUpSourceUrls = {
  landingUrl: string
  referrer: null | string
}

const isSignUpSourceUrls = (value: unknown): value is SignUpSourceUrls => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { landingUrl, referrer } = value as Record<string, unknown>
  return typeof landingUrl === 'string' && (typeof referrer === 'string' || referrer === null)
}

export const readSignUpSourceUrls = (): null | SignUpSourceUrls => {
  try {
    const stored = localStorage.getItem(signUpSourceUrlsStorageKey)
    const parsed: unknown = stored ? JSON.parse(stored) : null
    return isSignUpSourceUrls(parsed) ? parsed : null
  } catch {
    return null
  }
}

// Called on mount: keep the first visit across pages and browser sessions (BRD-295).
export const rememberSignUpSourceUrls = (): void => {
  try {
    if (!localStorage.getItem(signUpSourceUrlsStorageKey)) {
      const signUpSourceUrls: SignUpSourceUrls = {
        landingUrl: globalThis.location.href,
        referrer: document.referrer || null,
      }
      localStorage.setItem(signUpSourceUrlsStorageKey, JSON.stringify(signUpSourceUrls))
    }
  } catch {
    // Unavailable storage leaves sign-in without first-visit data.
  }
}
