import { afterEach, expect, test } from 'vitest'

import { useLocale } from '#layers/core/app/i18n/useI18n'

import { useErrorMessage } from './useErrorMessage'

afterEach(() => {
  useLocale().value = 'en'
})

test('maps known statuses to their message, any 5xx to a server error', () => {
  const errorMessage = useErrorMessage()
  expect(errorMessage(401)).toBe('Sign in to continue.')
  expect(errorMessage(403)).toBe('You do not have permission to do this.')
  expect(errorMessage(404)).toBe('Not found.')
  expect(errorMessage(409)).toBe('This conflicts with existing data.')
  expect(errorMessage(413)).toBe('The file is too large.')
  expect(errorMessage(429)).toBe('Too many requests. Try again shortly.')
  expect(errorMessage(500)).toBe('Server error. Try again.')
  expect(errorMessage(503)).toBe('Server error. Try again.')
  expect(errorMessage(0)).toBe('Could not reach the server. Check your connection.')
})

test('falls back to a generic message in the current language', () => {
  const errorMessage = useErrorMessage()
  expect(errorMessage(418)).toBe('Could not complete the request.')
  useLocale().value = 'ru'
  expect(errorMessage(418)).toBe('Не удалось выполнить запрос.')
})
