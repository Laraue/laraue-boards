import { assert, test } from 'vitest'

import { readSignUpOrigin, rememberSignUpOrigin, signUpOriginStorageKey } from './signUpOrigin'

const memoryStorage = () => {
  const items = new Map<string, string>()
  return {
    getItem: (key: string) => items.get(key) ?? null,
    items,
    setItem: (key: string, value: string) => void items.set(key, value),
  }
}

test('keeps the first visit as it was', () => {
  const storage = memoryStorage()

  rememberSignUpOrigin(storage, {
    landingUrl: 'https://boards.laraue.com/?ref=productradar',
    referrer: 'https://productradar.ru/',
  })
  rememberSignUpOrigin(storage, { landingUrl: 'https://boards.laraue.com/login', referrer: null })

  assert.deepEqual(readSignUpOrigin(storage), {
    landingUrl: 'https://boards.laraue.com/?ref=productradar',
    referrer: 'https://productradar.ru/',
  })
})

test('reads no origin from something else under its key', () => {
  const storage = memoryStorage()
  storage.items.set(signUpOriginStorageKey, 'producthunt')

  assert.isNull(readSignUpOrigin(storage))
})

test('reads no origin when the browser store is blocked', () => {
  const blocked = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  }

  rememberSignUpOrigin(blocked, { landingUrl: 'https://boards.laraue.com/', referrer: null })

  assert.isNull(readSignUpOrigin(blocked))
})
