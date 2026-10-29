import { assert, test } from 'vitest'

import { useAvailableLocales, useI18n, useLocale } from '#layers/core/app/i18n/useI18n'

test('gets language choices and names from the module configuration', () => {
  const locale = useLocale()
  const available = useAvailableLocales()
  locale.value = 'en'
  assert.deepEqual(
    available.value.map(({ code, name }) => ({ code, name })),
    [{ code: 'ru', name: 'Русский' }],
  )
  locale.value = 'ru'
  assert.deepEqual(
    available.value.map(({ code, name }) => ({ code, name })),
    [{ code: 'en', name: 'English' }],
  )
  locale.value = 'en'
})

test('translates, interpolates and pluralizes English and Russian messages', () => {
  const { t, tp } = useI18n({
    en: {
      apples: 'apple | apples',
      greeting: 'Hello, {name}',
      title: 'Boards',
    },
    ru: {
      apples: 'яблоко | яблока | яблок',
      greeting: 'Привет, {name}',
      title: 'Доски',
    },
  })

  assert.equal(t('title'), 'Boards')
  assert.equal(t('greeting', { name: 'Ada' }), 'Hello, Ada')
  assert.equal(tp('apples', 2), '2 apples')

  useLocale().value = 'ru'

  assert.equal(t('title'), 'Доски')
  assert.equal(tp('apples', 5), '5 яблок')
})

test('translates with the passed locale instead of the app locale', () => {
  const messages = {
    en: { title: 'Boards' },
    ru: { title: 'Доски' },
  }

  useLocale().value = 'en'
  const { t: russian } = useI18n(messages, 'ru')
  assert.equal(russian('title'), 'Доски')

  useLocale().value = 'ru'
  const { t: english } = useI18n(messages, 'en')
  assert.equal(english('title'), 'Boards')
})

test('falls back to the app locale when no locale is passed', () => {
  const { t } = useI18n({
    en: { title: 'Boards' },
    ru: { title: 'Доски' },
  })

  useLocale().value = 'en'
  assert.equal(t('title'), 'Boards')

  useLocale().value = 'ru'
  assert.equal(t('title'), 'Доски')
})
