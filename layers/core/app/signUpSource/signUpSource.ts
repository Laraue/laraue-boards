/**
 * Where a visitor came to Boards from (BRD-295), saved on the first page they open and sent with sign-in. The
 * backend (Laraue.Apps.Identity) normalizes and stores it; this only picks the raw value.
 */

export const signUpSourceStorageKey = 'laraue.signUpSource'

/** The invite page: a visitor who opened an invite link without a ref came by invitation. */
const invitePathPrefix = '/join/'

/** Referring sites with a short name of their own; any other site is sent as its host. */
const knownReferrers: ReadonlyArray<{ hosts: RegExp; source: string }> = [
  { hosts: /(^|\.)producthunt\.com$/, source: 'producthunt' },
  { hosts: /(^|\.)productradar\.ru$/, source: 'productradar' },
  { hosts: /(^|\.)(t\.me|telegram\.org|telegram\.me)$/, source: 'telegram' },
  { hosts: /(^|\.)google\.[a-z.]+$/, source: 'google' },
  { hosts: /(^|\.)yandex\.[a-z.]+$/, source: 'yandex' },
  { hosts: /(^|\.)habr\.com$/, source: 'habr' },
  { hosts: /(^|\.)spark\.ru$/, source: 'spark' },
  { hosts: /(^|\.)vc\.ru$/, source: 'vc' },
]

const fromReferrer = (referrer: string, ownHost: string): null | string => {
  let host: string
  try {
    host = new URL(referrer).hostname.toLowerCase()
  } catch {
    return null
  }
  if (!host || host === ownHost) {
    return null
  }
  return knownReferrers.find((x) => x.hosts.test(host))?.source ?? host
}

/**
 * The source of this visit: the link's `ref`, else its `utm_source`, else `invite` on the invite page, else the
 * referring site. Null for a direct visit or one from this site itself.
 */
export const detectSignUpSource = ({
  referrer,
  url,
}: {
  referrer: string
  url: URL
}): null | string => {
  const fromLink = url.searchParams.get('ref')?.trim() || url.searchParams.get('utm_source')?.trim()
  if (fromLink) {
    return fromLink
  }
  if (url.pathname.startsWith(invitePathPrefix)) {
    return 'invite'
  }
  return fromReferrer(referrer, url.hostname.toLowerCase())
}

type SignUpSourceStorage = Pick<Storage, 'getItem' | 'setItem'>

/** Keeps the first source a visitor came with: a later visit from elsewhere doesn't replace it. */
export const rememberSignUpSource = (storage: SignUpSourceStorage, source: null | string): void => {
  if (!source) {
    return
  }
  try {
    if (!storage.getItem(signUpSourceStorageKey)) {
      storage.setItem(signUpSourceStorageKey, source)
    }
  } catch {
    /* A blocked browser store just leaves the sign-up without a source. */
  }
}

export const readSignUpSource = (storage: Pick<Storage, 'getItem'>): null | string => {
  try {
    return storage.getItem(signUpSourceStorageKey)
  } catch {
    return null
  }
}

/**
 * The browser's local storage, reached only inside the calls: reading the `localStorage` global itself can throw
 * when the browser blocks site data, and the helpers above catch only inside their calls.
 */
export const browserSignUpSourceStorage: SignUpSourceStorage = {
  getItem: (key) => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
}

/** Saves this visit's source if the visitor has none yet. Called once by the root on mount. */
export const rememberBrowserSignUpSource = (): void =>
  rememberSignUpSource(
    browserSignUpSourceStorage,
    detectSignUpSource({ referrer: document.referrer, url: new URL(globalThis.location.href) }),
  )

/** The saved source, for sign-in requests. */
export const readBrowserSignUpSource = (): null | string =>
  readSignUpSource(browserSignUpSourceStorage)
