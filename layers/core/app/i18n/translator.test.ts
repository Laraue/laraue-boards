import { expect, test } from 'vitest'

import { createTranslator } from './translator'

const messages = {
  en: { apples: 'apple | apples', greeting: 'Hello, {name}', title: 'Boards' },
  ru: { apples: 'яблоко | яблока | яблок', greeting: 'Привет, {name}', title: 'Доски' },
}

test('translates, interpolates and pluralizes with the explicitly supplied language', () => {
  const en = createTranslator(messages, 'en')
  const ru = createTranslator(messages, 'ru')
  expect(en.t('greeting', { name: 'Ada' })).toBe('Hello, Ada')
  expect(ru.t('greeting', { name: 'Ada' })).toBe('Привет, Ada')
  expect(en.tp('apples', 2)).toBe('2 apples')
  expect(ru.tp('apples', 1)).toBe('1 яблоко')
  expect(ru.tp('apples', 2)).toBe('2 яблока')
  expect(ru.tp('apples', 5)).toBe('5 яблок')
  expect(en.t('title')).toBe('Boards')
})
