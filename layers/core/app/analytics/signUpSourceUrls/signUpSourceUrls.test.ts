import { afterEach, assert, beforeEach, test, vi } from 'vitest'

import {
  readSignUpSourceUrls,
  rememberSignUpSourceUrls,
  signUpSourceUrlsStorageKey,
} from './signUpSourceUrls'

beforeEach(() => {
  const items = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  })
  vi.stubGlobal('location', { href: 'https://boards.laraue.com/?ref=productradar' })
  vi.stubGlobal('document', { referrer: 'https://productradar.ru/' })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

test('keeps the first visit as it was', () => {
  rememberSignUpSourceUrls()
  vi.stubGlobal('location', { href: 'https://boards.laraue.com/login' })
  vi.stubGlobal('document', { referrer: '' })
  rememberSignUpSourceUrls()

  assert.deepEqual(readSignUpSourceUrls(), {
    landingUrl: 'https://boards.laraue.com/?ref=productradar',
    referrer: 'https://productradar.ru/',
  })
})

test('reads the stored first visit on each call', () => {
  assert.isNull(readSignUpSourceUrls())
  const signUpSourceUrls = { landingUrl: 'https://boards.laraue.com/', referrer: null }
  localStorage.setItem(signUpSourceUrlsStorageKey, JSON.stringify(signUpSourceUrls))

  assert.deepEqual(readSignUpSourceUrls(), signUpSourceUrls)
})

test('saves no referrer when the browser reports none', () => {
  vi.stubGlobal('document', { referrer: '' })

  rememberSignUpSourceUrls()

  assert.deepEqual(readSignUpSourceUrls(), { landingUrl: location.href, referrer: null })
})

test.each(['producthunt', '{}', '{"landingUrl":7,"referrer":null}'])(
  'ignores invalid saved data: %s',
  (stored) => {
    localStorage.setItem(signUpSourceUrlsStorageKey, stored)

    assert.isNull(readSignUpSourceUrls())
  },
)

test('keeps sign-in available when browser storage is blocked', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new Error('blocked')
    },
  })

  rememberSignUpSourceUrls()

  assert.isNull(readSignUpSourceUrls())
})

test('keeps sign-in available when saving fails', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {
      throw new Error('blocked')
    },
  })

  rememberSignUpSourceUrls()

  assert.isNull(readSignUpSourceUrls())
})
