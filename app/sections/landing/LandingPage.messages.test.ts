import { describe, expect, it } from 'vitest'

import { landingMessages } from './LandingPage.messages'
import { useLandingText } from './useLandingText'

const placeholders = (message: string): string[] =>
  [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '').toSorted()

describe('landing messages', () => {
  it('has the same keys in every language', () => {
    expect(Object.keys(landingMessages.ru).toSorted()).toEqual(
      Object.keys(landingMessages.en).toSorted(),
    )
  })

  it('uses the same placeholders in every language', () => {
    const mismatched = Object.entries(landingMessages.en)
      .filter(
        ([key, message]) =>
          placeholders(message).join() !==
          placeholders(landingMessages.ru[key as keyof typeof landingMessages.ru]).join(),
      )
      .map(([key]) => key)

    expect(mismatched).toEqual([])
  })
})

describe('useLandingText', () => {
  it('returns the text of the requested language, not of the app locale', () => {
    expect(useLandingText('ru')('documentation')).toBe(landingMessages.ru.documentation)
    expect(useLandingText('en')('documentation')).toBe(landingMessages.en.documentation)
  })

  it('substitutes placeholders', () => {
    expect(useLandingText('en')('offer_tokens', { count: '1,000' })).toBe('1,000 tokens included')
  })
})
