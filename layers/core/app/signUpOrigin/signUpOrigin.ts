/**
 * Where a visitor came to Boards from (BRD-295): the first page they opened on the site and the site that sent them
 * there, saved as is and sent with sign-in. The backend works out the source from them - this knows no sources or
 * sites.
 */

export const signUpOriginStorageKey = 'laraue.signUpOrigin'

export type SignUpOrigin = {
  landingUrl: string
  referrer: null | string
}

type SignUpOriginStorage = Pick<Storage, 'getItem' | 'setItem'>

/** Keeps the first visit: a later one, from wherever, doesn't replace it. */
export const rememberSignUpOrigin = (storage: SignUpOriginStorage, origin: SignUpOrigin): void => {
  try {
    if (!storage.getItem(signUpOriginStorageKey)) {
      storage.setItem(signUpOriginStorageKey, JSON.stringify(origin))
    }
  } catch {
    /* A blocked browser store just leaves the sign-up without an origin. */
  }
}

const isSignUpOrigin = (value: unknown): value is SignUpOrigin => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { landingUrl, referrer } = value as Record<string, unknown>
  return typeof landingUrl === 'string' && (typeof referrer === 'string' || referrer === null)
}

export const readSignUpOrigin = (storage: Pick<Storage, 'getItem'>): null | SignUpOrigin => {
  try {
    const stored = storage.getItem(signUpOriginStorageKey)
    const parsed: unknown = stored ? JSON.parse(stored) : null
    return isSignUpOrigin(parsed) ? parsed : null
  } catch {
    return null
  }
}

/**
 * The browser's local storage, reached only inside the calls: reading the `localStorage` global itself can throw when
 * the browser blocks site data, and the helpers above catch only inside their calls.
 */
export const browserSignUpOriginStorage: SignUpOriginStorage = {
  getItem: (key) => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
}

/** Saves this visit as the origin if the visitor has none yet. Called once by the root on mount. */
export const rememberBrowserSignUpOrigin = (): void =>
  rememberSignUpOrigin(browserSignUpOriginStorage, {
    landingUrl: globalThis.location.href,
    referrer: document.referrer || null,
  })

/** The saved origin, for sign-in requests. */
export const readBrowserSignUpOrigin = (): null | SignUpOrigin =>
  readSignUpOrigin(browserSignUpOriginStorage)
