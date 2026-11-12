import { assert, test } from 'vitest'

import {
  detectSignUpSource,
  readSignUpSource,
  rememberSignUpSource,
  signUpSourceStorageKey,
} from './signUpSource'

const detect = (url: string, referrer = '') => detectSignUpSource({ referrer, url: new URL(url) })

const memoryStorage = () => {
  const items = new Map<string, string>()
  return {
    getItem: (key: string) => items.get(key) ?? null,
    items,
    setItem: (key: string, value: string) => void items.set(key, value),
  }
}

test('takes the ref of the link first', () => {
  assert.equal(
    detect('https://boards.laraue.com/?ref=producthunt&utm_source=newsletter', 'https://t.me/'),
    'producthunt',
  )
})

test('takes utm_source when the link has no ref', () => {
  assert.equal(detect('https://boards.laraue.com/ru?utm_source=newsletter'), 'newsletter')
})

test('marks an invite link without a ref as invite', () => {
  assert.equal(detect('https://boards.laraue.com/join/abc123', 'https://t.me/'), 'invite')
  assert.equal(detect('https://boards.laraue.com/join/abc123?ref=habr'), 'habr')
})

test('names a known referring site', () => {
  assert.equal(
    detect('https://boards.laraue.com/', 'https://www.producthunt.com/posts/boards'),
    'producthunt',
  )
  assert.equal(detect('https://boards.laraue.com/', 'https://www.google.de/'), 'google')
  assert.equal(detect('https://boards.laraue.com/', 'https://t.me/'), 'telegram')
})

test('sends any other referring site as its host', () => {
  assert.equal(
    detect('https://boards.laraue.com/', 'https://blog.example.com/post'),
    'blog.example.com',
  )
})

test('has no source for a direct visit or one from the site itself', () => {
  assert.isNull(detect('https://boards.laraue.com/'))
  assert.isNull(detect('https://boards.laraue.com/login', 'https://boards.laraue.com/'))
  assert.isNull(detect('https://boards.laraue.com/', 'not a url'))
})

test('keeps the first source a visitor came with', () => {
  const storage = memoryStorage()

  rememberSignUpSource(storage, 'productradar')
  rememberSignUpSource(storage, 'producthunt')
  rememberSignUpSource(storage, null)

  assert.equal(storage.items.get(signUpSourceStorageKey), 'productradar')
  assert.equal(readSignUpSource(storage), 'productradar')
})

test('reads no source when the browser store is blocked', () => {
  const blocked = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  }

  rememberSignUpSource(blocked, 'producthunt')

  assert.isNull(readSignUpSource(blocked))
})
